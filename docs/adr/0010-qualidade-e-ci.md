# ADR-0010: Qualidade de código e integração contínua

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | Monorepo inteiro, GitHub |

## Contexto

O repositório é privado, numa conta pessoal do GitHub, no plano gratuito. **Fato:** nesse plano, repositórios privados não têm proteção de branch, CodeQL nem revisão de dependências (os dois últimos exigem o GitHub Advanced Security). O fundador trabalha sozinho, mas quer que todo código passe por pull request, com testes, e não quer atualizações automáticas de dependências. Em agosto de 2025, versões maliciosas de pacotes do Nx foram publicadas no npm (**fato**), o que torna a cadeia de dependências um risco concreto.

## Decisão

### Código

- **TypeScript estrito** em todos os projetos.
- **ESLint** com `typescript-eslint` no modo estrito com tipos, mais as regras de fronteira (`@nx/enforce-module-boundaries` e eslint-plugin-boundaries, [ADR-0001](0001-monorepo-nx-e-nomes.md) e [ADR-0002](0002-arquitetura-hexagonal-por-contexto.md)).
- **Prettier** para formatação.

### Commits e branches

- **Conventional Commits**, verificados por **commitlint**. O escopo é o nome do projeto (`feat(takt-core-api): ...`, `test(sim-engine): ...`) ou `docs`, `repo`, `ci`.
- **Todo código entra na `main` por pull request**, mesmo com uma pessoa só.
- **Branches curtas** a partir da `main`: `tipo/descricao-curta` (por exemplo, `feat/plant-publish`).
- **Sem proteção de branch no GitHub** (plano gratuito). A regra é imposta localmente: um hook `pre-push` recusa push direto para a `main`.

### Hooks locais (husky)

- **pre-commit:** lint e formatação só nos arquivos alterados (lint-staged) e busca de segredos (gitleaks).
- **commit-msg:** commitlint.
- **pre-push:** recusa push para a `main`.

### CI a cada pull request (GitHub Actions)

1. Instalação com lockfile congelado (`pnpm install --frozen-lockfile`).
2. Lint, typecheck e build dos projetos afetados (`nx affected`).
3. **Todos os testes de todos os projetos**, com as metas de cobertura do [ADR-0009](0009-estrategia-de-testes.md). Quando a suíte ficar lenta, a troca para "só os afetados" vira um ADR novo.
4. Segurança: gitleaks, `pnpm audit` (falha em vulnerabilidades altas e críticas) e **Semgrep** (análise estática gratuita, no lugar do CodeQL).

O pull request só pode ser mesclado com o CI verde (regra combinada; o plano gratuito não a impõe).

### Execução noturna

- Suíte completa e testes de mutação (Stryker), só quando a `main` mudou desde a última execução, para poupar minutos do GitHub Actions.

### Dependências

- **Sem atualizações automáticas** (nem Dependabot nem Renovate abrindo pull requests).
- **Alertas de vulnerabilidade** do GitHub ligados, só como aviso.
- Atualização **manual**, num pull request próprio, revisando o que mudou.
- **Idade mínima de publicação** configurada no pnpm: uma versão recém-publicada não é instalada antes de alguns dias.
- Scripts de instalação de dependências bloqueados, exceto os da lista `onlyBuiltDependencies`.

### Pull request

- Modelo com checklist: testes (AAA, ID da regra, cobertura), autorização, documentação (ADR, PDR, regras, arquitetura), sem segredos.

## Alternativas consideradas

- **Biome:** mais rápido, lint e formatação numa ferramenta só, mas não roda plugins do ESLint, dos quais dependemos para as fronteiras.
- **GitHub Pro** (proteção de branch): descartado pelo custo; substituído pelo hook `pre-push` e pela regra combinada.
- **CodeQL:** pago em repositório privado; substituído pelo Semgrep.
- **Dependabot ou Renovate abrindo pull requests:** descartado por decisão do fundador.
- **Testes só dos projetos afetados:** mais rápido; adiado até a suíte ficar lenta.

## Consequências

**Positivas:**
- Nada entra na `main` sem lint, tipos, testes e verificação de segurança.
- Histórico legível por commits padronizados.

**Negativas e custos:**
- **A regra do pull request não é imposta pelo GitHub.** Um push forçado pela interface ou com o hook desligado passa.
- **Fato:** o plano gratuito tem uma cota mensal de minutos do GitHub Actions para repositórios privados. A suíte completa a cada pull request e a mutação noturna consomem essa cota.
- Atualizações manuais podem atrasar correções de segurança; os alertas mitigam.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Action de terceiros comprometida** | Código malicioso rodando no CI, com acesso ao repositório | Actions fixadas pelo hash do commit, não pela tag; só actions oficiais ou amplamente usadas |
| **Token do CI com permissões demais** | Um passo comprometido altera o repositório | `permissions: contents: read` por padrão; escrita só onde for necessária |
| **Segredos expostos em logs do CI** | Vazamento de credenciais | Segredos só em *GitHub Secrets*; nenhum segredo necessário para os pull requests no MVP |
| **Dependência maliciosa** | Roubo de credenciais | Lockfile congelado, idade mínima de publicação, scripts de instalação bloqueados, revisão manual de atualizações |
| **Segredo commitado** | Credenciais no histórico | gitleaks no pre-commit e no CI |

## Conformidade

- O CI falha em lint, tipos, testes, cobertura, gitleaks, `pnpm audit` (altas e críticas) e Semgrep.
- O commitlint recusa mensagens fora do padrão.
- O hook `pre-push` recusa push para a `main`.
- A skill de revisão confere o checklist do modelo de pull request.

## Relacionados

- [ADR-0001](0001-monorepo-nx-e-nomes.md), [ADR-0002](0002-arquitetura-hexagonal-por-contexto.md), [ADR-0009](0009-estrategia-de-testes.md).

## Em aberto

- **Futuro:** agentes de revisão rodando automaticamente em cada pull request, depois que os agentes e as skills existirem.
- Versionamento e releases (tags, changelog), quando houver deploy.
- Quantos dias de idade mínima para uma versão nova de dependência.
