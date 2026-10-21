# Agentes, skills, plugins e slash commands da comunidade para revisão de código e segurança (Claude Code), estado em out/2026

Convenções destas notas:
- **Fato**: verificado em fonte citada. Stars e datas de "último push" vieram da GitHub REST API (`gh api repos/...`) em **2026-10-20**. "pushed_at" é o último push em qualquer branch, não necessariamente um release.
- **Estimativa**: deduzida de dados citados.
- **Palpite**: opinião minha, sem fonte direta.
- Itens da Anthropic (ex.: `anthropics/claude-code-security-review`, `/security-review` embutido) aparecem só como referência de comparação; o foco são itens da comunidade.

---

## 1. Quais repositórios/coleções são mais referenciados e quantas stars têm hoje?

### Takeaway
Os nomes citados no enunciado existem, mas a escala mudou muito desde 2025. Os maiores hoje são `obra/superpowers` (~302k stars) e `affaan-m/ECC` (ex-"everything-claude-code", ~285k), seguidos por `ComposioHQ/awesome-claude-skills` (~77k), `hesreallyhim/awesome-claude-code` (~56k), `wshobson/agents` (~41k), `davila7/claude-code-templates` (~33k), `alirezarezvani/claude-skills` (~28k) e `VoltAgent/awesome-claude-code-subagents` (~26k). Algumas coleções de 2025 (`iannuttall/claude-agents`, `lst97`, `wshobson/commands`) estão arquivadas ou paradas.

### Cited Findings
Tabela verificada via API do GitHub em 2026-10-20:

| Repo | Stars | Último push | Status | Observação |
|---|---|---|---|---|
| https://github.com/obra/superpowers | 302.554 | 2026-10-20 | ativo | Skills de workflow (Jesse Vincent/obra), incluindo `requesting-code-review` e `receiving-code-review` |
| https://github.com/affaan-m/ECC | 284.801 | 2026-10-20 | ativo | Antes "everything-claude-code", hoje `affaan-m/ECC`. Mais de 25 agentes `*-reviewer` e um `security-reviewer` |
| https://github.com/mattpocock/skills | 298.535 | 2026-10-19 | ativo | Skills gerais de engenharia; aparece citado em discussões (ex.: `grill-me`) |
| https://github.com/ComposioHQ/awesome-claude-skills | 77.519 | 2026-09-18 | ativo | Awesome list de skills |
| https://github.com/hesreallyhim/awesome-claude-code | 56.097 | 2026-10-20 | ativo | Awesome list principal, com seção "Security" |
| https://github.com/wshobson/agents | 41.242 | 2026-10-19 | ativo | Marketplace de plugins, incluindo `comprehensive-review` e `security-scanning` |
| https://github.com/davila7/claude-code-templates | 32.783 | 2026-10-20 | ativo | CLI e catálogo; tem cópia do `security-review` do ECC |
| https://github.com/alirezarezvani/claude-skills | 28.441 | 2026-08-30 | ativo | Mais de 380 skills, incluindo `senior-security` |
| https://github.com/VoltAgent/awesome-claude-code-subagents | 25.895 | 2026-10-11 | ativo | Categoria `04-quality-security` |
| https://github.com/travisvn/awesome-claude-skills | 15.483 | 2026-04-28 | ativo, pouco movimento | Awesome list |
| https://github.com/trailofbits/skills | 7.662 | 2026-10-20 | ativo | Skills de auditoria de segurança da Trail of Bits |
| https://github.com/vijaythecoder/awesome-claude-agents | 4.396 | 2025-10-30 | parado há cerca de 1 ano | |
| https://github.com/davepoon/buildwithclaude | 3.662 | 2026-10-20 | ativo | O nome `davepoon/claude-code-subagents-collection` redireciona para este repo (renomeado) |
| https://github.com/wshobson/commands | 2.641 | 2026-09-30 | **arquivado** | Slash commands, incluindo `deps-audit` |
| https://github.com/iannuttall/claude-agents | 2.040 | 2025-07-25 | **arquivado** | Tem `security-auditor.md` e `code-refactorer.md` |
| https://github.com/lst97/claude-code-sub-agents | 1.698 | 2025-08-15 | parado há mais de 1 ano | Tem `code-reviewer-pro`, `architect-review` e `security-auditor` |
| https://github.com/qdhenry/Claude-Command-Suite | 1.347 | 2026-03-01 | pouco ativo | |
| https://github.com/getsentry/skills | 1.071 | 2026-10-19 | ativo | Skills do time da Sentry, incluindo `security-review` e `code-review` |
| https://github.com/0xfurai/claude-code-subagents | 1.019 | 2025-10-15 | parado | |

