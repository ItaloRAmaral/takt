# Guias e repositórios oficiais da Anthropic: subagents, skills, plugins, hooks e GitHub Actions (estado em 20/10/2026)

Método: a documentação do Claude Code foi baixada em Markdown direto de `code.claude.com/docs/en/<página>.md` em 20/10/2026. Estrelas, datas e listas de diretórios vieram da API REST do GitHub (`api.github.com/repos/...`, sem autenticação) e de `raw.githubusercontent.com` no mesmo dia. Marcações usadas: **[FATO]** tem fonte; **[ESTIMATIVA]** é número derivado; **[PALPITE]** é opinião minha sem fonte direta.

---

## 1. O que a documentação oficial recomenda para subagents e skills?

### Takeaway
Para subagents, a doc pede quatro coisas: um subagent focado em uma única tarefa; uma `description` específica o bastante para o Claude delegar ao agente certo; só as tools necessárias; e o arquivo versionado no git. O revisor modelo da doc é read-only (`tools: Read, Grep, Glob, Bash`, sem Edit/Write). Para skills, o princípio central é a *progressive disclosure*: só nome e descrição ficam sempre no contexto, e o resto do conteúdo carrega quando a skill é usada. A doc pede ainda `SKILL.md` com menos de 500 linhas, referências a um nível de profundidade, descrição em terceira pessoa com o caso de uso principal primeiro, e `disable-model-invocation: true` para skills com efeitos colaterais (commit, deploy). Os custom slash commands foram **incorporados às skills**.

### Cited Findings

