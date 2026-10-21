# Agentes, skills, plugins e slash commands da comunidade para TESTES e ARQUITETURA/DOCUMENTAÇÃO no Claude Code (estado em 20/out/2026)

Convenções destas notas:
- **Fato**: vem com fonte. Stars e datas de "último push" foram lidos **ao vivo pela GitHub API (`gh api repos/...`) em 2026-10-20**, salvo indicação. O link da fonte é o próprio repositório.
- **Estimativa**: número ou juízo derivado de dados, marcado como tal.
- **Palpite**: opinião minha sem fonte direta, marcado como tal.
- "Último push" (`pushed_at`) indica atividade, mas não garante release nova.

---

## 1. Quais itens são mais referenciados? (verificação de existência, stars, datas, autor, estrutura)

### Takeaway
Todos os itens citados na pergunta existem e estão ativos em out/2026. Os maiores em stars são obra/superpowers (~302k), mattpocock/skills (~298k), github/spec-kit (~142k), Fission-AI/OpenSpec (~72k) e bmad-code-org/BMAD-METHOD (~54k). Em testes, o item mais "oficial" e mais adotado é o conjunto Playwright Test Agents (planner/generator/healer), que vem com o próprio Playwright desde a 1.56 (out/2025). Ferramentas de ADR (adr-tools, log4brains) estão paradas desde 2024 e não têm integração própria com Claude. A integração com Claude para ADR vem de skills genéricas, como a `architecture-decision-records` do wshobson/agents.

### Cited Findings

#### 1.1 Tabela-resumo (stars e push lidos ao vivo em 2026-10-20)

