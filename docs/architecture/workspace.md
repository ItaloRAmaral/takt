# Workspace

> **Resumo.** Como o monorepo é montado hoje: projetos, versões fixadas, segurança da instalação, lint, testes, cobertura, mutação, hooks locais e CI. O porquê está nos ADRs [0001](../adr/0001-monorepo-nx-e-nomes.md), [0009](../adr/0009-estrategia-de-testes.md), [0010](../adr/0010-qualidade-e-ci.md) e [0011](../adr/0011-motor-de-simulacao-e-esquema.md); os comandos, no `CLAUDE.md`, seção "Commands".

Atualizado em 04/11/2026. Criado pelo plano [Workspace Nx do marco 1](../plans/2026-11-03-workspace-nx.md), cujas notas de execução registram cada desvio.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `libs/sim-engine` (`@takt/sim-engine`) | Motor de simulação; tags `type:lib`, `scope:shared`; depende só dos tipos do esquema |
| `libs/plant-schema` (`@takt/plant-schema`) | Esquema da planta; mesmas tags; nunca importa o motor |
| `apps/` | Vazia até o marco 2 |
| `eslint.config.mjs`, `vitest.config.mts`, `tsconfig.base.json`, `nx.json` | Configuração compartilhada na raiz |

As bibliotecas não têm build próprio: exportam `src/index.ts` e quem consome compila. Cada uma usa `erasableSyntaxOnly`, `lib: ["ES2025"]` sem `DOM` e `types: []`, então o `tsc` já recusa `document` ou `window`. A referência de projeto do motor para o esquema é mantida pelo `nx sync`.

**Nx sem daemon e sem Nx Cloud** (`useDaemonProcess: false`, `neverConnectToCloud: true`): o daemon do Nx 24 instala o `nx@latest` em segundo plano, fora do lockfile e da política do pnpm, só para avisar sobre configuração de agentes de IA.

## Versões e atualização

