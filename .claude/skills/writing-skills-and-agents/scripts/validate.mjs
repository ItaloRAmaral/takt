// Structural validator for Takt skills (.claude/skills/<name>/) and subagents (.claude/agents/<name>.md).
// Usage: node .claude/skills/writing-skills-and-agents/scripts/validate.mjs <skill-dir | agent-file> [...]
// Errors fail (exit 1); warnings need the author's judgment and never fail.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_CHARS = 64;
const MAX_TRIGGER_CHARS = 1536;
const MAX_SKILL_LINES = 500;
const HIDDEN_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF\u{E0000}-\u{E007F}]/u;
const ABSOLUTE_HOST_PATH = /(?:^|[\s`'"(])(?:\/home\/|\/Users\/|[A-Z]:\\)/m;
const LOCAL_REFERENCE = /(?<![\w./-])((?:references|scripts|assets)\/[\w./-]+\.\w+|SPEC\.md|SOURCES\.md)(?![\w./-])/g;
const FIRST_PERSON = /^(?:I|I'm|I'll|We|You)\b/;

function display(path) {
  const rel = relative(process.cwd(), path);
  return rel.startsWith('..') ? path : rel;
}

function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;

  const fields = {};
  let key = null;
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
    if (match) {
      key = match[1];
      fields[key] = match[2].trim().replace(/^[>|][+-]?$/, '');
    } else if (key && /^\s/.test(line)) {
      fields[key] = `${fields[key]} ${line.trim()}`.trim();
    }
  }
  for (const [name, value] of Object.entries(fields)) {
    fields[name] = value.replace(/^(['"])(.*)\1$/, '$2');
  }
  return { fields, bodyStart: end + 1 };
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function checkName(name, expected, report) {
  if (!name) return report.error('frontmatter has no "name"');
  if (name !== expected) report.error(`name "${name}" must equal "${expected}"`);
  if (!NAME_PATTERN.test(name)) report.error(`name "${name}" must use lowercase letters, digits and hyphens`);
  if (name.length > MAX_NAME_CHARS) report.error(`name is longer than ${MAX_NAME_CHARS} characters`);
}

function checkDescription(fields, report) {
  const description = fields.description ?? '';
  if (!description) return report.error('frontmatter has no "description"');
  if (FIRST_PERSON.test(description)) report.warn('description should be in third person');
  const triggerChars = description.length + (fields.when_to_use ?? '').length;
  if (triggerChars > MAX_TRIGGER_CHARS) {
    report.error(`description + when_to_use have ${triggerChars} characters; Claude Code truncates at ${MAX_TRIGGER_CHARS}`);
  }
}

function checkText(path, text, report) {
  const where = display(path);
  if (HIDDEN_CHARS.test(text)) report.error(`${where} contains invisible Unicode characters`);
  if (ABSOLUTE_HOST_PATH.test(text)) report.warn(`${where} contains an absolute host path`);
}

function validateSkill(dir, report) {
  const skillFile = join(dir, 'SKILL.md');
  if (!existsSync(skillFile)) return report.error('SKILL.md not found');

  const text = readFileSync(skillFile, 'utf8');
  const frontmatter = parseFrontmatter(text);
  if (!frontmatter) return report.error('SKILL.md must start with a "---" frontmatter block');

  checkName(frontmatter.fields.name, basename(dir), report);
  checkDescription(frontmatter.fields, report);
  if (frontmatter.fields['allowed-tools']) {
    report.warn('allowed-tools is not gated by workspace trust; keep it to exact, necessary commands');
  }

  const lineCount = text.split(/\r?\n/).length;
  if (lineCount > MAX_SKILL_LINES) report.warn(`SKILL.md has ${lineCount} lines; keep it under ${MAX_SKILL_LINES}`);

  const linked = new Set([...text.matchAll(LOCAL_REFERENCE)].map((match) => match[1]));
  for (const path of linked) {
    if (!existsSync(join(dir, path))) report.error(`SKILL.md links to missing file ${path}`);
  }

  const references = listFiles(join(dir, 'references'));
  for (const path of references) {
    const rel = relative(dir, path).split('\\').join('/');
    if (rel.split('/').length > 2) report.warn(`${rel} is nested; keep references one level deep`);
    if (!linked.has(rel)) report.error(`${rel} is not listed in SKILL.md`);
  }

  if (!existsSync(join(dir, 'SOURCES.md'))) report.error('SOURCES.md not found');
  const hasSupportFiles = references.length > 0 || listFiles(join(dir, 'scripts')).length > 0;
  if (hasSupportFiles && !existsSync(join(dir, 'SPEC.md'))) {
    report.error('SPEC.md is required when the skill has references/ or scripts/');
  }

  for (const path of listFiles(dir).filter((file) => file.endsWith('.md'))) {
    checkText(path, readFileSync(path, 'utf8'), report);
  }
}

function validateAgent(file, report) {
  const text = readFileSync(file, 'utf8');
  const frontmatter = parseFrontmatter(text);
  if (!frontmatter) return report.error('agent file must start with a "---" frontmatter block');

  const name = basename(file, '.md');
  checkName(frontmatter.fields.name, name, report);
  checkDescription(frontmatter.fields, report);
  if (!frontmatter.fields.tools) report.warn('no "tools" field: the agent inherits every tool, including Edit and Write');

  const notesDir = join(dirname(dirname(file)), 'agent-notes', name);
  if (!existsSync(join(notesDir, 'SOURCES.md'))) {
    report.error(`${display(notesDir)}/SOURCES.md not found`);
  }
  checkText(file, text, report);
}

function validate(target) {
  const errors = [];
  const warnings = [];
  const report = { error: (message) => errors.push(message), warn: (message) => warnings.push(message) };

  if (!existsSync(target)) report.error('path not found');
  else if (statSync(target).isDirectory()) validateSkill(target, report);
  else if (target.endsWith('.md')) validateAgent(target, report);
  else report.error('expected a skill directory or an agent .md file');

  return { target, errors, warnings };
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  process.stderr.write('usage: node validate.mjs <skill-dir | agent-file> [...]\n');
  process.exit(2);
}

const results = targets.map(validate);
for (const { target, errors, warnings } of results) {
  process.stdout.write(`${target}: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  for (const message of errors) process.stdout.write(`  ERROR ${message}\n`);
  for (const message of warnings) process.stdout.write(`  WARN  ${message}\n`);
}
process.exit(results.some((result) => result.errors.length > 0) ? 1 : 0);