| Item | Autor | Stars | Último push | Categoria |
|---|---|---|---|---|
| [obra/superpowers](https://github.com/obra/superpowers) | Jesse Vincent | 302.554 | 2026-10-20 | TDD, planning, skills-creator |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Matt Pocock | 298.535 | 2026-10-19 | TDD, arquitetura, spec |
| [anthropics/skills](https://github.com/anthropics/skills) (oficial, só referência) | Anthropic | 182.473 | 2026-10-09 | skill-creator, webapp-testing |
| [github/spec-kit](https://github.com/github/spec-kit) | GitHub | 142.123 | 2026-10-20 | SDD |
| [microsoft/playwright](https://github.com/microsoft/playwright) | Microsoft | 98.163 | 2026-10-20 | E2E + Test Agents |
| [tt-a1i/archify](https://github.com/tt-a1i/archify) | tt-a1i | 86.353 | 2026-10-20 | diagramas de arquitetura |
| [ruvnet/ruflo](https://github.com/ruvnet/ruflo) (antigo claude-flow) | ruvnet | 77.749 | 2026-10-20 | orquestração |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | Composio | 77.519 | 2026-09-18 | lista |
| [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | Fission AI | 72.543 | 2026-10-20 | SDD |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | hesreallyhim | 56.097 | 2026-10-20 | lista |
| [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | BMad Code | 54.377 | 2026-10-20 | SDD/agile |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) (oficial) | Anthropic | 43.374 | 2026-10-20 | marketplace |
| [wshobson/agents](https://github.com/wshobson/agents) | Seth Hobson | 41.242 | 2026-10-19 | marketplace de plugins/agentes |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Microsoft | 38.430 | 2026-10-19 | MCP de browser |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | VoltAgent | 36.068 | 2026-10-20 | lista |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | Alireza Rezvani | 28.441 | 2026-08-30 | coleção grande |
| [eyaltoledano/claude-task-master](https://github.com/eyaltoledano/claude-task-master) | Eyal Toledano | 28.255 | 2026-04-28 | tasks/planning |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | VoltAgent | 25.895 | 2026-10-11 | subagents |
| [SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) | SuperClaude Org | 23.905 | 2026-09-27 | framework de comandos |
| [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | Vitest | 17.266 | 2026-10-20 | runner |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | travisvn | 15.483 | 2026-04-28 | lista (parada desde abril) |
| [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | Microsoft | 14.422 | 2026-10-19 | CLI para agentes |
| [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) | Jeff Allan | 11.961 | 2026-10-16 | skills full-stack (nestjs-expert etc.) |
| [SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser) | Sawyer Hood | 6.678 | 2026-10-18 | browser para auto-verificação |
| [npryce/adr-tools](https://github.com/npryce/adr-tools) | Nat Pryce | 5.735 | **2024-04-25** | ADR CLI (parado) |
| [kirodotdev/Kiro](https://github.com/kirodotdev/Kiro) | AWS/Kiro | 4.384 | 2026-10-18 | IDE com specs (issues/docs) |
| [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) | Pimzino | 3.859 | **2025-09-07** | specs estilo Kiro (parado) |
| [gotalab/cc-sdd](https://github.com/gotalab/cc-sdd) | gotalab | 3.727 | 2026-10-13 | specs estilo Kiro |
| [davepoon/buildwithclaude](https://github.com/davepoon/buildwithclaude) (antigo claude-code-subagents-collection) | Dave Poon | 3.662 | 2026-10-20 | hub |
| [stryker-mutator/stryker-js](https://github.com/stryker-mutator/stryker-js) | Stryker | 3.256 | 2026-10-10 | mutation testing |
| [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) | lackeyjb | 3.222 | 2026-10-01 | skill Playwright |
| [wshobson/commands](https://github.com/wshobson/commands) | Seth Hobson | 2.641 | 2026-09-30 | **arquivado**, foi substituído por wshobson/agents |
| [adr/madr](https://github.com/adr/madr) | ADR org | 2.572 | 2026-08-28 | template de ADR |
| [nizos/tdd-guard](https://github.com/nizos/tdd-guard) | Nizar Selander (nizos) | 2.363 | 2026-10-12 | TDD via hooks |
| [iannuttall/claude-agents](https://github.com/iannuttall/claude-agents) | Ian Nuttall | 2.040 | 2025-07-25 | **arquivado** |
| [lst97/claude-code-sub-agents](https://github.com/lst97/claude-code-sub-agents) | lst97 | 1.698 | **2025-08-15** | subagents (parado) |
| [thomvaill/log4brains](https://github.com/thomvaill/log4brains) | Thomas Vaillant | 1.603 | **2024-12-17** | ADR site (parado) |
| [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace) | Jesse Vincent | 1.303 | 2026-10-10 | marketplace |
| [0xfurai/claude-code-subagents](https://github.com/0xfurai/claude-code-subagents) | 0xfurai | 1.019 | **2025-10-15** | subagents (parado) |
| [evanklem/evanflow](https://github.com/evanklem/evanflow) | evanklem | 418 | 2026-05-13 | TDD loop |
| [athola/claude-night-market](https://github.com/athola/claude-night-market) | athola | 342 | 2026-10-16 | TDD hooks + SDD |
| [nizos/probity](https://github.com/nizos/probity) | nizos | 232 | 2026-10-12 | sucessor do tdd-guard |

Todos os valores acima vêm do GitHub API ao vivo. As fontes são os links de cada linha.

Alerta sobre os números: superpowers (~302k), mattpocock/skills (~298k) e archify (~86k) têm contagens muito altas para repositórios de skills. O dado ao vivo é esse, mas **não verifiquei se há inflação artificial de stars**. Trate stars como sinal fraco de qualidade (palpite).

#### 1.2 TESTES: itens individuais

**obra/superpowers: skill `test-driven-development`** ([repo](https://github.com/obra/superpowers), [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md))
- Fato: plugin `superpowers` v7.0.0, autor Jesse Vincent, licença MIT. O `plugin.json` descreve o plugin como "Core skills library for Claude Code: TDD, debugging, collaboration patterns". Release v7.0.0 em 2026-10-10. — [plugin.json](https://github.com/obra/superpowers/blob/main/.claude-plugin/plugin.json)
- Fato: o diretório `skills/` contém brainstorming, writing-plans, executing-plans, subagent-driven-development, test-driven-development, systematic-debugging, verification-before-completion, requesting/receiving-code-review, using-git-worktrees, writing-skills e outras. — [repo](https://github.com/obra/superpowers/tree/main/skills)
- Fato (estrutura): o frontmatter tem só `name` e `description` ("Use when implementing any feature or bugfix, before writing implementation code"). Não define tools nem model. O skill traz uma "Iron Law": `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST`, e manda apagar o código escrito antes do teste ("Delete means delete"). Tem um diagrama DOT do ciclo red→verify red→green→verify green→refactor, exemplos `<Good>`/`<Bad>` em TypeScript, a etapa "Verify RED - MANDATORY", uma tabela "Common Rationalizations" (desculpa vs realidade), uma lista "Red Flags - STOP and Start Over" e uma referência anexa `writing-good-tests.md`. — [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)
- Fato: o skill recomenda "Real code (no mocks unless unavoidable)" e "Assert on real behavior, never on mock behavior". — mesmo arquivo
- Fato: o mesmo repo traz `writing-skills`, um skill-creator que aplica TDD à escrita de skills: cria "pressure scenarios" com subagents, observa o agente falhar sem o skill, escreve o skill e fecha brechas. — [writing-skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md)
- Fato: origem pública no post "Superpowers: How I'm using coding agents in October 2025", discutido no HN. — [HN 45547344](https://news.ycombinator.com/item?id=45547344)

**wshobson/agents: `tdd-orchestrator` e `test-automator`** ([repo](https://github.com/wshobson/agents))
- Fato: o repo agora se descreve como "Multi-harness agentic plugin marketplace for Claude Code, Codex, Cursor, OpenCode, GitHub Copilot, Google Antigravity, and Pi". O antigo `wshobson/commands` está arquivado e foi substituído por ele. — [repo](https://github.com/wshobson/agents), [wshobson/commands](https://github.com/wshobson/commands)
- Fato: `plugins/backend-development/agents/tdd-orchestrator.md` usa `name: backend-development-tdd-orchestrator` e `model: opus`, sem campo `tools` (herda todas). A description diz "Master TDD orchestrator ... Use PROACTIVELY". O corpo tem 183 linhas, quase todas listas de capacidades: Chicago/London school, ATDD, BDD, "Hexagonal architecture TDD with ports and adapters testing", "Machine learning for test prioritization". Existe também um plugin `tdd-workflows`. — [tdd-orchestrator.md](https://github.com/wshobson/agents/blob/main/plugins/backend-development/agents/tdd-orchestrator.md)
- Fato: `test-automator.md` usa `model: sonnet`, tem 41 linhas e um fluxo "Detect → Analyze → Design → Write → Verify → Report", com unit/integration/E2E e "Coverage gap analysis". — [test-automator.md](https://github.com/wshobson/agents/blob/main/plugins/backend-development/agents/test-automator.md)
- Fato: `developer-essentials/skills/e2e-testing-patterns` existe no mesmo repo. — [árvore do repo](https://github.com/wshobson/agents/tree/main/plugins/developer-essentials/skills/e2e-testing-patterns)

**VoltAgent/awesome-claude-code-subagents: `test-automator`, `qa-expert`, `architect-reviewer`** ([repo](https://github.com/VoltAgent/awesome-claude-code-subagents))
- Fato: `categories/04-quality-security/test-automator.md` declara `tools: Read, Write, Edit, Bash, Glob, Grep` e `model: sonnet`. A primeira instrução é "Query context manager for application architecture...". Essa instrução depende de um agente "context manager" que não existe no Claude Code padrão. — [test-automator.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/04-quality-security/test-automator.md)
- Fato: `architect-reviewer.md` declara `tools: Read, Write, Edit, Bash, Glob, Grep` e `model: inherit`. — [architect-reviewer.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/04-quality-security/architect-reviewer.md)
- Inferência: um *reviewer* com Write/Edit contraria o princípio de menor privilégio (ver Inferences).

**mattpocock/skills: `tdd`** ([SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md))
- Fato: o frontmatter tem `name: tdd` e a description "Use when the user wants to build features or fix bugs test-first, mentions 'red-green-refactor', or wants integration tests". O skill manda ler `GLOSSARY.md` para que "test names and interface vocabulary match the project's domain language" e "respect ADRs in the area you're touching". — mesmo link
- Fato: conceito de **seams**: "Test only at pre-agreed seams. Before writing any test, write down the seams under test and confirm them with the user." O skill lista anti-patterns: "Implementation-coupled", "Tautological" (por exemplo `expect(add(a,b)).toBe(a+b)`; os valores esperados devem vir "from an independent source of truth: ... the spec") e "Horizontal slicing" (escrever todos os testes primeiro). Recomenda "vertical slices / tracer bullet". — mesmo link
- Fato: anexos `tests.md` e `mocking.md`. O skill reutiliza `codebase-design` como vocabulário comum (module, interface, depth, seam, adapter, leverage, locality). — mesmo link

**nizos/tdd-guard e nizos/probity** ([tdd-guard](https://github.com/nizos/tdd-guard), [probity](https://github.com/nizos/probity))
- Fato: o TDD Guard "blocks implementation without failing tests", "Prevents code beyond current test requirements" e tem "Lint Integration". Suporta Vitest, Jest, Storybook, pytest, PHPUnit, Go, Rust, RSpec e Minitest. Exige Node 22+. Instalação: `/plugin marketplace add nizos/tdd-guard` → `/plugin install tdd-guard@tdd-guard` → `/tdd-guard:setup`. — [README](https://github.com/nizos/tdd-guard)
- Fato: o README avisa que o TDD Guard "grew into Probity: the same TDD enforcement, now for Claude Code, Codex, and GitHub Copilot CLI ... no test reporters to set up. New projects should start there." — [README](https://github.com/nizos/tdd-guard)
- Fato (risco documentado pelo próprio autor): se o shell estiver auto-aprovado, o agente pode contornar o hook com `echo`, `printf`, `sed`, `awk` ou `perl`. O autor recomenda `permissions.deny` para esses comandos e para `Read(.claude/tdd-guard/**)`. — [docs/enforcement.md](https://github.com/nizos/tdd-guard/blob/main/docs/enforcement.md)
- Fato: o modelo validador é configurável ("Choose faster or more capable models"). Cada edição passa por uma chamada extra de LLM. — [README](https://github.com/nizos/tdd-guard)

**Playwright Test Agents (planner, generator, healer)**: Microsoft, embutidos no pacote `playwright`
- Fato: introduzidos na **Playwright 1.56**, com release v1.56.0 publicada em 2025-10-06. A versão mais recente é v1.64.1, de 2026-10-14. — [release notes](https://github.com/microsoft/playwright/blob/main/docs/src/release-notes-js.md), [GitHub releases](https://github.com/microsoft/playwright/releases)
- Fato: o comando de geração é `npx playwright init-agents --loop=claude`. Também há `--loop=vscode`, `--loop=codex` e `--loop=opencode`. As definições "should be regenerated whenever Playwright is updated". — [docs fonte test-agents-js.md](https://github.com/microsoft/playwright/blob/main/docs/src/test-agents-js.md), [playwright.dev/docs/test-agents](https://playwright.dev/docs/test-agents)
- Fato: o **planner** explora o app e gera um plano em Markdown em `specs/`. Recebe o pedido, um **seed test** (`seed.spec.ts`) e, opcionalmente, um PRD. O **generator** transforma o plano em testes em `tests/` e valida seletores e asserts contra o app ao vivo. O **healer** roda a suíte, reproduz falhas, procura elementos equivalentes, propõe um patch e roda de novo "until it passes or until guardrails stop the loop". — [playwright.dev](https://playwright.dev/docs/test-agents)
- Fato: a página avisa que o healer pode marcar um teste como skip se concluir que a funcionalidade está quebrada. — [playwright.dev](https://playwright.dev/docs/test-agents)
- Fato (estrutura em `.claude/agents/`): os três usam `model: sonnet` e um `color`. O planner tem `tools: Glob, Grep, Read, LS, mcp__playwright-test__browser_*` e não tem Edit. O generator tem tools de browser mais um servidor MCP `playwright-test`. O healer tem `Edit, MultiEdit, Write, mcp__playwright-test__browser_snapshot, browser_generate_locator, test_debug, test_list, test_run`. — [exemplo todomvc planner](https://github.com/microsoft/playwright/blob/main/examples/todomvc/.claude/agents/playwright-test-planner.md), [generator](https://github.com/microsoft/playwright/blob/main/examples/todomvc/.claude/agents/playwright-test-generator.md), [healer](https://github.com/microsoft/playwright/blob/main/examples/todomvc/.claude/agents/playwright-test-healer.md)
- Inconsistência na fonte: o resumo de playwright.dev mostra um exemplo de subagent Claude que usa `--loop=vscode` (linha 238 do doc fonte). O comando correto para Claude é `--loop=claude`, que aparece no tab "bash-claude" e nas release notes. — [test-agents-js.md](https://github.com/microsoft/playwright/blob/main/docs/src/test-agents-js.md)

**microsoft/playwright-mcp e microsoft/playwright-cli**
- Fato: playwright-mcp v0.0.83, de 2026-09-28, com 38,4k stars. playwright-cli tem 14,4k stars e se descreve como "CLI for common Playwright actions. Record and generate Playwright code, inspect selectors and take screenshots". — [playwright-mcp](https://github.com/microsoft/playwright-mcp), [playwright-cli](https://github.com/microsoft/playwright-cli)
- Fato (segundo a cobertura secundária): o README da Microsoft diz que as invocações de CLI "are more token-efficient: they avoid loading large tool schemas and verbose accessibility trees", com a regra "filesystem access → CLI; sandboxed → MCP". — [bug0.com](https://bug0.com/blog/playwright-cli-vs-playwright-mcp-ai-browser-testing-2026), [testdino](https://testdino.com/blog/playwright-cli-vs-mcp/)
- Fato contestado: a Morphllm, um blog de fornecedor com uma única tarefa medida, reporta 114K tokens/tarefa com MCP contra 27K com CLI. — [morphllm](https://morphllm.com/playwright-mcp). A Checkly argumenta que o gap é menor porque a CLI chama as mesmas tools MCP por baixo. — [checklyhq](https://www.checklyhq.com/blog/mcp-vs-cli-token-efficiency/)

**Outros de E2E/Vitest/cobertura (menores)**
- Fato: [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) (3,2k stars, push em 2026-10-01) e [SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser) (6,7k), um plugin "to test and verify its own work". O dev-browser está listado no awesome-claude-code. — [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- Fato: o skill oficial `webapp-testing` (Playwright) está em anthropics/skills. — [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills)
- Fato: a VoltAgent/awesome-agent-skills lista `testmu-ai/vitest-skill` e `playwright-skill` (LambdaTest). — [lista](https://github.com/VoltAgent/awesome-agent-skills)
- Fato: [sametcelikbicak/coverage-guard](https://github.com/sametcelikbicak/coverage-guard) é um skill que "enforces 100% test coverage" e tem 3 stars, ou seja, quase nenhuma adoção. — GitHub API
- Fato: [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) traz `test-master` e `playwright-expert`, com frontmatter rico em `metadata` (triggers, role, scope, related-skills). — [test-master](https://github.com/Jeffallan/claude-skills/blob/main/skills/test-master/SKILL.md)

**Mutation testing (Stryker)**
- Fato: nenhum agente ou skill de mutation testing para Claude tem adoção relevante. As buscas no GitHub ("claude code mutation testing") retornam repos com menos de 15 stars, por exemplo [keyboardsamurai/mutagate](https://github.com/keyboardsamurai/mutagate) com 7 stars. — GitHub search API. Existem listagens em marketplaces de terceiros que não verifiquei. — [mcpmarket stryker skill](https://mcpmarket.com/tools/skills/stryker-mutation-testing)
- Fato (referência prática principal): Neal Lindsay (Test Double), "Keep your coding agent on task with mutation testing", 21/out/2025, **anterior a 2026**. Ele cria um script `npm run mutate` que roda Stryker só nos arquivos alterados em `src/`, e coloca no `CLAUDE.md`/`AGENTS.md` a instrução "escreva teste, veja falhar, implemente, rode `npm run mutate`". O agente lê os mutantes sobreviventes e itera. O Claude reportou 96,30%, mas a reexecução do autor deu 94,44% ("agent-reported results should be verified"). O Stryker não tem comentário para suprimir mutantes. O autor recomenda aplicar o mínimo de cobertura antes do mutation run. — [testdouble.com](https://testdouble.com/insights/keep-your-coding-agent-on-task-with-mutation-testing)

#### 1.3 ARQUITETURA / DOCUMENTAÇÃO / PLANNING

**github/spec-kit** ([repo](https://github.com/github/spec-kit))
- Fato: release v1.2.2 em 2026-10-19, com 142k stars. Os templates de comando atuais são `constitution, specify, clarify, plan, tasks, analyze, checklist, implement, converge, taskstoissues`. O README mostra `/speckit-constitution`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-converge`, além de fluxos `/speckit-bug-assess|fix|test` e `/speckit-assess-intake|research`. — [templates/commands](https://github.com/github/spec-kit/tree/main/templates/commands), [README](https://github.com/github/spec-kit)
- Fato: a "constitution" é criada uma vez por projeto e guarda princípios como "code quality, testing, and maintainability". — [README](https://github.com/github/spec-kit)

**bmad-code-org/BMAD-METHOD** ([repo](https://github.com/bmad-code-org/BMAD-METHOD))
- Fato: a linha estável é a **v6.12**, com release v6.12.4 em 2026-10-14, instalada via `npx bmad-method install`. A **V7** está em "preview alpha", com ETA declarado de 16/out/2026. Ambas exigem `uv`. Os comandos de entrada são `bmad-build` e `bmad-help`. — [README](https://github.com/bmad-code-org/BMAD-METHOD)
- Fato: módulos oficiais incluem **BMad Builder** (criador de skills/workflows/agents) e **BMad Test Architect** ("Enterprise testing add-on"). — [README](https://github.com/bmad-code-org/BMAD-METHOD), [bmad-method-test-architecture-enterprise](https://github.com/bmad-code-org/bmad-method-test-architecture-enterprise)
- Gap: o README dizia que a V7 sairia até 16/out. Não verifiquei se saiu. A última release em 2026-10-20 ainda é a v6.12.4, então provavelmente atrasou (estimativa).

**Fission-AI/OpenSpec**: v1.14.3, de 2026-10-17, com 72,5k stars. Descrição: "Spec-driven development (SDD) for AI coding assistants". — [repo](https://github.com/Fission-AI/OpenSpec)

**Specs estilo Kiro dentro do Claude Code**
- Fato: [gotalab/cc-sdd](https://github.com/gotalab/cc-sdd) (3,7k stars, ativo em 2026-10-13) usa "Agent Skills" e cobre vários harnesses. [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) (3,9k) segue o fluxo Requirements → Design → Tasks → Implementation, mas está **parado desde 2025-09-07**. — GitHub API
- Fato: [kirodotdev/Kiro](https://github.com/kirodotdev/Kiro) é o repo público do IDE Kiro (issues/docs), com 4,4k stars. — GitHub API

**ADR**
- Fato: [npryce/adr-tools](https://github.com/npryce/adr-tools) teve o último push em **2024-04-25** e [thomvaill/log4brains](https://github.com/thomvaill/log4brains) em **2024-12-17**. Os dois estão inativos e não têm plugin ou skill própria para Claude. [adr/madr](https://github.com/adr/madr), o template, continua ativo (push em 2026-08-28). — GitHub API
- Fato: wshobson/agents traz o skill `architecture-decision-records` no plugin `documentation-generation`, com frontmatter de apenas `name`/`description`. Ele documenta o ciclo de vida "Proposed → Accepted → Deprecated → Superseded / Rejected", a estrutura `docs/adr/NNNN-*.md` com índice `README.md` (tabela ADR | Title | Status | Date) e uma seção "Automation (adr-tools)". Carrega sob demanda as referências `decision-templates.md` (standard, lightweight, Y-statement) e `deprecation-rfc-templates.md` (progressive disclosure). — [SKILL.md](https://github.com/wshobson/agents/blob/main/plugins/documentation-generation/skills/architecture-decision-records/SKILL.md)
- Fato: o mesmo marketplace tem o plugin `c4-architecture`, com agentes `c4-context`, `c4-container`, `c4-component` e `c4-code` e o comando `/c4-architecture`, além de `docs-architect`, `architect-review` e `backend-architect`. — [árvore wshobson/agents](https://github.com/wshobson/agents/tree/main/plugins/c4-architecture)

**Guardiões de arquitetura (hexagonal/clean)**
- Fato: o skill `improve-codebase-architecture` de mattpocock/skills usa `disable-model-invocation: true` e só roda quando o usuário o invoca. Ele lê `GLOSSARY.md` e "ADRs in docs/adr/ record decisions this command should not re-litigate", procura hot spots via `git log`, aplica o "deletion test" e gera um relatório HTML (Tailwind + Mermaid via CDN) em um diretório temporário, "so nothing lands in the repo". — [SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md)
- Fato: skills dedicados a hexagonal têm adoção mínima. A busca "hexagonal architecture claude skill" retorna [aligundogdu/symfony-hexagonal-skill](https://github.com/aligundogdu/symfony-hexagonal-skill) com 35 stars e [Softtor/nestjs-hexagonal](https://github.com/Softtor/nestjs-hexagonal) com 5 stars. — GitHub search API

**Especialistas de stack (NestJS / React / Three.js)**
- Fato: o `nestjs-expert` de Jeffallan/claude-skills (v1.1.0) tem uma description longa e rica em gatilhos (".module.ts, .controller.ts", "TypeORM or Prisma", "guards, interceptors, pipes") e `metadata.related-skills: fullstack-guardian, test-master`. — [SKILL.md](https://github.com/Jeffallan/claude-skills/blob/main/skills/nestjs-expert/SKILL.md). O mesmo repo traz `react-expert`, `architecture-designer`, `spec-miner` e `playwright-expert`. — [skills/](https://github.com/Jeffallan/claude-skills/tree/main/skills)
- Fato: a VoltAgent tem `react-specialist`. — [categories/02-language-specialists](https://github.com/VoltAgent/awesome-claude-code-subagents/tree/main/categories/02-language-specialists)
- Fato: nenhum skill de Three.js/R3F para engenharia tem adoção relevante. [Impertio-Studio/Three.js-Claude-Skill-Package](https://github.com/Impertio-Studio/Three.js-Claude-Skill-Package) tem 23 stars e [cesartevisual/threejs-skills](https://github.com/cesartevisual/threejs-skills) tem 6. O mais estrelado, [viettranx/3dviz-pro-max](https://github.com/viettranx/3dviz-pro-max) com 830 stars, é voltado a visualização criativa. — GitHub search API

**Criadores de skills/agentes**
- Fato: `skill-creator` oficial em [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills). Na comunidade: `writing-skills` (superpowers, TDD para skills), **BMad Builder** e o skill `writing-for-agents` de mattpocock. — [superpowers](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md), [BMAD README](https://github.com/bmad-code-org/BMAD-METHOD), [mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/productivity)

### Inferences
- Estimativa: os quatro itens de maior tração real para este projeto (NestJS + React/Three.js + Vitest + Playwright) são Playwright Test Agents (oficial, versionado com o Playwright), superpowers TDD, mattpocock `tdd`/`improve-codebase-architecture` e o skill ADR do wshobson.
- Palpite: catálogos de subagents grandes (VoltAgent com mais de 100, wshobson com dezenas de plugins, alirezarezvani com 380 skills) servem mais como fonte de ideias do que para instalar em massa. Cada um tem descriptions longas e "Use PROACTIVELY" que competem pelo roteamento.
- Inferência: o `test-automator` da VoltAgent assume um "context manager" inexistente e dá Write/Edit a um `architect-reviewer`. Sinais de prompts genéricos pouco curados.
- Inferência: ferramentas de ADR "clássicas" estão mortas desde 2024. O padrão vivo é "template MADR + skill que conhece o ciclo de status + índice README".

### Gaps
- Não encontrei o autor nominal real de alguns repos (por exemplo tt-a1i, 0xfurai). Uso o handle do GitHub.
- Não verifiquei autenticidade das stars (possível inflação) nem downloads de npm.
- Não verifiquei se a BMAD V7 foi lançada depois de 16/out/2026.
- Não verifiquei o conteúdo dos skills de mutation testing em marketplaces de terceiros (mcpmarket, claudepluginhub, skills.lc).

---

## 2. O que a comunidade diz sobre quais agentes de teste/arquitetura ajudam e quais só adicionam cerimônia?

### Takeaway
O consenso, que é anedótico mas consistente, é este. Ajudam: **gates determinísticos** (hooks, testes, mutation scores rodados pelo próprio agente), **TDD que obriga ver o teste falhar** e **brainstorming/review**. Viram cerimônia: pipelines SDD completos (spec-kit, Kiro, BMAD) e fluxos com muitos subagents em tarefas pequenas. As queixas recorrentes são custo de tokens, lentidão e volume de markdown para revisar.

### Cited Findings
- Fato/opinião: em "Superpowers 6" no HN (196 pontos, 77 comentários; post do blog de 15/jun/2026), *prplfsh* diz que o skill "does a great job with TDD that stops the model from jumping to conclusions". *tmach32* chama o subagent-driven development de "the strongest part", mas diz que uma mudança de uma linha leva "literally an hour with all the verification". *mattm* diz que "went completely overboard for a small bug fix". *flashgordon* o chama de "a huge token guzzler". *artisin* diz que "did materially worse across all my personal benchmarks". *mempko* não usa por causa do TDD ("waste tokens on producing code that doesn't ship"). *steve-atx-7600* cita testes unitários de comportamento trivial de config. *CharlesW* lembra que "Nothing about Superpowers forces you to use TDD". *johnfn* critica a falta de benchmarks, e outro usuário respondeu com um repo superpowers-evals. — [HN 48739459](https://news.ycombinator.com/item?id=48739459)
- Fato: no mesmo thread, um usuário cita a alegação do blog de ~50% menos tempo de relógio e ~60% menos tokens na v6 (em ~36 h de trabalho). Vários comentários dizem que modelos mais novos e recursos nativos (por exemplo `/goal`) reduzem a necessidade desses frameworks. — [HN 48739459](https://news.ycombinator.com/item?id=48739459)
- Opinião: outros threads relatam que um usuário teve a experiência "mostly frustrating to nearly-magical" com o plugin, enquanto outro diz que não achou "a better framework than just plain old Claude Code". — [HN 47418177](https://news.ycombinator.com/item?id=47418177), [HN 47624894](https://news.ycombinator.com/item?id=47624894), [HN 47623101 "A Rave Review of Superpowers"](https://news.ycombinator.com/item?id=47623101)
- Fato (crítica ao SDD, **out/2025, anterior a 2026**): Birgitta Böckeler (Thoughtworks) avaliou Kiro, spec-kit e Tessl em martinfowler.com. Kiro transformou um bug pequeno em 4 user stories com 16 critérios de aceite ("sledgehammer to crack a nut"). Os arquivos do spec-kit eram "very verbose and tedious to review", e ela escreve "I'd rather review code than all these markdown files". O agente "ignored the notes that these were descriptions of existing classes" e duplicou classes, ou seguiu a constitution com zelo excessivo. Ela conclui: "I could have implemented the feature with 'plain' AI-assisted coding" no mesmo tempo. — [martinfowler.com, 15/out/2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- Fonte secundária, não verifiquei a original: blogs citam uma review da Scott Logic segundo a qual iterar com prompts foi "around ten times faster" que o pipeline do spec-kit (3,5 h contra 23 min em uma feature). Para o BMAD, citam curva de aprendizado de ~2 meses e um custo estimado de US$ 800–2.000+/dev/mês em projetos grandes. — [nosam.com](https://www.nosam.com/spec-driven-development-openspec-vs-spec-kit-vs-bmad-which-ones-actually-worth-your-time/), [dev.to willtorber](https://dev.to/willtorber/spec-kit-vs-bmad-vs-openspec-choosing-an-sdd-framework-in-2026-d3j), [tooltwist](https://tooltwist.com/insights/you-do-not-need-spec-kit-if-already-using-bmad)
- Opinião: um praticante no HN descreve "specs that keep drifting ... until you have duplication and contradictions". Fonte secundária, não localizei o thread. — [jiaweing.com](https://jiaweing.com/blog/the-state-of-spec-driven-development)
- Fato: no tdd-guard, a aplicação depende de hooks e o próprio autor documenta bypass via shell. A eficácia exige `permissions.deny`. — [enforcement.md](https://github.com/nizos/tdd-guard/blob/main/docs/enforcement.md)
- Fato: com Stryker, deixar o agente rodar o mutation testing "improved test quality substantially". Mas o agente às vezes desiste antes e dá explicações "plausible but wrong", então a revisão humana dos mutantes sobreviventes é necessária. — [testdouble.com](https://testdouble.com/insights/keep-your-coding-agent-on-task-with-mutation-testing)
- Fato: o healer do Playwright pode pular (skip) testes em vez de corrigi-los, e as definições ficam obsoletas a cada upgrade do Playwright. — [playwright.dev](https://playwright.dev/docs/test-agents)
- Fato: definições de MCP carregam no início da sessão. Um usuário reportou 28,1k tokens (14,1% da janela) gastos só com definições de tools MCP. — [webfuse](https://www.webfuse.com/blog/playwright-mcp-vs-playwright-cli)
- Opinião: um guia em Substack relata que, de 47 skills testados, "forty of them made the output worse". Fonte fraca, sem método publicado. — resultado de busca, [corpwaters.substack.com](https://corpwaters.substack.com/p/the-ultimate-guide-to-claude-code)

### Inferences
- O que ajuda: (a) **feedback executável** que o agente roda e lê (teste falhando, coverage, mutation score, linter); (b) **regras curtas com gatilho claro** (Iron Law do TDD, "verify RED"); (c) **vocabulário de domínio** (GLOSSARY/ADRs) injetado nos testes.
- O que vira cerimônia: (a) pipelines de spec com várias etapas para mudanças pequenas; (b) agentes "orquestradores" cujo prompt é uma lista de capacidades (por exemplo o `tdd-orchestrator` do wshobson, 183 linhas de bullets, `model: opus`) e não um procedimento verificável; (c) verificação por subagents em cada passo.
- Palpite: o projeto já tem `docs/adr` e `docs/pdr` fortes. Para ele, o valor de spec-kit/BMAD é baixo, porque as decisões já são registradas manualmente. Duplicar em constitution/spec aumentaria o drift apontado por Böckeler e pelo HN.

### Gaps
- Não encontrei threads do Reddit r/ClaudeAI verificáveis especificamente sobre TDD/ceremony. A busca não retornou threads diretos.
- Não há benchmark independente e público comparando superpowers, wshobson e plain Claude Code em testes. Só há alegações do autor e anedotas.
- Não verifiquei o estudo da arXiv sobre a qualidade de testes Python escritos pelo Claude com mutation analysis ([arXiv 2608.15188](https://arxiv.org/pdf/2608.15188)). Vi só o título em resultado de busca.

---

## 3. Padrões a copiar para um projeto com IDs de regra de negócio (RN-...) no nome do teste, AAA sem comentários, 90% de cobertura e Stryker

### Takeaway
Nenhum item da comunidade implementa exatamente "RN-ID no nome do teste + AAA sem comentários + 90% + Stryker". Mas há peças copiáveis: (1) a Iron Law e o "Verify RED" do superpowers; (2) o "expected values must come from an independent source of truth: the spec" e o uso de GLOSSARY/ADRs do mattpocock `tdd`; (3) aplicação por hook com `permissions.deny` do tdd-guard; (4) o loop `npm run mutate` em arquivos alterados da Test Double; (5) planner→specs em Markdown→generator→healer do Playwright, com specs que podem carregar RN-IDs; (6) a progressive disclosure de referências do skill ADR do wshobson.

### Cited Findings
- Fato: o skill `tdd` de mattpocock manda alinhar nomes de testes ao vocabulário de domínio (`GLOSSARY.md`) e respeitar ADRs. Proíbe testes tautológicos e exige valores esperados vindos "the spec" ou "a worked example". — [mattpocock tdd](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md)
- Fato: o superpowers exige ver o teste falhar pelo motivo certo ("Fails because feature missing (not typos)") e traz uma tabela de racionalizações e red flags. — [superpowers TDD](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)
- Fato: o mattpocock define "Horizontal slicing" (todos os testes antes) como anti-pattern e prefere "vertical slices". — [mattpocock tdd](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md)
- Fato: o tdd-guard bloqueia edição de implementação sem teste falhando, valida via hook e suporta Vitest. Para impedir bypass, use `permissions.deny` em `Bash(sed:*)` e similares e em `Read(.claude/tdd-guard/**)`. — [tdd-guard](https://github.com/nizos/tdd-guard), [enforcement.md](https://github.com/nizos/tdd-guard/blob/main/docs/enforcement.md)
- Fato: a Test Double usa um script que roda Stryker só nos arquivos alterados (incluindo untracked) mais uma instrução no `CLAUDE.md`. Recomenda aplicar o mínimo de cobertura antes do mutation run (feedback mais rápido) e conferir o score reportado pelo agente. — [testdouble.com](https://testdouble.com/insights/keep-your-coding-agent-on-task-with-mutation-testing)
- Fato: o Stryker suporta Vitest e Jest explicitamente, e `stryker run -m <file>` limita a mutação a um arquivo. — [testdouble.com](https://testdouble.com/insights/keep-your-coding-agent-on-task-with-mutation-testing), [stryker-js](https://github.com/stryker-mutator/stryker-js)
- Fato: o planner do Playwright aceita um PRD como entrada e grava planos legíveis em `specs/`. O generator cria "ideally one per spec" em `tests/`. O seed test centraliza o setup. — [playwright.dev](https://playwright.dev/docs/test-agents)
- Fato: o planner do Playwright não tem Edit/Write (só leitura + browser), e só o healer edita. É um exemplo oficial de menor privilégio por papel. — [planner.md](https://github.com/microsoft/playwright/blob/main/examples/todomvc/.claude/agents/playwright-test-planner.md), [healer.md](https://github.com/microsoft/playwright/blob/main/examples/todomvc/.claude/agents/playwright-test-healer.md)
- Fato: o `improve-codebase-architecture` usa `disable-model-invocation: true` para não disparar sozinho e escreve o relatório fora do repo. O skill ADR do wshobson carrega templates sob demanda ("Before drafting ... read references/..."). — [mattpocock](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md), [wshobson ADR](https://github.com/wshobson/agents/blob/main/plugins/documentation-generation/skills/architecture-decision-records/SKILL.md)
- Fato: o `writing-skills` do superpowers propõe testar skills com cenários de pressão em subagents antes de adotá-los ("If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing"). — [writing-skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md)
- Fato: o exemplo `<Good>` do superpowers é um teste em formato AAA implícito (arrange, ação, `expect`) sem comentários `// Arrange`. — [superpowers TDD](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)

### Inferences
- Recomendação derivada das fontes: escrever **um skill próprio e curto** (por exemplo `tdd-regras-de-negocio`) que combine:
  - (a) a Iron Law e o Verify RED do superpowers;
  - (b) a regra do mattpocock "valor esperado vem da RN, nunca recomputado";
  - (c) a convenção de nome `RN-XXX: <comportamento>` em `describe`/`it`;
  - (d) AAA separado por linha em branco, sem comentários;
  - (e) "rode `vitest --coverage` (threshold 90 em `vitest.config`) e depois `npm run mutate` nos arquivos alterados; liste os mutantes sobreviventes para revisão humana".
  Isso substitui catálogos genéricos.
- Inferência: o **gate** de 90% e de mutation score deve ficar no CI e na config (`coverage.thresholds` do Vitest, `thresholds.break` do Stryker), não só no prompt. As fontes mostram que agentes reportam números errados (96,30% contra 94,44%) e contornam hooks.
- Inferência: a rastreabilidade RN→teste pode ser verificada por script determinístico (grep de `RN-\d+` nos testes contra a lista de RNs em `docs/`), rodado em hook ou CI, em vez de um agente "guardião". Isso segue a lição de que gates executáveis ajudam e prompts longos são cerimônia.
- Inferência: para E2E, usar `init-agents --loop=claude` e colocar RN-IDs nos títulos dos planos em `specs/` faz o generator propagar os IDs aos nomes dos testes. Proibir o healer de usar `test.skip` (revisar o diff) mitiga o risco documentado.
- Inferência: os subagents do projeto devem ter `tools` mínimos por papel (reviewer sem Write/Edit), como o planner do Playwright, ao contrário do `architect-reviewer` da VoltAgent.
- Palpite: o mattpocock com GLOSSARY + ADRs é o mais próximo do workflow docs-first do projeto (PDR/ADR em `docs/`). Vale adaptar a ideia de que o skill de teste/arquitetura lê ADRs e "does not re-litigate" decisões.

### Gaps
- Não encontrei nenhum skill/agente público que use IDs de regra de negócio no nome dos testes. A convenção RN-ID não aparece em nenhum item verificado.
- Não encontrei skills de mutation testing para Claude com adoção relevante (mais de 100 stars) para servir de modelo. O padrão vem do artigo da Test Double (out/2025).
- Não verifiquei o comportamento do tdd-guard/probity com Vitest em monorepo Nx, nem o custo por edição do validador.