Toda dependência tem versão exata (`saveExact`), sem `^` nem `~`. Node 24.22.2 (`.nvmrc` e `engines`, com `engineStrict`), pnpm 12.16.0 (`packageManager`), TypeScript 6.0.3 (motivo no [guia, seção 4](code-style.md#4-typescript)).

Para atualizar uma dependência: um pull request só para isso, com a versão publicada há **pelo menos 7 dias**, lendo o que mudou e qualquer script de instalação novo (ADR-0010).

**Idade mínima de 7 dias** (`minimumReleaseAge: 10080`, em minutos), decidida pelo fundador em 03/11/2026; resolve o "Em aberto" do ADR-0010. Vale também para as actions do CI e a imagem do Semgrep. Gatilho de revisão: um incidente público em que o pacote malicioso ficou publicado por mais de 7 dias, ou o pnpm mudar o padrão.

**Exceções em vigor** (`minimumReleaseAgeExclude`, cada uma aprovada pelo fundador e com data para sair):

| Exceção | Motivo | Remover depois de |
| --- | --- | --- |
| `semver@6.3.2` | Exigido pelo Babel via Nx; o `trustPolicy` recusa a 6.3.1, anterior à publicação confiável | 09/11/2026 |
| `nx` e 16 pacotes `@nx/*` na 24.0.3 | O Nx 24.0.2 fixa o `undici` 7.29.0, com 6 vulnerabilidades altas; a 24.0.3 fixa o 7.30.1 | 06/11/2026 |

**Overrides em vigor** (`overrides`, aprovados pelo fundador):

| Override | Motivo | Remover quando |
| --- | --- | --- |
| `qs: 6.16.1` | O `typed-rest-client` 2.3.1, via Stryker 10.1.1, fixa o `qs` 6.15.1, com 4 alertas moderados do Dependabot; o Stryker só o usa no `stryker init` e no reporter do *dashboard*, que o Takt não usa (04/11/2026) | O Stryker depender do `typed-rest-client` 3 (`qs ^6.16.0`) |

Alerta aberto de propósito: `minimatch` 10.2.5, via ESLint. A única correção é a versão principal 11, que o ESLint ainda não aceita, e os padrões vêm só da nossa configuração. Fecha quando o ESLint aceitar o `minimatch` 11.

## Segurança da instalação (`pnpm-workspace.yaml`)

- `strictDepBuilds: true` com `allowBuilds`: um pacote com script de instalação faz a instalação falhar até ser decidido. `allowBuilds` substitui o `onlyBuiltDependencies` citado nos ADRs 0001 e 0010, removido no pnpm 11. Hoje os dois scripts conhecidos estão **negados**, depois de lidos: o do `nx` (atualiza o cliente do Nx Cloud) e o do `@swc/core` (faria `npm install @swc/wasm` por fora da política). Liberar um exige ler o script e anotar o motivo no pull request.
- `trustPolicy: no-downgrade`: recusa uma versão com evidência de publicação pior que a anterior.
- `blockExoticSubdeps: true`: dependência indireta só do registro, nunca de git ou URL.
- O CI instala com `--frozen-lockfile`.

## Lint

A raiz aplica os presets `strictTypeChecked` e `stylisticTypeChecked` do typescript-eslint, só em arquivos TypeScript, mais as regras da [seção 4 do guia](code-style.md#4-typescript): sem `enum`, sem `export default` (exceto em `*.config.*`), sem `console`, nomes de arquivo e pasta em *kebab-case* (`eslint-plugin-check-file`) e as fronteiras do Nx por tag. Cada biblioteca acrescenta as proibições dela no próprio `eslint.config.mjs`: o motor proíbe `Math.random`, `Date.now`, `new Date()`, `Date()`, `performance.now`, os acessos por `globalThis`, globais do navegador, React, Three.js e imports de valor do esquema; o esquema proíbe importar o motor e os globais do navegador.

**Uma regra redefinida num projeto substitui as opções da raiz.** Por isso a raiz exporta `noEnum` e `browserGlobals`, e o motor repete `noEnum` na própria lista de `no-restricted-syntax`.

**Testes de conformidade** (`libs/*/src/lint-conformance.spec.ts`): rodam o ESLint de verdade, com a configuração real, sobre trechos de código, e verificam a regra e a linha de cada erro, com controles positivos para a configuração não bloquear tudo. Desligam a informação de tipos (`disableTypeChecked`) porque o arquivo verificado não existe no disco e nenhuma regra testada precisa de tipos. Mudar o `eslint.config.mjs` da raiz invalida o cache desses testes; atualizar só o ESLint ou um plugin, não (o CI não usa cache remoto).

## Testes, cobertura e mutação

- **Vitest** em cada biblioteca, `vitest run`. Cobertura v8 sobre `src/**/*.ts`, sem os `*.spec.ts`, com mínimo de **90% de linhas e de ramificações**. As metas só são conferidas com `--coverage`.
- **Stryker** só no motor (`pnpm nx run sim-engine:mutate`), com `break: 80`. Três contornos, comentados em `libs/sim-engine/stryker.config.mjs`: roda **da raiz**, porque um sandbox só da pasta do motor quebra os caminhos para `tsconfig.base.json` e para o ESLint da raiz; os plugins são listados pelo nome, porque com pnpm o padrão `@stryker-mutator/*` não os encontra; `vitest.related: false`, para rodar também testes que não importam código. Relatório em `reports/mutation/sim-engine.html`.

## Hooks locais (husky)

O `pnpm install` ativa os hooks (script `prepare`, que grava `core.hooksPath = .husky/_` no `.git/config`).

| Hook | O que faz |
| --- | --- |
| `pre-commit` | Falha se o `gitleaks` não estiver instalado; roda o lint-staged (Prettier e `eslint --max-warnings=0 --no-warn-ignored` nos arquivos preparados) e `gitleaks git --pre-commit --staged --redact` |
| `commit-msg` | commitlint: Conventional Commits; escopo opcional, mas só `sim-engine`, `plant-schema`, `takt-web-app`, `takt-core-api`, `docs`, `repo` ou `ci`; linhas do corpo com até 100 caracteres |
| `pre-push` | Recusa push direto para `refs/heads/main` |

O Prettier ignora `*.md`, `.claude/`, o lockfile e as saídas de build, cobertura e mutação.

**Instalar o gitleaks 8.30.1** (fora do npm): baixar `gitleaks_8.30.1_linux_x64.tar.gz` (ou `darwin_arm64`, `windows_x64.zip`) e `gitleaks_8.30.1_checksums.txt` do [release oficial](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1), conferir com `sha256sum --check --ignore-missing gitleaks_8.30.1_checksums.txt` e colocar o binário num diretório do PATH (por exemplo `~/.local/bin`). Uma interface gráfica do git que não carrega esse PATH faz o `pre-commit` falhar com a mensagem do gitleaks.

## CI (GitHub Actions)

| Workflow | Quando | O que faz |
| --- | --- | --- |
| `ci.yml`, job `checks` | Pull request para a `main` | Instalação congelada; `nx affected -t lint typecheck build`; testes com cobertura em todos os projetos; `pnpm audit --audit-level high` |
| `ci.yml`, job `gitleaks` | Idem | `gitleaks-action` com o gitleaks 8.30.1, sem comentários no pull request |
| `ci.yml`, job `semgrep` | Idem | `semgrep scan --config p/default --metrics=off --error` no container oficial |
| `nightly.yml` | 06:00 UTC e manual | Se a `main` mudou desde a última execução bem-sucedida na `main`: testes com cobertura e mutação, sempre na `main` |

- Permissões só de leitura: `contents: read`; `pull-requests: read` no job do gitleaks (lê os commits do pull request num repositório privado); `actions: read` no noturno (consulta execuções anteriores). Nenhum `checkout` guarda o token (`persist-credentials: false`).
- Toda action é fixada pelo hash do commit, com a tag num comentário; a imagem do Semgrep, pelo *digest*. Atualizar uma action segue a regra das dependências: release com 7 dias, hash conferido com `gh api repos/<dono>/<repo>/git/ref/tags/<tag>` (tag anotada: abrir com `git/tags/<sha>`).
- No GitHub (*Settings → Code security*, feito à mão pelo fundador): alertas do Dependabot ligados, só como aviso; atualizações automáticas desligadas (ADR-0010).
