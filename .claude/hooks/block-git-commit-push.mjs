// PreToolUse hook for Bash: blocks git commands that create commits, move refs or publish (CLAUDE.md, "How we work").
// Exit code 2 blocks the tool call and sends stderr back to Claude.
import { readFileSync } from 'node:fs';

const BLOCKED_SUBCOMMANDS = ['commit', 'push', 'merge', 'rebase', 'cherry-pick', 'revert', 'am', 'tag'];

const MESSAGE = [
  `Blocked by project rule: Claude never runs git ${BLOCKED_SUBCOMMANDS.join(', ')} (CLAUDE.md, "How we work").`,
  'Instead, give the user the Conventional Commits message and the exact list of files to stage.',
].join('\n');

const arg = String.raw`(?:"[^"]*"|'[^']*'|[^\s;&|()]+)`;
const globalOption = String.raw`(?:-[Cc]\s+${arg}|--?[\w-]+(?:=${arg})?)`;
const pattern = new RegExp(
  String.raw`(?:^|[\s;&|(\x60'"])(?:\S*/)?git(?:\s+${globalOption})*\s+(?:${BLOCKED_SUBCOMMANDS.join('|')})(?=$|[\s;&|)\x60'"])`,
);

let command = '';
try {
  command = JSON.parse(readFileSync(0, 'utf8')).tool_input?.command ?? '';
} catch {
  process.exit(0);
}

if (pattern.test(command)) {
  process.stderr.write(MESSAGE);
  process.exit(2);
}