- A `hesreallyhim/awesome-claude-code` tem uma seção "Security". Ela lista Trail of Bits Security Skills ("A very professional collection of over a dozen security-focused skills..."), NVIDIA SkillSpector, Gryph (SafeDep), GouvernAI, Node9, Airut e Code on Incus. Também lista a Action oficial `anthropics/claude-code-security-review` — [README awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- `wshobson/agents` foi postado no HN em 2025-07-31 e teve só 2 pontos. A popularidade veio do GitHub, não do HN — [HN 44744708](https://news.ycombinator.com/item?id=44744708)
- Outros repos de segurança com muitas stars, encontrados na busca do GitHub (stars em 2026-10-20):
  - `mukul975/Anthropic-Cybersecurity-Skills`: 34.759 stars ("817 structured cybersecurity skills", mapeadas para MITRE ATT&CK/NIST). **Apesar do nome, não é da Anthropic** — [repo](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)
  - `NVIDIA/SkillSpector`: 20.709 stars (scanner de skills) — [repo](https://github.com/NVIDIA/SkillSpector)
  - `gadievron/raptor`: 3.925 stars (agente ofensivo/defensivo) — [repo](https://github.com/gadievron/raptor)
  - `snyk/agent-scan`: 3.155 stars. É o antigo `invariantlabs-ai/mcp-scan`, que hoje redireciona para cá — [repo](https://github.com/snyk/agent-scan)
  - `0xSteph/pentest-ai-agents`: 2.355 stars — [repo](https://github.com/0xSteph/pentest-ai-agents)
  - `Pantheon-Security/medusa`: 1.004 stars. Vê se hooks, permissions e skills em `.claude/` são seguros antes de clonar — [repo](https://github.com/Pantheon-Security/medusa)
- Plugins de revisão que delegam para outro modelo:
  - `openai/codex-plugin-cc`: 34.399 stars, "Use Codex from Claude Code to review code" — [repo](https://github.com/openai/codex-plugin-cc)
  - `hamelsmu/claude-review-loop`: 722 stars, último push 2026-03-15 — [repo](https://github.com/hamelsmu/claude-review-loop)
- Plugins de revisão de arquitetura/design: `vladikk/modularity` (565 stars, revisa codebases quanto a problemas de modularidade) — [repo](https://github.com/vladikk/modularity); `andonimichael/arxitect` (65 stars) — [repo](https://github.com/andonimichael/arxitect)

### Inferences
- **Estimativa:** as contagens de 280k–300k stars de `superpowers`, `ECC` e `mattpocock/skills` estão muito acima de qualquer repo de dev tools de 2025. A API do GitHub confirma os números, mas eles podem incluir crescimento viral ou inflado. Star não mede uso real de um agente específico.
- **Palpite:** para "revisão e segurança", os itens que mais aparecem em discussões técnicas (não só em listas) são as skills `requesting-code-review` do superpowers, as skills da Trail of Bits, o `security-review` da Sentry e o `security-reviewer`/`code-reviewer` do ECC. As coleções de "persona" (VoltAgent, wshobson, lst97) são muito copiadas, mas pouco elogiadas pela qualidade.

### Gaps
- Não encontrei métricas de instalação por agente/skill. O skills.sh/`npx skills` tem contadores, mas não os consultei. O artigo da timonweb avisa que contagem de instalação/stars não reflete a qualidade da skill específica (ver seção 3).
- Não verifiquei stars do `pr-review-toolkit` (plugin oficial da Anthropic), fora do escopo.

---

## 2. Quais agentes/skills de code review e segurança dentro dessas coleções se destacam, e o que contêm (frontmatter, tools, modelo, passos)?

### Takeaway
Existem dois estilos bem diferentes:
- **Personas genéricas.** Prompt longo listando ferramentas e frameworks, sem método e muitas vezes sem restrição de tools. É o caso de wshobson, VoltAgent e lst97.
- **Metodologias.** Têm passos, critério de confiança, filtro de falso positivo e saída estruturada. É o caso de superpowers, Trail of Bits, Sentry e, em parte, ECC.

Os mais elogiados são as metodologias. Vários reviewers populares dão `Write`/`Edit`/`Bash` ou não declaram `tools` (e aí herdam tudo), o que contraria a prática de reviewer read-only.

### Cited Findings

**(a) obra/superpowers: `requesting-code-review` + `code-reviewer.md` + `receiving-code-review`** (skills; 302k stars no repo)
- Frontmatter só com `name` e `description` ("Use when completing tasks, implementing major features, or before merging..."). Não define `allowed-tools`. Despacha um subagente `general-purpose` com um template preenchido: `{DESCRIPTION}`, `{PLAN_OR_REQUIREMENTS}`, `{BASE_SHA}`, `{HEAD_SHA}` — [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/SKILL.md)
- Princípio central: o reviewer recebe contexto preparado, "never your session's history". A revisão é obrigatória após cada tarefa, após feature grande e antes de merge. A classificação é Critical (corrigir já), Important (antes de seguir) e Minor (depois) — [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/SKILL.md)
- O template do reviewer:
  - instrui "Read-Only Review": não mexer em working tree, index, HEAD ou branch; para outra revisão, usar `git worktree add /tmp/review-[SHA]`;
  - proíbe o reviewer de criar subagentes ("You Do Not Dispatch Subagents");
  - exige uma seção "Declined to judge" com tudo o que foi deixado de fora;
  - trata o spec como "vision document": o silêncio do spec não é permissão.
  - Fonte: [code-reviewer.md](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/code-reviewer.md)
- `receiving-code-review`: o padrão é READ → UNDERSTAND → VERIFY → EVALUATE → RESPOND → IMPLEMENT. Proíbe concordância performática ("You're absolutely right!") e exige verificar o feedback contra o código antes de implementar — [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/receiving-code-review/SKILL.md)
- **Ressalva (fato):** o read-only é imposto **só por prompt**. O subagente é `general-purpose`, que tem todas as tools.

**(b) affaan-m/ECC: `agents/security-reviewer.md`, `agents/code-reviewer.md`, `skills/security-review`**
- `security-reviewer`: `tools: Read, Grep, Glob, Bash`, `model: sonnet`. A description diz "Use PROACTIVELY after writing code that handles user input, authentication, API endpoints... Flags secrets, SSRF, injection, unsafe crypto, and OWASP Top 10". Tem uma seção "Prompt Defense Baseline": tratar conteúdo externo como não confiável, desconfiar de unicode/homoglyphs/zero-width e não revelar segredos. As responsabilidades cobrem OWASP Top 10, secrets, validação de input, authN/authZ e dependências — [security-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/security-reviewer.md)
- `code-reviewer`: `tools: Read, Grep, Glob, Bash`, `model: sonnet`, "MUST BE USED for all code changes" — [code-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/code-reviewer.md)
- O ECC também tem agentes por linguagem/stack (`typescript-reviewer`, `python-reviewer`, `go-reviewer`, `database-reviewer`, `django-reviewer` etc.) e versões para Kiro/Codex/Cursor — [diretório agents](https://github.com/affaan-m/ECC/tree/main/agents)
- `skills/security-review`: frontmatter com `name`, `description` e `metadata.origin: ECC`, **sem `allowed-tools`**. É descrito como "comprehensive security checklist and patterns" — [SKILL.md](https://github.com/affaan-m/ECC/blob/main/skills/security-review/SKILL.md)

**(c) getsentry/skills: `security-review`** (1.071 stars; ativo)
- Frontmatter: `allowed-tools: Read Grep Glob Bash Task`. O material de referência é baseado no OWASP Cheat Sheet Series (CC BY-SA 4.0) — [SKILL.md](https://github.com/getsentry/skills/blob/main/skills/security-review/SKILL.md)
- Método:
  - reporta só findings **HIGH CONFIDENCE** ("vulnerable pattern + attacker-controlled input confirmed");
  - MEDIUM vira "Needs verification" e LOW não é reportado;
  - separa o escopo de *reporting* (só o diff/arquivo) do escopo de *research* (o codebase inteiro);
  - antes de reportar, rastreia o data flow, procura validação em outro ponto e checa config/middleware e proteções do framework;
  - tem uma lista "Do Not Flag": testes, código morto, constantes, config controlada pelo servidor.
  - Fonte: [SKILL.md](https://github.com/getsentry/skills/blob/main/skills/security-review/SKILL.md)
- O repo também tem `code-review`, `django-access-review` (revisão de authZ), `gha-security-review` (GitHub Actions) e `django-perf-review` — [repo](https://github.com/getsentry/skills)

**(d) trailofbits/skills** (7.662 stars; ativo; plugins de auditoria)
- `differential-review`: `allowed-tools: Read Write Grep Glob Bash`. Faz revisão de segurança de PR/commit/diff: estratégia adaptada ao tamanho do codebase, `git blame` para contexto, "blast radius" calculado contando callers, checagem de cobertura de teste e relatório em markdown. Tem uma tabela "Rationalizations (Do Not Skip)", com linhas como "Small PR, quick review → Heartbleed was 2 lines" e "Just a refactor → Analyze as HIGH until proven LOW". Inclui o agente `adversarial-modeler.md` — [SKILL.md](https://github.com/trailofbits/skills/blob/main/plugins/differential-review/skills/differential-review/SKILL.md)
- `fp-check`: verifica findings suspeitos e dá veredito TRUE/FALSE POSITIVE com evidência. Tem agentes `data-flow-analyzer`, `exploitability-verifier` e `poc-builder`. `allowed-tools` é amplo: inclui `Bash`, `Write`, `Edit`, `Task` e `AskUserQuestion` — [SKILL.md](https://github.com/trailofbits/skills/blob/main/plugins/fp-check/skills/fp-check/SKILL.md)
- `supply-chain-risk-auditor`: `allowed-tools: Read Write Bash Glob Grep`. Cobre advisories casados por versão (diretas e lockfile inteiro), upstreams abandonados/arquivados, concentração de publishers npm e scripts de instalação — [SKILL.md](https://github.com/trailofbits/skills/blob/main/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md)
- `sharp-edges`: `allowed-tools: Read Grep Glob` (puramente read-only). Identifica APIs propensas a erro, configs perigosas e "footguns", com foco em "secure by default" e "pit of success" — [SKILL.md](https://github.com/trailofbits/skills/blob/main/plugins/sharp-edges/skills/sharp-edges/SKILL.md)
- Outros plugins (lista da árvore do repo):
  - `static-analysis`: skills `codeql`, `semgrep` e `sarif-parsing`;
  - `semgrep-rule-creator`, `variant-analysis`, `entry-point-analyzer`, `spec-to-code-compliance`, `audit-context-building`, `agentic-actions-auditor`;
  - `c-review` e `rust-review`, com agentes `rust-review-fp-judge` e `rust-review-dedup-judge`;
  - `constant-time-analysis`, `zeroize-audit` (pipeline de 6+ agentes), `second-opinion`, `testing-handbook-skills` (fuzzing), `building-secure-contracts`.
  - Fonte: [repo](https://github.com/trailofbits/skills)

**(e) wshobson/agents: plugin `comprehensive-review`** (41k stars)
- Agentes `code-reviewer`, `security-auditor` e `architect-review`, todos com `model: opus` e **sem campo `tools`** (confirmado: 0 linhas `tools:` no frontmatter de `code-reviewer`, `security-auditor` e `backend-security-coder`) — [code-reviewer.md](https://github.com/wshobson/agents/blob/main/plugins/comprehensive-review/agents/code-reviewer.md), [security-auditor.md](https://github.com/wshobson/agents/blob/main/plugins/comprehensive-review/agents/security-auditor.md)
- Conteúdo em estilo persona:
  - o `code-reviewer` lista ferramentas e marcas ("Trag, Bito, Codiga, GitHub Copilot", "SonarQube, CodeQL, Semgrep", "Snyk, Bandit") e se descreve com "2024/2025 best practices";
  - o `security-auditor` cobre DevSecOps, threat modeling, OAuth2/OIDC, OWASP e GDPR/HIPAA/SOC2.
  - Fontes: os mesmos arquivos acima
- Command `/full-review` (argumentos: `--security-focus`, `--performance-critical`, `--strict-mode`, `--framework`):
  - orquestra fases em ordem;
  - grava arquivos em `.full-review/` e um `state.json` para retomar;
  - para em checkpoints com `AskUserQuestion`;
  - para tudo se der falha;
  - usa só agentes locais e proíbe `EnterPlanMode`.
  - Fonte: [full-review.md](https://github.com/wshobson/agents/blob/main/plugins/comprehensive-review/commands/full-review.md)
- Outros arquivos relevantes: `plugins/codebase-cleanup/commands/deps-audit.md`, `plugins/dependency-management/commands/deps-audit.md`, `plugins/agent-teams/commands/team-review.md`, a skill `developer-essentials/skills/code-review-excellence`, `security-scanning`, `security-compliance` e `backend-api-security` — [árvore do repo](https://github.com/wshobson/agents)

**(f) VoltAgent/awesome-claude-code-subagents: `categories/04-quality-security/`** (26k stars)
- `code-reviewer`: `tools: Read, Write, Edit, Bash, Glob, Grep`, `model: inherit`. O checklist tem metas numéricas genéricas ("Code coverage > 80%", "Cyclomatic complexity < 10", "Zero critical security issues verified"). O passo 1 é "Query context manager", que depende de um agente externo inexistente na maioria dos setups — [code-reviewer.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/04-quality-security/code-reviewer.md)
- `security-auditor`: `tools: Read, Grep, Glob` (read-only), `model: inherit` — [security-auditor.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/04-quality-security/security-auditor.md)
- `penetration-tester`: `tools: Read, Grep, Glob, Bash` — [penetration-tester.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/04-quality-security/penetration-tester.md)
- `architect-reviewer`: `tools: Read, Write, Edit, Bash, Glob, Grep` — [architect-reviewer.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/04-quality-security/architect-reviewer.md)
- Outros na categoria: `compliance-auditor`, `gdpr-ccpa-compliance`, `ad-security-reviewer`, `powershell-security-hardening` e `surgeon-reviewer`; em outra categoria, `03-infrastructure/security-engineer` — [diretório](https://github.com/VoltAgent/awesome-claude-code-subagents/tree/main/categories/04-quality-security)

**(g) Coleções de 2025, hoje paradas**
- `lst97` `code-reviewer-pro`: `model: haiku`. `tools: Read, Grep, Glob, Bash, LS, WebFetch, WebSearch, Task` mais MCP `context7` e `sequential-thinking` — [code-reviewer.md](https://github.com/lst97/claude-code-sub-agents/blob/main/agents/quality-testing/code-reviewer.md)
- `iannuttall/claude-agents` (arquivado): `security-auditor.md`; `code-refactorer` com `tools: Edit, MultiEdit, Write, NotebookEdit, Grep, LS, Read` — [repo](https://github.com/iannuttall/claude-agents)

**(h) Plugins de PR review multi-agente da comunidade**
- `adamjgmiller/adamsreview`: 244 stars, último push 2026-05-17. São 6 slash commands (`review`, `codex-review`, `add`, `promote`, `walkthrough`, `fix`). Usa subagentes paralelos, passes de validação e estado JSON em disco (o que permite limpar o contexto entre estágios) e um ensemble opcional com Codex CLI. O `fix` re-revisa com Opus e reverte regressões — [HN Show HN 48090276](https://news.ycombinator.com/item?id=48090276), [repo](https://github.com/adamjgmiller/adamsreview)
- Consumo informado pelo autor: cerca de 500k tokens em PRs pequenos e 2–3M tokens em PRs de 10k–30k linhas — [HN 48090276](https://news.ycombinator.com/item?id=48090276)

**(i) Skills de segurança "ofensivas" ou de catálogo**
- `alirezarezvani/claude-skills@senior-security`: threat modeling STRIDE/DREAD, arquitetura e resposta a incidentes. Traz scripts Python para threat modeling e secret scanning — [timonweb](https://timonweb.com/ai/i-checked-5-security-skills-for-claude-code-only-one-is-worth-installing/)
- `sergiodxa/agent-skills@owasp-security-check`: 20 regras OWASP em 5 categorias de prioridade. O repo tem 92 stars e último push em 2026-02-01 — [timonweb](https://timonweb.com/ai/i-checked-5-security-skills-for-claude-code-only-one-is-worth-installing/), [repo](https://github.com/sergiodxa/agent-skills)

### Inferences
- **Fato derivado:** a documentação de subagentes diz que, sem o campo `tools`, o subagente herda todas as tools da sessão principal, incluindo MCP. Por isso os reviewers do wshobson podem escrever, editar e rodar Bash — [docs sub-agents](https://docs.anthropic.com/en/docs/claude-code/sub-agents) (comportamento de herança conhecido da documentação; não reli a página nesta sessão).
- **Palpite:** os melhores modelos para um reviewer read-only são o template do superpowers (fresh context, diff por SHA, "Declined to judge"), o filtro de confiança da Sentry e as tabelas "Rationalizations" e os juízes FP/dedup da Trail of Bits. O ideal é combinar com `tools: Read, Grep, Glob` (mais `Bash` só se houver hook/allowlist restringindo a `git diff/log/show`).

### Gaps
- Não verifiquei o conteúdo completo de `davepoon/buildwithclaude` (só o README) nem de `0xfurai`.
- Não encontrei números de uso por agente específico.
- O conteúdo de `deps-audit.md` (wshobson) não foi lido.

---

## 3. O que a comunidade diz sobre quais reviewers funcionam, falsos positivos e boas práticas?

### Takeaway
O consenso é este:
- usar um reviewer separado com contexto fresco, de preferência outro modelo para mudanças de alto risco;
- exigir evidência (arquivo e linha, data flow) e filtrar por confiança;
- separar "achar" de "validar";
- impor as restrições no nível de protocolo/tools, não só no prompt.

Checklists estáticos geram muitos falsos positivos. Também há ceticismo forte sobre custo e "complexidade contra complexidade".

### Cited Findings
- **Comparação de 5 skills de segurança** (Tim Kamanin, 2026-02-25):
  - `affaan-m/everything-claude-code@security-review`: checklist estático de 10 domínios com exemplos TS/Next.js/Supabase; não checa contexto. Marcou `settings.API_URL` do Django como possível SSRF e tem uma seção "oddly specific" de Solana.
  - `davila7/claude-code-templates@security-review`: cópia da anterior com 2 linhas de frontmatter. Veredito: "skip".
  - `sergiodxa@owasp-security-check`: "a good reference, just not a methodology"; só TypeScript; sem filtro de falso positivo nem data flow.
  - `alirezarezvani@senior-security`: boa qualidade, mas é a ferramenta errada para code review (faz threat model).
  - **Vencedor:** `getsentry/skills@security-review`, por reportar só HIGH, conhecer as proteções do Django (settings controlados pelo servidor, autoescape) sem deixar de pegar `mark_safe(user_input)`, pesquisar o codebase antes e trazer cerca de 17 guias. Instalação: `npx skills install getsentry/skills@security-review`.
  - Fonte: [timonweb.com](https://timonweb.com/ai/i-checked-5-security-skills-for-claude-code-only-one-is-worth-installing/); [discussão HN 47149897](https://news.ycombinator.com/item?id=47149897) (2 pontos, sem comentários)
- **Thread HN do adamsreview** (2026-05-11, 85 pontos, 53 comentários). O autor diz que pegou "dramatically more real bugs" que `/review`, `/ultrareview`, CodeRabbit, Greptile e o review do Codex, com menos falsos positivos (alegação não verificada; sem benchmark). Críticas na thread:
  - "a fair bit of ceremony" (esafak);
  - "a repository with just a bazillion prompts... burn a lot of tokens" (stingraycharles);
  - "We seem to be fighting complexity with complexity" (docheinestages);
  - pedido de eval harness com classes reais de bugs em vez de comparação anedótica (parasmadan); o autor admite não conhecer benchmark para AI code reviewers;
  - azurewraith: "prompt based orchestration is non-idempotent... Prompt level instructions get ignored, it's much harder to ignore a protocol-level tool restriction";
  - lmeyerov: dividir por arquivo e por tarefa, rodar em loop até parar de achar coisas ("3-8 rounds yielding valid results") e personalizar para o repo é "half the value";
  - yuppiepuppie e outros preferem revisão humana local com UI (tuicr.dev, code-review.nvim, crit.md): "Agents reviewing AI code always felt dirty to me".
  - Fonte: [HN 48090276](https://news.ycombinator.com/item?id=48090276)
- Issue #72206 no repo `anthropics/claude-code` (via snippet de busca; não li a página inteira):
  - propõe "adversarial self-review via a fresh sub-agent" contra a "author-blindness";
  - observa que um subagente do mesmo modelo compartilha os pontos cegos do modelo, então vale outro modelo em mudanças de alto risco;
  - relata que revisões de segurança em subagentes podem disparar falsos positivos do safety classifier (cita a issue #64558).
  - Fonte: [GitHub issue #72206](https://github.com/anthropics/claude-code/issues/72206)
- Post sobre o processo do time do Claude Code (via snippet; fonte da Anthropic, só contexto): um subagente revisa o diff com contexto fresco antes do PR; bons prompts de reviewer pedem arquivo e linha como evidência; um falso positivo é encerrado fechando a thread com uma razão curta — [claude.dev blog](https://claude.dev/blog/solving-code-review-at-anthropic/)
- Exemplo documentado de falso positivo: um reviewer automatizado de PR com Claude afirmou com confiança algo errado sobre o operador `??` de JavaScript. A lição registrada foi verificar empiricamente antes de agir — [claude-review-known-issues.md (attio-mcp-server, via Glama)](https://glama.ai/mcp/servers/@kesslerio/attio-mcp-server/blob/c064dac5b76e84b5a98dd842a05bc90d1683e877/.github/docs/claude-review-known-issues.md)
- Padrões de mitigação de falso positivo já embutidos em itens da comunidade:
  - Sentry: níveis de confiança e "Do Not Flag" — [SKILL.md](https://github.com/getsentry/skills/blob/main/skills/security-review/SKILL.md)
  - Trail of Bits: `fp-check` com veredito TRUE/FALSE POSITIVE, e `rust-review-fp-judge` / `rust-review-dedup-judge` — [repo](https://github.com/trailofbits/skills)
  - superpowers: `receiving-code-review` manda verificar o feedback antes de implementar — [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/receiving-code-review/SKILL.md)
- Revisão cruzada com outro modelo virou padrão popular: `openai/codex-plugin-cc` (34k stars), `hamelsmu/claude-review-loop` (722) e o modo `codex-review` do adamsreview — [codex-plugin-cc](https://github.com/openai/codex-plugin-cc), [claude-review-loop](https://github.com/hamelsmu/claude-review-loop)

### Inferences
- **Estimativa:** a discussão pública (HN) sobre agentes de revisão específicos é pequena. Os threads maiores são sobre incidentes de segurança (181 pontos) e plugins próprios (85 pontos), não sobre as coleções de personas.
- **Palpite:** para um projeto como o Takt, a configuração que a comunidade mais defende seria:
  - reviewer read-only com contexto fresco, recebendo só o diff e o spec/ADR;
  - saída com evidência (arquivo e linha) e nível de confiança;
  - um segundo passo de validação de falsos positivos;
  - revisão de segurança no estilo Sentry/Trail of Bits em vez de checklist.

### Gaps
- Não achei threads relevantes no Reddit r/ClaudeAI nesta pesquisa (a busca não retornou Reddit). Faltam opiniões de lá.
- Não existe benchmark público independente comparando reviewers da comunidade; isso foi reconhecido na própria thread do HN.
- O blog de hamy.xyz sobre reviewers paralelos falhou ao carregar ([HN 47091783](https://news.ycombinator.com/item?id=47091783)).

---

## 4. Incidentes e alertas de segurança sobre skills/plugins maliciosos ou arriscados (2025–2026)

### Takeaway
Entre 2025 e 2026 houve campanhas reais de skills maliciosas, sobretudo no ClawHub (OpenClaw), mirando também usuários de Claude Code. Houve CVEs em configs de repositório (hooks/MCP executados antes do trust dialog), um worm via hook `SessionStart` que levou a desativar 73 repos da Microsoft, e pesquisas mostrando que scanners estáticos de skills são fáceis de evadir. Skills e plugins de revisão e segurança costumam pedir `Bash`, `Write` e `Task` e leem código não confiável. Por isso são vetores naturais de prompt injection.

### Cited Findings
- **ClawHub / "ClawdBot skills ganked your crypto"** (OpenSourceMalware, 2026-02-01, atualizado em 02 e 03/02):
  - 386 skills maliciosas no ClawHub, espelhadas no repo GitHub `openclaw/skills`, disfarçadas de ferramentas de cripto;
  - engenharia social estilo ClickFix: "AuthTool" obrigatório, base64 → binário de segunda fase (cepa NovaStealer no macOS) e ZIP com senha no Windows;
  - alvos: chaves de exchange, wallets, Keychain, SSH, credenciais cloud/Git e `.env`;
  - autor principal `hightower6eu` (354 skills).
  - Fonte: [opensourcemalware.com](https://opensourcemalware.com/blog/clawdbot-skills-ganked-your-crypto); discussão no HN "Malicious skills targeting Claude Code and Moltbot users" (181 pontos, 87 comentários): [HN 46827731](https://news.ycombinator.com/item?id=46827731)
- **Snyk ToxicSkills** (2026-02-05):
  - 3.984 skills de ClawHub e skills.sh varridas com o motor `mcp-scan`;
  - 534 (13,4%) com ao menos um problema CRITICAL e 1.467 (36,82%) com alguma falha;
  - 76 payloads maliciosos confirmados (8 ainda no ar);
  - prompt injection em 91% das skills maliciosas;
  - segredos hardcoded em 10,9% das skills do ClawHub;
  - exposição a conteúdo de terceiros em 17,7%.
  - Recomenda `uvx mcp-scan@latest --skills`, rotacionar credenciais e tratar skills como supply chain (npm/PyPI).
  - **Atenção:** a manchete de busca ("Prompt Injection in 36%, 1467 Malicious Payloads") confunde as métricas. O artigo diz 36,82% *com alguma falha* e 76 payloads *maliciosos confirmados*.
  - Fonte: [Snyk](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)
- **Compilação da Adversa.AI** (dez ataques a Claude Code entre set/2025 e set/2026):
  - **Miasma worm (2026-06-05):** uma conta de contribuidor comprometida fez commit em `Azure/durabletask` com configs que rodavam payload de roubo de credenciais ao abrir o repo em Claude Code (hook `SessionStart` em `.claude/settings.json`), Gemini CLI, Cursor ou VS Code. O GitHub desativou 73 repos em 4 orgs da Microsoft numa varredura automatizada de 105 segundos, derrubando `Azure/functions-action` e quebrando CI/CD.
  - **Check Point:** execução de hooks e MCP antes do trust dialog, CVE-2025-59536 (corrigido na 1.0.111) e CVE-2026-21852 (corrigido na 2.0.65).
  - **Plugin4Shell (AIR Security):** bypass de SHA pinning de plugins com exposição zero-click via auto-update; corrigido na 2.1.179.
  - **SkillCloak (arXiv 2607.02357):** evasão de scanners de skills em Claude Code e Codex.
  - **TrustFall (Adversa):** MCP via config de projeto, com variante sem supervisão pela GitHub Action oficial.
  - **SymJack:** symlink para `.claude/settings.json` / `.mcp.json`.
  - **GhostApproval (Wiz):** prompt de aprovação de edição de settings.
  - **Deny rules ignoradas acima de 50 subcomandos:** via `CLAUDE.md` envenenado; corrigido na v2.1.90.
  - Fonte: [adversa.ai](https://adversa.ai/blog/claude-code-vulnerabilities/). É um agregador; a maioria das entradas não tem data.
- A CSA Research Note (2026-05-06) diz que a Embrace the Red escondeu instruções num SKILL.md com Unicode invisível (Tag characters) e que a Anthropic atualizou o Claude Code para detectar e recusar esse conteúdo. Fonte secundária; não verifiquei o post original — [CSA](https://labs.cloudsecurityalliance.org/research/csa-research-note-skill-md-agent-context-poisoning-20260506/)
- O Red Hat Developer (2026-08-18) alerta que um hook comprometido pode ler credenciais cloud do ambiente, instalar pacotes, exfiltrar dados e criar persistência — [Red Hat](https://developers.redhat.com/articles/2026/08/18/securing-claude-code-plug-ins-best-practices-repository-security)
- Pesquisas acadêmicas: "Do Not Mention This to the User" (detecção de skills maliciosas na prática) — [arXiv 2602.06547](https://arxiv.org/pdf/2602.06547); ataques semânticos de supply chain em registries de SKILL.md — [arXiv 2605.11418](https://arxiv.org/pdf/2605.11418); avaliação de risco de skill files maliciosos — [arXiv 2608.05223](https://arxiv.org/pdf/2608.05223). Só vi títulos e snippets; não li os PDFs.
- Ferramentas defensivas da comunidade:
  - `NVIDIA/SkillSpector` (20,7k stars): detecta prompt injection, exfiltração e riscos de supply chain em skills — [repo](https://github.com/NVIDIA/SkillSpector)
  - `snyk/agent-scan` (ex-mcp-scan; 3,2k) — [repo](https://github.com/snyk/agent-scan)
  - `Pantheon-Security/medusa` (1k), que vê se `.claude/` é seguro antes de clonar — [repo](https://github.com/Pantheon-Security/medusa)
  - Gryph (SafeDep), com hooks e políticas YAML — [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
  - `cfitzgerald-pd/skillcop` (POC; 8 stars) — [repo](https://github.com/cfitzgerald-pd/skillcop)
- Riscos observados nos próprios itens de revisão e segurança (fatos dos frontmatters vistos acima):
  - os agentes do wshobson não declaram `tools` e herdam tudo;
  - o `code-reviewer` e o `architect-reviewer` do VoltAgent têm `Write`/`Edit`/`Bash`;
  - o `code-reviewer-pro` do lst97 tem `WebFetch`/`WebSearch` mais MCPs de terceiros. A combinação de ler código não confiável, buscar na web e rodar Bash é o cenário clássico de exfiltração por prompt injection (**palpite** sobre o risco; a combinação de tools é fato);
  - o `fp-check` da Trail of Bits tem `Bash`, `Write`, `Edit` e `Task` e constrói PoCs (`poc-builder`), o que é legítimo para auditoria mas exige sandbox;
  - `senior-security` (alirezarezvani) e `supply-chain-risk-auditor` executam scripts/comandos. Os scripts não foram auditados aqui.

### Inferences
- **Estimativa:** os maiores incidentes documentados ocorreram no ClawHub (OpenClaw), não no marketplace padrão do Claude Code. Mas usuários de Claude Code foram alvo explícito, e os CVEs/worm envolvem diretamente `.claude/settings.json` e hooks.
- **Palpite:** para instalar skills/plugins de revisão e segurança:
  - fixar por commit SHA;
  - ler SKILL.md e scripts antes de usar, procurando Unicode invisível, `curl | bash` e base64;
  - preferir autores institucionais (Trail of Bits, Sentry) ou copiar o prompt para o próprio repo em vez de instalar o plugin;
  - restringir `tools`/`allowed-tools`;
  - rodar scanners (agent-scan / SkillSpector) no CI.

### Gaps
- Não encontrei incidente público de skill/agente **de code review especificamente** malicioso. Os casos são de skills de cripto/utilidades, hooks e configs.
- Não verifiquei telemetria nos repos citados (por exemplo, se `davila7/claude-code-templates` ou o ECC coletam analytics no CLI). Isso fica em aberto.
- Não consegui acessar os relatórios originais da Check Point, da Embrace the Red e da AIR Security; os dados vêm do agregador Adversa e da CSA.