**Subagents (`.claude/agents/*.md`)**
- [FATO] Frontmatter YAML seguido de um system prompt em Markdown. "Only `name` and `description` are required." Campos com várias palavras usam camelCase, e "Claude Code ignores a field it doesn't recognize without reporting an error" (desde a v2.1.296, `claude --debug` aponta campos desconhecidos). — [Sub-agents: Frontmatter reference](https://code.claude.com/docs/en/sub-agents#frontmatter-reference)
- [FATO] Campos suportados em out/2026: `name` (≤256 caracteres, sem `:`, que fica reservado para `plugin:agente`), `description`, `tools` (se omitido, herda todas as tools), `disallowedTools`, `model` (`sonnet`, `opus`, `haiku`, `fable`, ID completo como `claude-opus-5-5`, ou `inherit`), `permissionMode` (`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`), `maxTurns`, `autoCompactWindow`, `skills` (pré-carrega o conteúdo inteiro da skill), `mcpServers`, `hooks`, `memory` (`user`/`project`/`local`), `background`, `omitClaudeMd`, `effort` (`low`…`max`), `isolation: worktree`, `color`, `initialPrompt`, `experimental.cacheTtl`. — [Sub-agents](https://code.claude.com/docs/en/sub-agents#frontmatter-reference)
- [FATO] Nos **subagents de plugin**, `permissionMode`, `mcpServers`, `hooks` e `initialPrompt` são ignorados. — [Sub-agents](https://code.claude.com/docs/en/sub-agents#frontmatter-reference)
- [FATO] Best practices citadas literalmente: "**Design focused subagents:** each subagent should excel at one specific task"; "**Write descriptions that single out one subagent:** … keep the combined set within the 15,000-token description budget"; "**Limit tool access:** grant only necessary permissions for security and focus"; "**Check into version control:** share project subagents with your team". — [Sub-agents: Example subagents](https://code.claude.com/docs/en/sub-agents#example-subagents)
- [FATO] Delegação automática: "To encourage proactive delegation, include phrases like 'use proactively' in your subagent's description field." — [Sub-agents: automatic delegation](https://code.claude.com/docs/en/sub-agents#understand-automatic-delegation)
- [FATO] Revisor read-only oficial de exemplo: "A read-only subagent that reviews code without modifying it … limited tool access that excludes Edit and Write". O exemplo usa `tools: Read, Grep, Glob, Bash`, `model: inherit` e saída priorizada em "Critical issues (must fix) / Warnings (should fix) / Suggestions". — [Sub-agents: Code reviewer](https://code.claude.com/docs/en/sub-agents#code-reviewer)
- [FATO] Para impedir que um revisor gere subagents quando o aninhamento está ativo: "omit `Agent` from its tools list or add it to `disallowedTools`". — [Sub-agents: nested](https://code.claude.com/docs/en/sub-agents#let-subagents-spawn-their-own-subagents)
- [FATO] Regra fina por hook dentro do subagent: o exemplo `db-reader` tem um `PreToolUse` que roda `validate-readonly-query.sh` e bloqueia SQL de escrita. — [Sub-agents: Conditional rules with hooks](https://code.claude.com/docs/en/sub-agents#conditional-rules-with-hooks)
- [FATO] Quando usar: subagent "when the task produces verbose output you don't need in your main context / you want to enforce specific tool restrictions / the work is self-contained and can return a summary". Conversa principal quando há muito vaivém, fases que compartilham contexto ou quando a latência importa. "Consider Skills instead when you want reusable prompts or workflows that run in the main conversation context". — [Sub-agents: Choose between subagents and main conversation](https://code.claude.com/docs/en/sub-agents#choose-between-subagents-and-main-conversation)
- [FATO] Built-ins: `Explore` ("fast, read-only agent … Write and Edit are denied") e `Plan` (read-only, usado no plan mode). — [Sub-agents: Built-in](https://code.claude.com/docs/en/sub-agents#built-in-subagents)
- [FATO] Escopo: subagents de projeto ficam em `.claude/agents/`, "Check them into version control"; existe também `memory: project` em `.claude/agent-memory/<nome>/`. — [Sub-agents](https://code.claude.com/docs/en/sub-agents#choose-the-subagent-scope)

**Skills (`SKILL.md`)**
- [FATO] "**Custom commands have been merged into skills.** A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way." As skills seguem o padrão aberto [Agent Skills](https://agentskills.io). — [Skills](https://code.claude.com/docs/en/skills)
- [FATO] Quando criar uma skill: "when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact. Unlike CLAUDE.md content, a skill's body loads only when it's used". — [Skills](https://code.claude.com/docs/en/skills)
- [FATO] Frontmatter: todos os campos são opcionais e só `description` é recomendado. Campos: `name`, `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths` (globs), `shell`, `metadata`. "the combined `description` and `when_to_use` text is truncated at 1,536 characters … Put the key use case first". — [Skills: Frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference)
- [FATO] `disable-model-invocation: true`: "Use this for workflows with side effects or that you want to control timing, like `/commit`, `/deploy` … You don't want Claude deciding to deploy because your code looks ready." — [Skills: Control who invokes a skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill)
- [FATO] Arquivos de apoio: estrutura `SKILL.md` + `reference.md` + `examples.md` + `scripts/helper.py` ("executed, not loaded"). "Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files." — [Skills: Add supporting files](https://code.claude.com/docs/en/skills#add-supporting-files)
- [FATO] Risco no `allowed-tools`: "Workspace trust doesn't gate this field … A skill can grant itself broad tool access, so review the `allowed-tools` of skills checked into a repository before you run Claude Code there." — [Skills: Pre-approve tools](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill)
- [FATO] Guia de autoria na plataforma: "Concise is key … The context window is a public good". Pede graus de liberdade ajustados à fragilidade da tarefa ("Narrow bridge with cliffs on both sides … exact instructions"). `name` com no máximo 64 caracteres, só minúsculas, números e hífens, de preferência no gerúndio (`processing-pdfs`). "**Always write in third person**. The description is injected into the system prompt". "Keep references one level deep from SKILL.md". "**Create evaluations BEFORE writing extensive documentation.**" Método "Claude A" (escreve a skill) / "Claude B" (testa a skill). — [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [FATO] Blog de engenharia: "Progressive disclosure is the core design principle that makes Agent Skills flexible and scalable". O nível 1 é nome e descrição no system prompt, o nível 2 é o corpo do SKILL.md e o nível 3 são os arquivos ligados, que carregam sob demanda. — [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

**Hooks (ex.: bloquear `git commit`)**
- [FATO] Um `PreToolUse` com `matcher: "Bash"` que sai com **exit 2** nega a chamada, e o stderr volta para o Claude. A alternativa é responder JSON com `hookSpecificOutput.permissionDecision: "deny"` e um `permissionDecisionReason`. O exemplo oficial é `block-rm-rf.sh`. — [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [FATO] "a hook that returns `permissionDecision: "deny"` blocks the tool even in `bypassPermissions` mode or with `--dangerously-skip-permissions`. `PreToolUse` hooks fire before any permission-mode check … This lets you enforce policy that users can't bypass". Ressalva: sem managed settings e sem login Team/Enterprise, um *mod* pode aprovar uma chamada que o hook bloqueou. — [Hooks guide: Hooks and permission modes](https://code.claude.com/docs/en/hooks-guide)
- [FATO] Handlers podem ser filtrados com `"if": "Bash(rm *)"` (sintaxe de permission rule). O plugin oficial `security-guidance` usa `"if": "Bash(git*commit*)"`. — [Hooks reference](https://code.claude.com/docs/en/hooks); [security-guidance hooks.json](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/security-guidance/hooks/hooks.json)
- [FATO] A alternativa por permissões é `permissions.deny: ["Bash(git commit *)", "Bash(git push *)"]`. A avaliação é "deny, then ask, then allow". **Porém** a doc avisa que uma regra Bash "isn't a security boundary around the program": `Bash(git push *)` **não** pega `git -C . push origin main`, `git -c push.default=current push …` nem `git 'push' origin main`. "To inspect the full command text with your own logic before it runs, use a PreToolUse hook." — [Permissions: What a Bash rule doesn't match](https://code.claude.com/docs/en/permissions)
- [FATO] Segurança de hooks: "Command hooks execute shell commands with your full user permissions". Em sessões `-p`/SDK, "hooks committed in a repository's `.claude/settings.json` run in a folder you've never trusted". As práticas pedidas são validar entradas, colocar variáveis entre aspas e usar caminhos absolutos com `$CLAUDE_PROJECT_DIR`. — [Hooks: Security considerations](https://code.claude.com/docs/en/hooks#security-considerations)

### Inferences
- [PALPITE] Para o Takt (regra de nunca fazer commit), o desenho mais robusto junta as duas camadas: uma regra `deny` (cobre a forma comum, com custo baixo) e um hook `PreToolUse` que normaliza o comando (pega `git -C`, `sh -c` etc.). Isso segue a própria recomendação da doc sobre os limites das regras Bash.
- [PALPITE] A doc agora trata `.claude/commands/` como legado compatível. Um repositório novo deveria criar workflows como skills (`.claude/skills/<nome>/SKILL.md`), com `disable-model-invocation: true` nos que têm efeito colateral.

### Gaps
- Não li a página inteira de hooks (269 KB). Os detalhes de eventos novos (ex.: `asyncRewake`, `PreModelSwitch`) ficaram de fora.
- A página `slash-commands` hoje redireciona para o conteúdo de skills. Não encontrei uma página separada de best practices de slash commands.

---

## 2. Quais plugins e agents oficiais existem (code review, security, testes, arquitetura, criação de skills) e como são estruturados?

### Takeaway
O marketplace oficial é **`anthropics/claude-plugins-official`**: 40 plugins internos em `/plugins`, 14 externos em `/external_plugins` e **315 entradas** no `marketplace.json`, que inclui parceiros. Também há o marketplace demo `claude-code-plugins` em `anthropics/claude-code/plugins` (13 plugins). Para review/segurança/arquitetura, os principais são `code-review`, `pr-review-toolkit`, `feature-dev`, `code-simplifier`, `security-guidance`, `claude-security`, `skill-creator`, `plugin-dev` e `hookify`. Os agents oficiais variam bastante no uso de `tools`: os do `feature-dev` restringem a tools read-only, os do `pr-review-toolkit` herdam tudo.

### Cited Findings

**Repositórios: dados ao vivo (API GitHub, 20/10/2026)**

| Repo | Stars | Último commit/push | Release | Issues abertas |
|---|---|---|---|---|
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 152.634 | 20/10/2026 | v2.1.305 (20/10/2026) | n/d |
| [anthropics/skills](https://github.com/anthropics/skills) | 182.473 | 09/10/2026 | sem releases | 410 |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 43.374 | 20/10/2026 | sem releases | 1.052 |
| [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) | 9.589 | 20/10/2026 | v1.0.255 (20/10/2026); tag flutuante `v1` | 480 |
| [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) | 6.458 | **11/02/2026** | sem releases | 52 |
| [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | 53.614 | 17/10/2026 | — | — |

Fonte de todas as linhas: `https://api.github.com/repos/<repo>` e `/commits`, `/releases`, `/search/issues`, consultados em 20/10/2026. [FATO]

**`anthropics/claude-plugins-official`** — [repo](https://github.com/anthropics/claude-plugins-official)
- [FATO] "Official, Anthropic-managed directory of high quality Claude Code Plugins". `/plugins` contém os "Internal plugins developed and maintained by Anthropic" e `/external_plugins` os "Third-party plugins from partners and the community". Instalação: `/plugin install {plugin-name}@claude-plugins-official`. Aviso no README: "Make sure you trust a plugin before installing … Anthropic does not control what MCP servers, files, or other software are included in plugins and cannot verify that they will work as intended or that they won't change." — [README](https://github.com/anthropics/claude-plugins-official/blob/main/README.md)
- [FATO] Estrutura padrão de um plugin: `.claude-plugin/plugin.json` (obrigatório), `.mcp.json`, `commands/`, `agents/`, `skills/`, `README.md`. O `name` é um slug imutável, e renomes vão para o mapa `renames`. — [README](https://github.com/anthropics/claude-plugins-official/blob/main/README.md)
- [FATO] Plugins internos (40): agent-sdk-dev, clangd-lsp, claude-code-setup, claude-md-management, claude-security, code-modernization, code-review, code-simplifier, commit-commands, csharp-lsp, cwc-makers, example-plugin, explanatory-output-style, feature-dev, frontend-design, gopls-lsp, hookify, jdtls-lsp, kotlin-lsp, learning-output-style, lua-lsp, math-olympiad, math-proof, mcp-server-dev, mcp-tunnels, php-lsp, playground, plugin-dev, pr-review-toolkit, project-artifact, pyright-lsp, ralph-loop, receipts, ruby-lsp, rust-analyzer-lsp, security-guidance, session-report, skill-creator, swift-lsp, typescript-lsp. Externos (14): asana, context7, discord, fakechat, firebase, github, gitlab, imessage, laravel-boost, linear, playwright, serena, telegram, terraform. — [API contents/plugins](https://api.github.com/repos/anthropics/claude-plugins-official/contents/plugins)
- [FATO] O `marketplace.json` lista 315 plugins, entre eles parceiros como coderabbit, greptile, sonarqube, aikido, jfrog, auth0, crowdstrike, 42crunch e mattpocock-skills. Owner: "Anthropic, support@anthropic.com". — [marketplace.json](https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json)

**`anthropics/claude-code/plugins` (marketplace demo `claude-code-plugins`)**
- [FATO] Diretórios: agent-sdk-dev, claude-opus-4-5-migration, code-review, commit-commands, explanatory-output-style, feature-dev, frontend-design, hookify, learning-output-style, plugin-dev, pr-review-toolkit, ralph-wiggum, security-guidance. — [claude-code/plugins](https://github.com/anthropics/claude-code/tree/main/plugins)
- [FATO] A doc o descreve como "the demo marketplace `claude-code-plugins`", no tier oficial. — [Plugins](https://code.claude.com/docs/en/plugins)
- [PALPITE] É um subconjunto mais antigo do `claude-plugins-official` (ex.: `ralph-wiggum` aparece lá como `ralph-loop`). Vale preferir o `claude-plugins-official`.

**Code review**
- [FATO] **`code-review`**: um único command, `commands/code-review.md`, com `allowed-tools` limitado a `Bash(gh issue view:*)`, `Bash(gh search:*)`, `Bash(gh issue list:*)`, `Bash(gh pr comment:*)`, `Bash(gh pr diff:*)`, `Bash(gh pr view:*)` e `Bash(gh pr list:*)`. O pipeline tem estas etapas:
  1. agentes **Haiku** checam se o PR é elegível, listam os CLAUDE.md e resumem o PR;
  2. **5 agentes Sonnet em paralelo** revisam aspectos distintos: aderência ao CLAUDE.md, bugs óbvios só no diff, git blame/histórico, comentários de PRs anteriores e conformidade com comentários do código;
  3. um agente Haiku por issue dá um score de confiança de 0 a 100, com rubrica fornecida "verbatim";
  4. issues com score **< 80** são descartadas;
  5. o resultado sai como comentário via `gh pr comment`, curto, sem emojis e com links.

  A lista de falsos positivos inclui "Pre-existing issues" e "Pedantic nitpicks". — [code-review.md](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-review/commands/code-review.md)
- [FATO] **`pr-review-toolkit`**: o command `/review-pr [review-aspects]` (`allowed-tools: Bash, Glob, Grep, Read, Task`) orquestra 6 agents: `code-reviewer` (`model: opus`), `silent-failure-hunter`, `pr-test-analyzer` (cobertura de testes), `type-design-analyzer`, `comment-analyzer` (todos `model: inherit`) e `code-simplifier`. **Nenhum desses agents declara `tools`**, então herdam todas as tools, inclusive Edit/Write. As descriptions são longas, com blocos `<example>` e o gatilho "should be used proactively". — [pr-review-toolkit/agents](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/pr-review-toolkit/agents)
- [FATO] **`code-simplifier`** (plugin próprio): agent com `model: opus`, "Focuses on recently modified code unless instructed otherwise", sem campo `tools`. — [code-simplifier.md](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md)
- [FATO] O Claude Code tem `/code-review` e `/security-review` built-in (skills/commands embutidos). — [Skills](https://code.claude.com/docs/en/skills); [Security](https://code.claude.com/docs/en/security)

**Arquitetura e planejamento**
- [FATO] **`feature-dev`**: o command `/feature-dev` é um fluxo em fases (Discovery, exploração do código, perguntas de esclarecimento, arquitetura, implementação, review). Princípios: "Ask clarifying questions … Wait for user answers before proceeding", "Understand before acting", "Use TodoWrite". Tem 3 agents, todos com `model: sonnet` e o **mesmo conjunto restrito e read-only** `tools: Glob, Grep, LS, Read, NotebookRead, WebFetch, TodoWrite, WebSearch, KillShell, BashOutput`:
  - `code-architect`: "implementation blueprints with specific files to create/modify, component designs, data flows, and build sequences";
  - `code-explorer`: traça caminhos de execução;
  - `code-reviewer`: "confidence-based filtering to report only high-priority issues".

  — [feature-dev](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev)

**Segurança**
- [FATO] **`security-guidance`** funciona só com hooks (sem agents) e tem três camadas:
  1. avisos por regex em `Edit`/`Write` para cerca de 25 padrões perigosos (`yaml.load`, `pickle.load`, `innerHTML`, segredos hardcoded…);
  2. revisão do diff por LLM no evento `Stop` (usa o Opus mais novo por padrão);
  3. revisão agêntica no `git commit`/`git push`, via SDK, com `Read`/`Grep`/`Glob` para pegar IDOR, auth bypass e SSRF entre arquivos.

  Os hooks são `SessionStart`, `UserPromptSubmit`, `PostToolUse` (`matcher: Edit|Write|MultiEdit|NotebookEdit` e `Bash` com `if: Bash(git*commit*)`, `asyncRewake: true`) e `Stop`. Requisitos: Claude Code ≥ v2.1.144 e Python 3.8+. Credenciais: login do Claude Code, API key ou Bedrock/Vertex/Foundry. Variáveis `SECURITY_REVIEW_MODEL` e `SG_AGENTIC_MODEL`. — [security-guidance README](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/security-guidance/README.md); [hooks.json](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/security-guidance/hooks/hooks.json)
- [FATO] **`claude-security`** é a versão local do produto hospedado [Claude Security](https://claude.com/product/claude-security), com 9 agents:
  - `claude-security`: orquestrador, `effort: xhigh`, roda só como agente principal via `claude --agent claude-security:claude-security` ("Never dispatch it as a subagent");
  - `scan-inventory`, `scan-researcher`, `scan-loader`, `scan-redactor`, `explore`;
  - `scan-verifier`: "Restricted read-only verifier … to vote on one candidate finding", `tools: Read, Glob, Grep, Bash, Agent(claude-security:explore)`;
  - `patch-generator`: trabalha num clone de rascunho e entrega arquivos de patch;
  - `patch-verifier`.

  Tem três jobs (scan do codebase, scan de mudanças, sugestão de patches), e a saída vai para `CLAUDE-SECURITY-<timestamp>/CLAUDE-SECURITY-RESULTS.md`. Recomenda Opus 5.5 ou Fable 5.1, e "portions of a scan may occasionally be downgraded to Opus 4.8". "adds no isolation of its own … If you are scanning a repository that you do not trust … run the whole session inside sandbox-runtime." — [claude-security README](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/claude-security/README.md)

**Criação de skills e plugins**
- [FATO] O plugin **`skill-creator`** (`skills/skill-creator`) existe no marketplace oficial. A skill `skill-creator` também está em `anthropics/skills/skills/`. — [plugins](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator); [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills)
- [FATO] **`plugin-dev`** e **`hookify`** existem nos dois marketplaces. Não consegui listar o conteúdo deles porque a API do GitHub atingiu o rate limit. — [claude-code/plugins](https://github.com/anthropics/claude-code/tree/main/plugins)

**`anthropics/skills`**
- [FATO] "Public repository for Agent Skills". Skills em out/2026: academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx. Também tem `./spec` (especificação Agent Skills) e `./template`. — [README](https://github.com/anthropics/skills/blob/main/README.md); [API](https://api.github.com/repos/anthropics/skills/contents/skills)
- [FATO] "Many skills in this repo are open source (Apache 2.0)". As skills de documentos (docx/pdf/pptx/xlsx) estão incluídas, mas fora do Apache. Disclaimer: "provided for demonstration and educational purposes only … Always test skills thoroughly". Funciona como marketplace: `/plugin marketplace add anthropics/skills`, depois `document-skills@anthropic-agent-skills` ou `example-skills@anthropic-agent-skills`. — [README](https://github.com/anthropics/skills/blob/main/README.md)
- [FATO] Issues relevantes: [#492](https://github.com/anthropics/skills/issues/492) "Security: Community skills distributed under anthropic/ namespace enable trust boundary abuse" (46 comentários, aberta); [#556](https://github.com/anthropics/skills/issues/556) "run_eval.py: claude -p never triggers skills/commands (0% trigger rate)" (aberta); [#338](https://github.com/anthropics/skills/issues/338) `quick_validate.py` deveria avisar sobre descrições sem aspas com caracteres especiais de YAML. — [GitHub search API](https://api.github.com/search/issues?q=repo:anthropics/skills+type:issue&sort=comments&order=desc)

**Críticas e problemas conhecidos dos marketplaces e plugins**
- [FATO] `claude-plugins-official` tem 1.052 issues abertas. Entre as mais discutidas: [#1272](https://github.com/anthropics/claude-plugins-official/issues/1272) (plugin aparece como "Published" mas não entra no diretório), [#587](https://github.com/anthropics/claude-plugins-official/issues/587) "cannot add anthropics/claude-plugins-official" (aberta) e [#50](https://github.com/anthropics/claude-plugins-official/issues/50) (falha de permission pattern no ralph-loop). — [GitHub search API](https://api.github.com/search/issues?q=repo:anthropics/claude-plugins-official+type:issue&sort=comments&order=desc)

### Inferences
- [PALPITE] O `feature-dev` é o modelo oficial mais próximo de um revisor/arquiteto read-only bem configurado (tools explícitas, sem Edit/Write/Bash). Os agents do `pr-review-toolkit` contrariam a best practice "Limit tool access" da própria doc, porque herdam todas as tools.
- [PALPITE] O padrão do `code-review` (muitos revisores baratos em paralelo, depois um score de confiança e um corte em 80) é o desenho oficial mais explícito contra falsos positivos e vale copiar.
- [ESTIMATIVA] O `claude-plugins-official` virou de fato um "app store": 315 entradas contra 40 plugins internos. A maior parte do catálogo, cerca de 87%, não é mantida pela Anthropic.

### Gaps
- Não li o conteúdo de `plugin-dev`, `hookify`, `claude-code-setup`, `claude-md-management` e `skill-creator` (plugin), por causa do rate limit de 60 requisições/hora da API sem autenticação.
- O prompt completo de cada agent não foi transcrito, só o frontmatter e o início.
- Estrelas e datas de cada plugin individual não se aplicam (são diretórios, não repositórios).

---

## 3. O que a orientação oficial diz sobre riscos de segurança (prompt injection via skills/plugins de terceiros, permissões, sandboxing, MCP)?

### Takeaway
A posição oficial é clara: um plugin instalado "can execute arbitrary code on your machine with your user privileges". Hooks, monitors, MCP/LSP servers e processos de mods **rodam fora do sandbox e fora das permission rules**. Skills, commands e agents entram no contexto como instruções. O nome do marketplace só identifica quem publica o catálogo, não garante a segurança de cada plugin. A Anthropic recomenda instalar skills e MCP só de fontes confiáveis, auditar o código, usar sandbox, dev container ou VM para conteúdo não confiável, e tomar cuidado com sessões `-p`/SDK, onde a verificação de workspace trust não acontece.

### Cited Findings
- [FATO] "A Claude Code plugin you install can execute arbitrary code on your machine with your user privileges." Componentes que rodam código: hooks, monitors, mods (JavaScript dentro do Claude Code), MCP e LSP servers, e `bin/` (entra no `PATH` do Bash). "Skills, commands, and agents: these enter Claude's context as instructions". Com auto-update ligado, "the files you reviewed can change on disk". — [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- [FATO] "Claude Code's permission rules and sandbox cover the tool calls Claude makes, not the code a plugin runs by itself … Claude Code runs hooks, monitors, MCP servers, LSP servers, and the processes a mod starts outside the sandbox." — [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- [FATO] Tiers de marketplace: Official (`claude-plugins-official`, `claude-code-plugins`, `anthropic-agent-skills`, `agent-skills`, `knowledge-work-plugins` e outros), Community (`claude-community`, `claude-plugins-community`, `healthcare`) e Third-party (todo o resto). "Claude Code accepts the official and community names only for marketplaces sourced from `github.com/anthropics/` repositories, so a third-party marketplace can't present itself as an Anthropic one." No `claude-community`, quase toda entrada é fixada a um commit SHA. — [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- [FATO] Passos de revisão recomendados: rodar `claude plugin marketplace list`; checar a seção **Will install** no `/plugin`; ler `hooks/hooks.json`, `.mcp.json` e todo o `bin/`; rodar `claude --plugin-dir <dir> plugin details <nome>` para ver o "Component inventory". — [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- [FATO] Skills: "malicious skills may introduce vulnerabilities in the environment where they're used or direct Claude to exfiltrate data and take unintended actions. We recommend installing skills only from trusted sources. When installing a skill from a less-trusted source, thoroughly audit it before use … paying particular attention to code dependencies and bundled resources like images or scripts". — [Engineering blog: Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [FATO] Prompt injection: as proteções são o permission system, a aprovação de comandos de rede (`curl`/`wget` não são auto-aprovados), o workspace trust dialog, a detecção de command injection e o fail-closed matching. As práticas pedidas: "Avoid piping untrusted content directly to Claude", "Use virtual machines (VMs) to run scripts and make tool calls, especially when interacting with external web services". Para mais isolamento, rodar o Claude Code inteiro no sandbox runtime ou num dev container, e auditar `/permissions` com frequência. — [Security](https://code.claude.com/docs/en/security)
- [FATO] MCP: "We encourage either writing your own MCP servers or using MCP servers from providers that you trust." A Anthropic revisa conectores contra critérios de listagem, mas "does not security-audit" esses conectores. Revisar o `.mcp.json` não basta, porque plugins e outros escopos também adicionam servers. — [Security: MCP security](https://code.claude.com/docs/en/security)
- [FATO] MCP inline em subagents de `.claude/agents/` só carrega depois do trust da pasta. Antes da v2.1.238, carregava sem checar. — [Sub-agents](https://code.claude.com/docs/en/sub-agents#trust-required-for-inline-mcp-servers)
- [FATO] O relatório final de cada subagent passa por um scan antes de chegar ao Claude, e imitações de `<system-reminder>`, `Human:` e menções a `bypassPermissions` são marcadas. Mas a doc avisa: "It isn't a substitute for restricting what a subagent can reach." — [Sub-agents: output scanning](https://code.claude.com/docs/en/sub-agents#subagent-output-scanning)
- [FATO] Em sessões `-p`/SDK, o trust dialog não aparece e os hooks do repositório rodam. A recomendação é revisar `.claude/`, usar `--bare` ou `--settings '{"disableAllHooks": true}'`. — [Hooks: Security considerations](https://code.claude.com/docs/en/hooks#security-considerations)
- [FATO] Segurança do código gerado: plugin `security-guidance`, comando `/security-review` e plugin `claude-security`. — [Security](https://code.claude.com/docs/en/security); [claude-security README](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/claude-security/README.md)

### Inferences
- [PALPITE] Para um repositório fechado como o do Takt, o risco maior não vem das skills oficiais. Vem de instalar plugins de parceiros ou da comunidade (com hooks/MCP que rodam fora do sandbox) e de rodar `claude -p` em CI sobre conteúdo de PR. Fixar versões (SHA), desligar o auto-update de marketplaces de terceiros e revisar `hooks.json` antes de instalar segue diretamente a doc.
- [PALPITE] A issue #492 do `anthropics/skills` sugere que a fronteira de confiança "namespace anthropic = confiável" não é perfeita, e a doc reforça isso ao dizer que o nome do marketplace só indica quem publica o catálogo.

### Gaps
- Não li a página `/docs/en/sandboxing` (94 KB) em detalhe: os limites de rede e de sistema de arquivos e o suporte a WSL não foram verificados.
- Não encontrei um advisory público ou CVE específico sobre plugins/skills maliciosos no ecossistema oficial. Também não fiz uma busca dedicada.

---

## 4. Como funcionam as GitHub Actions (claude-code-action, claude-code-security-review) em repositórios privados; custos e requisitos?

### Takeaway
A `claude-code-action@v1` é a action ativa e mantida (release v1.0.255 em 20/10/2026). Ela funciona em qualquer repositório do github.com, privado inclusive. A autenticação é feita por `ANTHROPIC_API_KEY`, por `CLAUDE_CODE_OAUTH_TOKEN` (planos Pro/Max/Team/Enterprise), por OIDC/workload identity federation ou por Bedrock/Vertex/Foundry. Há dois custos: minutos do GitHub Actions e tokens da API (ou a assinatura, se usar OAuth). A `claude-code-security-review` existe, mas o último commit é de 11/02/2026, o modelo padrão é antigo (Opus 4.1) e o README avisa que ela não é protegida contra prompt injection.

### Cited Findings

**claude-code-action** — [repo](https://github.com/anthropics/claude-code-action) (9.589 stars; commit e release v1.0.255 em 20/10/2026; 480 issues abertas)
- [FATO] Setup rápido com `/install-github-app`, que precisa do `gh` autenticado e só funciona em github.com (GitLab e Bitbucket ficam fora). Ele instala o Claude GitHub App, grava o secret `ANTHROPIC_API_KEY` ou `CLAUDE_CODE_OAUTH_TOKEN` e abre um PR com `claude.yml` (e, se você escolher, `claude-code-review.yml`). — [GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [FATO] Setup manual: instalar o app, adicionar o secret e copiar [examples/claude.yml](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml). Usa `uses: anthropics/claude-code-action@v1` com `anthropic_api_key` ou `claude_code_oauth_token`. Para várias repos, a doc prefere API key do Console, porque "an OAuth token is tied to the subscription of the person who ran `claude setup-token`". Também há OIDC, que exige `id-token: write`. — [GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [FATO] Ao instalar o app, você aceita o conjunto inteiro de permissões ("GitHub doesn't let you accept a subset"). Quem quiser o mínimo pode criar um GitHub App próprio com Contents, Issues e Pull requests. — [GitHub Actions: GitHub App permissions](https://code.claude.com/docs/en/github-actions)
- [FATO] Custos: "**GitHub Actions minutes**: the Claude Code GitHub Action runs on GitHub-hosted runners" e "**API tokens** … If you authenticate with an OAuth token, runs use your Claude subscription instead of API billing." Mitigações: `--max-turns` em `claude_args`, timeouts de workflow, controles de concurrency e um `CLAUDE.md` conciso ("Claude reads it on every run"). — [GitHub Actions: Manage costs](https://code.claude.com/docs/en/github-actions)
- [FATO] Segurança da action:
  - só usuários com **write access** disparam a action; bots são bloqueados por padrão (`allowed_bots`);
  - `allowed_non_write_users` é "a significant security risk", e mesmo com scrub de secrets e bubblewrap "reduces but does not eliminate prompt injection risk";
  - o token é de curta duração, limitado ao repositório e sem acesso a outros repositórios;
  - com `pull_request_target`/`workflow_run`, "**Do not check out an untrusted ref into the workspace root before this action**".

  — [docs/security.md](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)
- [FATO] Issues mais discutidas: [#443](https://github.com/anthropics/claude-code-action/issues/443) "Workflow validation failed" em reusable workflow (53 comentários, aberta); [#74](https://github.com/anthropics/claude-code-action/issues/74) "Claude does not understand that it does have the correct bash permissions" (aberta); [#641](https://github.com/anthropics/claude-code-action/issues/641) falsos banimentos em loops intensos de PR review (fechada); [#251](https://github.com/anthropics/claude-code-action/issues/251) "Failed to create workflow file" (aberta). — [GitHub search API](https://api.github.com/search/issues?q=repo:anthropics/claude-code-action+type:issue&sort=comments&order=desc)

**claude-code-security-review** — [repo](https://github.com/anthropics/claude-code-security-review) (6.458 stars; **último commit em 11/02/2026**; sem releases; 52 issues abertas)
- [FATO] "An AI-powered security review GitHub Action using Claude to analyze code changes for security vulnerabilities". Faz scan só do diff do PR, comenta no PR e filtra falsos positivos, excluindo por padrão DoS, rate limiting, exaustão de memória/CPU, validação genérica e open redirect. Uso: `uses: anthropics/claude-code-security-review@main` com `permissions: pull-requests: write, contents: read`. — [README](https://github.com/anthropics/claude-code-security-review/blob/main/README.md)
- [FATO] Inputs: `claude-api-key` (obrigatório; "needs to be enabled for both the Claude API and Claude Code usage"), `comment-pr`, `upload-results`, `exclude-directories`, `claude-model` (**padrão `claude-opus-4-1-20250805`**), `claudecode-timeout` (20 min), `run-every-commit`, `false-positive-filtering-instructions` e `custom-security-scan-instructions`. Código em Python (`claudecode/github_action_audit.py`, `prompts.py`, `findings_filter.py`, `evals/`). — [README](https://github.com/anthropics/claude-code-security-review/blob/main/README.md)
- [FATO] "This action is not hardened against prompt injection attacks and should only be used to review trusted PRs." — [README](https://github.com/anthropics/claude-code-security-review/blob/main/README.md)
- [FATO] Issues: [#4](https://github.com/anthropics/claude-code-security-review/issues/4) "Amazon Bedrock authentication support" (aberta desde 08/2025); [#7](https://github.com/anthropics/claude-code-security-review/issues/7) "Use release instead of main tag" (fechada, mas o repo continua sem releases); [#75](https://github.com/anthropics/claude-code-security-review/issues/75) "Bash command failed" (aberta). — [GitHub search API](https://api.github.com/search/issues?q=repo:anthropics/claude-code-security-review+type:issue&sort=comments&order=desc)
- [FATO] Post de anúncio: [Automate security reviews with Claude Code](https://www.anthropic.com/news/automate-security-reviews-with-claude-code) (referenciado no README; não reli o post).

### Inferences
- [ESTIMATIVA] A `claude-code-security-review` parece em manutenção mínima: 8 meses sem commits, modelo padrão de 2025, sem releases e uso via `@main`. A doc de segurança de out/2026 aponta para `security-guidance`, `/security-review` e `claude-security`, e não cita essa action. Em out/2026, o caminho oficial de review de segurança em CI parece ser a `claude-code-action` com uma skill (`/security-review` ou o plugin), não esta action.
- [PALPITE] Em repositório privado sem forks externos, o risco de prompt injection via PR cai muito, porque só quem tem write access dispara a action. Para o Takt (repositório fechado, ver PDR-0017), uma API key do Console é melhor que um OAuth token pessoal. Com OAuth, as execuções consomem a cota da assinatura de quem gerou o token.
- [PALPITE] Fixar `@v1` (tag flutuante) recebe atualizações quase diárias. Para reprodutibilidade, dá para fixar `@v1.0.x` ou um SHA.

### Gaps
- Não encontrei números oficiais de custo médio por execução (tokens ou dólares por PR) para nenhuma das duas actions.
- Não verifiquei se a `claude-code-security-review` aceita `CLAUDE_CODE_OAUTH_TOKEN`. O README só lista `claude-api-key`.
- Não li `docs/setup.md` nem a página `github-actions-cloud-providers` (Bedrock/Vertex/Foundry).
