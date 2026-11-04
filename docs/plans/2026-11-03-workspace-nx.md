# Plano: workspace Nx do marco 1

| Campo | Valor |
| --- | --- |
| Status | Aprovado (03/11/2026) |
| Data | 03/11/2026 |
| Pedido | "Plano do workspace Nx: monorepo, bibliotecas `@takt/sim-engine` e `@takt/plant-schema` vazias com as ferramentas, Vitest, ESLint, Stryker, TypeScript 6.0.3 fixado, flags do tsconfig, regras de fronteira, metas de cobertura e mutação, e a seção 'Commands' do `CLAUDE.md`." Escopo ampliado pelo usuário: inclui os hooks locais e o CI do ADR-0010. |
| Contexto | [ADR-0001](../adr/0001-monorepo-nx-e-nomes.md), [ADR-0009](../adr/0009-estrategia-de-testes.md), [ADR-0010](../adr/0010-qualidade-e-ci.md), [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md), [ADR-0012](../adr/0012-front-end.md), [ADR-0013](../adr/0013-erros-esperados.md), [code-style.md](../architecture/code-style.md) seções 4, 5, 7, 8, 10 e 11, [milestones.md](../product/milestones.md), [casos de uso do marco 1](../product/use-cases/README.md) |
| Roteiro | — (pré-requisito do roteiro do motor) |

**Objetivo:** um monorepo Nx onde as duas bibliotecas do marco 1 existem vazias e lint, tipos, testes, cobertura, mutação, hooks e CI já funcionam e bloqueiam o que os ADRs proíbem, antes da primeira linha do motor.

**Arquitetura:** o workspace é gerado pelo `create-nx-workspace` numa pasta temporária, fora do repositório, e só os arquivos listados são copiados, para não sobrescrever `CLAUDE.md`, `docs/` e `.claude/`. O lockfile do gerador é descartado: o do repositório nasce já sob a política do pnpm. As bibliotecas usam o modo do Nx com *workspaces* do pnpm e referências de projeto do TypeScript (preset `ts`), sem build próprio (`bundler: none`): quem consome compila.

**Regras e registros:** ADR-0001 (Nx, nomes, tags, Node 24, pnpm 12, riscos de cadeia de suprimentos), ADR-0009 (Vitest, Stryker, metas), ADR-0010 (TypeScript estrito, typescript-eslint, Prettier, commitlint, husky, CI, dependências), ADR-0011 (motor puro, sem `Math.random`, depende só dos tipos do esquema), ADR-0013 (erros), `code-style.md` seções 4 e 7. Nenhum `RN-...` nem `UC-...`: este plano não implementa comportamento de produto.

## Restrições globais

- **Versões exatas** (sem `^` nem `~`), cada uma publicada há pelo menos 7 dias em 03/11/2026: Node **24.22.2**; pnpm **12.16.0**; TypeScript **6.0.3**; Nx (`nx`, `@nx/js`, `@nx/vitest`, `@nx/eslint`, `@nx/eslint-plugin`) **24.0.2**; ESLint **10.13.0**; `@eslint/js` **10.0.1**; `typescript-eslint` **8.72.1**; Prettier **3.9.10**; Vitest e `@vitest/coverage-v8` **5.0.5**; Vite **8.3.5** (dependência par do Vitest 5); Stryker (`@stryker-mutator/core`, `vitest-runner`, `typescript-checker`) **10.1.1**; `eslint-plugin-check-file` **3.3.2**; husky **9.1.7**; lint-staged **17.6.0**; `@commitlint/cli` e `@commitlint/config-conventional` **21.2.4**; gitleaks **8.30.1** (binário). Fonte: registro do npm e GitHub, consultados em 03/11/2026. Uma versão nova só entra num pull request próprio (ADR-0010).
- **Idade mínima de publicação:** 7 dias (`minimumReleaseAge: 10080`, em minutos), também para as actions do CI e a imagem do Semgrep.
- **Nomes e tags** (ADR-0001): pastas `libs/sim-engine` e `libs/plant-schema`, pacotes `@takt/sim-engine` e `@takt/plant-schema`, tags `type:lib` e `scope:shared` nas duas.
- **Metas** (ADR-0009): 90% de linhas e 90% de ramificações em todo projeto; 80% de mutação no motor (`thresholds.break: 80`); a mutação roda à noite, não a cada pull request.
- **Escopos do commitlint** (ADR-0010): `sim-engine`, `plant-schema`, `takt-web-app`, `takt-core-api`, `docs`, `repo`, `ci`.
- **Nenhum cache remoto do Nx** e nenhuma conexão com o Nx Cloud (ADR-0001, riscos).
- **Fora do alcance das ferramentas:** nada gerado substitui `CLAUDE.md`, `AGENTS.md`, `docs/` ou `.claude/`; Prettier e ESLint ignoram `.claude/` (configuração do Claude Code, protegida por este plano).
- **Textos em código em inglês** (`CLAUDE.md`, "Language"), inclusive mensagens dos hooks.

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |
| Idade mínima de uma versão antes de instalá-la ("Em aberto" no ADR-0010) | 7 dias | 03/11/2026 |
| Incluir hooks locais e CI neste plano | Sim | 03/11/2026 |
| Atualizar o Node e o pnpm da máquina | Sim; feito em 03/11/2026: Node 24.22.2 (padrão do nvm) e pnpm 12.16.0 pelo corepack | 03/11/2026 |
| Nome de teste sem `RN-...` nem `UC-...` | Só a descrição do comportamento, sem ID; vale para todo o projeto (`CLAUDE.md`, guia seção 10, skill de testes) | 03/11/2026 |
| Escopo do commit | Opcional; quando houver, só os da lista | 03/11/2026 |
| `pnpm audit` com 6 vulnerabilidades altas no `undici` 7.29.0, fixado pelo Nx 24.0.2 (tarefa 7) | Exceção na idade mínima para o Nx 24.0.3 (30/10/2026), que fixa o `undici` 7.30.1; 17 pacotes `nx`/`@nx/*` em `minimumReleaseAgeExclude`, a remover depois de 06/11/2026 | 04/11/2026 |

## Decisões técnicas deste plano

| Decisão | Evidência |
| --- | --- |
| `allowBuilds` (lista vazia de início) e `strictDepBuilds` no lugar de `onlyBuiltDependencies`, citado nos ADRs 0001 e 0010 | **fato:** o pnpm 11 removeu `onlyBuiltDependencies` e o substituiu por `allowBuilds` ([pnpm, build settings](https://pnpm.io/settings#allowbuilds)); a intenção dos ADRs é a mesma |
| `trustPolicy: no-downgrade` e `saveExact: true` | **fato:** o primeiro recusa uma versão cuja evidência de publicação piorou ([pnpm, supply chain security](https://pnpm.io/supply-chain-security)); o segundo grava versões exatas nos próximos `pnpm add` |
| Gerar numa pasta temporária, com `minimumReleaseAge` global de 7 dias durante a geração, e descartar o lockfile gerado | o `create-nx-workspace` 24.0.2 não tem opção para pular a instalação (conferido no código) e pode criar arquivos de agente; os padrões globais do pnpm 12 já bloqueiam scripts de instalação (**fato:** [pnpm](https://pnpm.io/supply-chain-security)) |
| `exactOptionalPropertyTypes` ligado | **fato:** o Zod 4 trata a flag com `.exactOptional()` ([docs do Zod](https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx)); condição do guia cumprida |
| `eslint-plugin-check-file` para nomes de arquivos e pastas em *kebab-case* | o guia deixa "plugin a escolher"; o check-file só faz isso (Apache-2.0, ativo em 09/2026), o `unicorn` traria centenas de regras |
| Prettier com `singleQuote: true`; sem formatar Markdown nem `.claude/` | os exemplos de código dos docs usam aspas simples; os docs têm tabelas escritas à mão, que o Prettier realinharia a cada edição |
| `lib` do TypeScript sem `DOM` e `no-restricted-globals` nas duas bibliotecas | o motor e o esquema não usam APIs do navegador (ADR-0011); o `tsc` e o lint acusam, e o teste de conformidade mantém a regra |
| Semgrep com `--config p/default --metrics=off` | **fato:** o Semgrep CE roda sem conta com `semgrep scan` no container `semgrep/semgrep` ([docs](https://docs.semgrep.dev/deployment/oss-deployment)); **palpite:** o conjunto `p/default` é o ponto de partida razoável, revisável no primeiro achado falso |
| CI noturno às 06:00 UTC (03:00 em Brasília) | **palpite:** fora do horário de trabalho; o ADR-0010 só pede "à noite" |
| Sem `fast-check` e sem `zod` por enquanto | entram no primeiro sub-plano que os usa (YAGNI) |

## Foco de revisão

1. **Biblioteca sem nenhum teste:** cada biblioteca nasce com o teste de conformidade de lint (tarefa 3), então `vitest run` nunca roda vazio e `passWithNoTests` não é usado.
2. **Cobertura de uma biblioteca só com `export {}`:** zero instruções. Esperado: a meta de 90% passa. Conferir na tarefa 4 e registrar a saída; se falhar, volta para o usuário.
3. **Stryker sem nada para mutar, e com o teste de conformidade no *sandbox*:** esperado: termina sem erro. O teste de conformidade lê a configuração da raiz, que pode não existir na cópia do Stryker. Conferir na tarefa 5; se falhar, o passo de mutação do CI noturno fica desligado até o primeiro sub-plano do motor, e isso volta para o usuário.
4. **Dependência com script de instalação:** `strictDepBuilds` faz a instalação falhar e citar o pacote. Cada entrada em `allowBuilds` exige ler o script antes e anotar o motivo no pull request.
5. **Versão com menos de 7 dias:** a instalação recusa. A correção é escolher a versão anterior, nunca baixar o `minimumReleaseAge`.
6. **Versão recusada pelo `trustPolicy`:** recusar e levar ao usuário; nunca afrouxar a política em silêncio.
7. **Node diferente de 24.22.2:** `engineStrict` faz a instalação falhar com a versão esperada.
8. **Configuração de lint que bloqueia tudo:** controles positivos (arquivo correto, arquivo de configuração com `export default`, nomes `*.spec.ts` e `*.config.ts`), todos com zero erros.
9. **Desvios das proibições do motor:** `Date()` sem `new`, `globalThis.Math.random()`, `globalThis.Date.now()`, import de tipo × de valor de `@takt/plant-schema`.
10. **`pre-push`:** recusa só a referência remota exatamente `refs/heads/main`; uma branch `main-fix` passa.
11. **`pre-commit` sem o gitleaks instalado:** falha com mensagem clara, nunca passa em silêncio.
12. **Commit sem escopo** passa; escopo fora da lista é recusado; tipo fora do Conventional Commits é recusado.
13. **CI noturno:** pula quando a `main` não mudou desde a última execução bem-sucedida **na `main`**; roda quando nunca houve uma; uma execução manual em outra branch não conta.
14. **Prettier e ESLint não tocam em `docs/**/*.md` nem em `.claude/`.**
15. **Cache local do Nx:** uma mudança na configuração de lint da raiz invalida os testes de conformidade (`sharedGlobals`).

## Segurança

| Ameaça (ADR de origem) | Como este plano trata | Tarefa e teste |
| --- | --- | --- |
| Dependência maliciosa ou comprometida (ADR-0001, ADR-0010) | versões exatas; lockfile criado já sob a política, nunca copiado do gerador; `--frozen-lockfile` no CI; `minimumReleaseAge` de 7 dias, também na geração; `strictDepBuilds` com `allowBuilds` vazio; `trustPolicy: no-downgrade`; `blockExoticSubdeps` explícito | T1: verificações dos valores, da recusa de uma versão de 1 dia e da falha com outro Node; T7: instalação congelada |
| Alertas de vulnerabilidade só como aviso (ADR-0010, ADR-0001) | alertas do Dependabot ligados, atualizações automáticas de segurança desligadas | T7, passo 5 (usuário) |
| Segredo commitado (ADR-0001, ADR-0010) | `.gitignore` com `.env*` (exceto `.env.example`); gitleaks no pre-commit, que falha se o binário faltar, e no CI | T6 (usuário): segredo falso recusado; T7: job do gitleaks |
| Cache remoto do Nx envenenado (ADR-0001) | sem Nx Cloud (`--nxCloud=skip`) e sem cache remoto em `nx.json` | T1: `nx.json` sem `nxCloudId` nem `accessToken` |
| Fronteira violada (ADR-0001) | proibições do motor e do esquema testadas já (React, Three.js, DOM, motor no esquema); as `depConstraints` entre apps e bibliotecas ficam configuradas, mas só podem ser exercitadas quando existir a primeira app: o teste delas fica para o plano do marco 2 | T3: testes de conformidade |
| Action de terceiros comprometida (ADR-0010) | toda action fixada pelo hash do commit, com a tag num comentário, publicada há pelo menos 7 dias; imagem do Semgrep fixada por *digest* | T7 |
| Token do CI com permissões demais (ADR-0010) | `permissions: contents: read` no topo; `actions: read` só no job noturno que consulta execuções anteriores; comentários do gitleaks desligados (`GITLEAKS_ENABLE_COMMENTS: false`), para não exigir escrita em pull requests | T7 |
| Segredos expostos em logs do CI (ADR-0010) | nenhum segredo nos workflows; o gitleaks-action dispensa licença em conta pessoal (**fato:** [README](https://github.com/gitleaks/gitleaks-action)) | T7 |
| Dados reais em testes, credenciais e usuário privilegiado do banco (ADR-0009) | não se aplicam: não há banco nem dados neste plano | — |
| Itens de segurança da seção 11 do guia | "nenhum segredo em arquivo versionado, inclusive configuração de ferramentas" e "nenhum `console.log`" se aplicam; DTO, resposta de erro e log não, porque não há API | T3 (`no-console`), T6 (gitleaks) |

## Plano de testes

| Requisito | Nível | Teste | Tarefa |
| --- | --- | --- | --- |
| Motor sem fontes de não determinismo (ADR-0011; guia, seção 7) | unitário, tabela `it.each` | `rejects $api in the engine`, uma linha por forma: `Math.random()`, `globalThis.Math.random()`, `Date.now()`, `globalThis.Date.now()`, `new Date()`, `Date()`, `performance.now()` | 3 |
| Motor sem React nem Three.js (ADR-0001, ADR-0011) | unitário, `it.each` | `rejects importing $specifier in the engine`, uma linha por `react`, `react-dom`, `three`, `@react-three/fiber` | 3 |
| Motor sem globais do navegador (ADR-0011) | unitário, `it.each` | `rejects the browser global $name in the engine`, uma linha por `window`, `document`, `navigator`, `fetch`, `localStorage` | 3 |
| Motor importa só tipos do esquema (ADR-0011) | unitário | `allows a type import from the plant schema in the engine` e `rejects a value import from the plant schema in the engine` | 3 |
| Esquema não importa o motor (ADR-0001) | unitário | `rejects importing the engine in the plant schema` | 3 |
| Sem `enum`, sem `export default`, sem `console` (guia, seção 4) | unitário | `rejects enum declarations`, `rejects default exports`, `rejects console calls` (nas duas bibliotecas) | 3 |
| Nomes em *kebab-case* (guia, seção 4) | unitário | `rejects file names that are not kebab-case` | 3 |
| Controles positivos (foco 8) | unitário | `accepts a file that follows every rule`, `accepts a default export in a config file`, `accepts $name as a file name` (`it.each` com `plant.spec.ts` e `vite.config.ts`) | 3 |
| Metas de cobertura e mutação; hooks; CI; versões; pnpm | verificação | comandos e saídas esperadas em cada tarefa | 1, 2, 4 a 7 |

- **Níveis usados e por quê:** só unitário. Os testes de conformidade rodam o ESLint de verdade pela API (`ESLint#lintText`), sobre trechos literais, e verificam o `ruleId` e a linha de cada mensagem. Integração, API, propriedade e ponta a ponta não se aplicam: não há banco, rota, motor nem tela.
- **Nome dos testes:** não há `RN-...` nem `UC-...` para estas regras, então o nome é só a descrição do comportamento, sem ID (decisão do usuário). A coluna "Requisito" diz de qual ADR ou seção do guia vem cada regra.
- **Dados de teste:** trechos de código literais; tabelas `it.each` só com literais e o valor variável no nome (guia, seção 10).
- **Metas:** 90% de linhas e ramificações configuradas nas duas bibliotecas; mutação de 80% configurada no motor. Os arquivos de teste ficam fora da cobertura; nenhuma outra exclusão.
- **Como rodar:** os comandos que a tarefa 8 grava no `CLAUDE.md`.
- **Fica para outro plano:** a conferência do ADR-0013 ("`toMatchObject` e `rejects.toMatchObject` verificam o `code` de uma subclasse de `Error`") vai para o primeiro sub-plano do motor, junto com o helper `catchError` e o teste dele.

## Desvios do guia de estilo

Nenhum. Conferido: as flags do tsconfig e as regras de lint são as da seção 4; as proibições do motor são as da seção 7; a exceção de `export default` em arquivos de configuração é a prevista na seção 4.

## Registros novos propostos

Nenhum. A idade mínima de 7 dias resolve um "Em aberto" do ADR-0010 e fica registrada no doc vivo da tarefa 8, com a data e o gatilho de revisão.

## Cerimônia observada

Nenhuma.

---

## Pré-requisitos

- Node 24.22.2 e pnpm 12.16.0 na máquina: **feito** em 03/11/2026.
- gitleaks 8.30.1 instalado a partir do release oficial no GitHub, com o *checksum* conferido: pedir permissão ao usuário antes.
- `minimumReleaseAge` global de 7 dias (`pnpm config set minimumReleaseAge 10080 --location=global`): pedir permissão ao usuário antes, porque muda a configuração da máquina.
- Um shell novo (ou o VS Code reaberto), para o PATH apontar para o Node 24.

## Tarefa 1: workspace Nx, versões e segurança da instalação

**Arquivos:**
- Copiar do gerador e ajustar: `package.json`, `nx.json`, `tsconfig.base.json`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `.editorconfig`, e o arquivo de *workspace* do Vitest, se o preset o criar
- Criar: `pnpm-workspace.yaml` (escrito à mão, antes da instalação), `.nvmrc`, `pnpm-lock.yaml` (pela instalação no repositório)
- Não copiar: `pnpm-lock.yaml` do gerador (apagado), `README.md`, `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.github/`, qualquer arquivo de agente

**Interfaces:**
- Produz: o workspace com os comandos `pnpm nx ...`; `tsconfig.base.json` com as flags; `eslint.config.mjs` da raiz, que a tarefa 3 completa.

- [ ] **Passo 1:** numa pasta temporária fora do repositório, com o `minimumReleaseAge` global já em 10080, gerar: `pnpm dlx create-nx-workspace@24.0.2 takt --preset=ts --pm=pnpm --nxCloud=skip --skipGit --interactive=false --formatter=prettier --linter=eslint --unitTestRunner=vitest`. Conferir as opções com `--help` antes (nomes conferidos no código do Nx 24.0.2) e registrar a configuração efetiva do pnpm (`pnpm config list`).
- [ ] **Passo 2:** no repositório, escrever primeiro o `pnpm-workspace.yaml`: `packages: [libs/*, apps/*]`, `minimumReleaseAge: 10080`, `strictDepBuilds: true`, `allowBuilds: {}`, `trustPolicy: no-downgrade`, `blockExoticSubdeps: true`, `engineStrict: true`, `saveExact: true`. Depois copiar os arquivos da lista e ajustar:
  - `package.json`: `"private": true`, `"packageManager": "pnpm@12.16.0"`, `"engines": { "node": "24.22.2" }`, todas as dependências com a versão exata das restrições globais.
  - `.nvmrc`: `24.22.2`.
  - `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, `forceConsistentCasingInFileNames` (guia, seção 4).
  - `nx.json`: sem `nxCloudId`, sem `accessToken`, sem cache remoto; `namedInputs.sharedGlobals` com `{workspaceRoot}/eslint.config.mjs` (foco 15).
  - `.gitignore`: as entradas do gerador, mais `coverage`, `reports`, `.stryker-tmp`, `.env*` com exceção de `.env.example`, e `*.proof.ts` (arquivos temporários de prova das tarefas 2 e 4, que assim nunca entram num commit).
- [ ] **Passo 3: verificar.**
  - `pnpm install` cria o lockfile sem erro; `pnpm nx report` mostra Nx 24.0.2 e TypeScript 6.0.3; nenhuma versão com `^` ou `~` no `package.json`.
  - `pnpm add -D vitest@5.1.0` (publicado em 02/11/2026) é recusado pela idade mínima, e o lockfile não muda.
  - `pnpm config get strictDepBuilds` → `true`; se a instalação recusou algum script, registrar o pacote e o motivo antes de pôr em `allowBuilds` (foco 4).
  - `nvm exec 20 pnpm install` falha pelo `engines` (foco 7).
  - `git status` não mostra mudança em `CLAUDE.md`, `docs/` nem `.claude/`.

**Commit sugerido:** `chore(repo): create the Nx workspace with pinned toolchain` · arquivos: os da lista.

## Tarefa 2: bibliotecas `@takt/plant-schema` e `@takt/sim-engine`

**Arquivos:**
- Criar (pelo gerador): `libs/plant-schema/` e `libs/sim-engine/`, cada uma com `package.json`, `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.spec.json`, a configuração do Vitest, `eslint.config.mjs` e `src/index.ts`
- Modificar: os arquivos da raiz que o `--dry-run` mostrar (esperados: `tsconfig.json`, `nx.json`, `package.json`, `pnpm-lock.yaml`)

**Interfaces:**
- Consome: `tsconfig.base.json` e `eslint.config.mjs` da tarefa 1.
- Produz: os projetos Nx `plant-schema` e `sim-engine`, com os alvos `lint`, `typecheck` e `test` inferidos.

- [ ] **Passo 1:** para cada biblioteca, `pnpm nx g @nx/js:library --directory=libs/<pasta> --name=<pasta> --importPath=@takt/<pasta> --bundler=none --unitTestRunner=vitest --linter=eslint --tags=type:lib,scope:shared`. Rodar antes com `--dry-run` e anotar os arquivos da raiz que ele cria ou muda; conferir que as versões no `package.json` continuam exatas.
- [ ] **Passo 2:** em `tsconfig.lib.json` das duas: `erasableSyntaxOnly: true`, `lib: ["ES2025"]` (sem `DOM`), `types: []`. No `package.json` do motor, `@takt/plant-schema` como dependência do *workspace*.
- [ ] **Passo 3:** `src/index.ts` das duas contém só `export {};`. Apagar os arquivos de exemplo que o gerador criar.
- [ ] **Passo 4: verificar.** `pnpm nx show projects` → `plant-schema` e `sim-engine`; `pnpm nx run-many -t typecheck` passa; `libs/sim-engine/src/dom.proof.ts` com `export const title = document.title;` faz o `typecheck` falhar com "Cannot find name 'document'", e o arquivo é apagado em seguida.

**Commit sugerido:** `chore(repo): add plant-schema and sim-engine libraries` · arquivos: `libs/` e os arquivos da raiz anotados no passo 1.

## Tarefa 3: ESLint e testes de conformidade

**Arquivos:**
- Modificar: `eslint.config.mjs` (raiz), `libs/sim-engine/eslint.config.mjs`, `libs/plant-schema/eslint.config.mjs`
- Testar: `libs/sim-engine/src/lint-conformance.spec.ts`, `libs/plant-schema/src/lint-conformance.spec.ts`

**Interfaces:**
- Consome: `eslint.config.mjs` da raiz (tarefa 1); os projetos e as tags da tarefa 2.
- Produz: o alvo `lint` em cada projeto, com as regras abaixo.

- [ ] **Passo 1: escrever os testes que falham**, um por linha do "Plano de testes", por exemplo:

```ts
it.each([
  { api: 'Math.random()' },
  { api: 'Date.now()' },
])('rejects $api in the engine', async ({ api }) => {
  const code = `export const value = ${api};\n`;

  const messages = await lintEngineFile('value.ts', code);

  expect(messages).toContainEqual(expect.objectContaining({ ruleId: 'no-restricted-properties', line: 1 }));
});
```

  `lintEngineFile(name, code)` é um helper do próprio arquivo de teste: cria um `ESLint` com `cwd` na raiz do *workspace* e a configuração real, mais `overrideConfig: withoutTypeInformation` (`tseslint.configs.disableTypeChecked`), porque o arquivo não existe no disco e nenhuma regra testada precisa de tipos; chama `lintText(code, { filePath })` com o caminho absoluto `libs/sim-engine/src/<name>`. Sem comentário no teste: o nome da constante explica, e o motivo fica em `docs/architecture/workspace.md` (tarefa 8). O teste de import de valor verifica que há exatamente uma mensagem, na linha do import.
- [ ] **Passo 2:** `pnpm nx test sim-engine` e `pnpm nx test plant-schema` · Esperado: FALHA nas regras ainda não configuradas; o controle positivo de arquivo correto passa.
- [ ] **Passo 3: configurar.**
  - Raiz: `@nx/eslint-plugin` (`flat/base`, `flat/typescript`); `typescript-eslint` `strictTypeChecked` e `stylisticTypeChecked` com `projectService: true`; as regras da seção 4 do guia fora dos presets (`switch-exhaustiveness-check`, `prefer-readonly`, `consistent-type-imports`, `no-import-type-side-effects`, `naming-convention` conforme a tabela da seção 4), `no-restricted-syntax` para `TSEnumDeclaration`, `no-restricted-exports` para `default`, `no-console`, `eqeqeq`, `prefer-const`, `ban-ts-comment`, `only-throw-error`; `check-file/filename-naming-convention` e `check-file/folder-naming-convention` em `KEBAB_CASE`, com `ignoreMiddleExtensions: true`; `@nx/enforce-module-boundaries` com `depConstraints`: `scope:shared` só depende de `scope:shared` e `type:app` não depende de `type:app` (ADR-0001), `type:lib` só depende de `type:lib` (derivada da ameaça "fronteira violada" do ADR-0001).
  - Exceção para arquivos de configuração (`**/*.config.{ts,mts,mjs}`, `eslint.config.mjs`, `commitlint.config.mjs`, `stryker.config.mjs`): `export default` permitido e `disableTypeChecked` nos `.mjs` (guia, seção 4).
  - Ignorados: `.claude/**`, `coverage`, `reports`, `.stryker-tmp`, `dist`.
  - Motor: `no-restricted-properties` para `Math.random`, `Date.now` e `performance.now`; `no-restricted-syntax` para `new Date(...)`, `Date(...)` e os acessos por `globalThis` (`globalThis.Math`, `globalThis.Date`); `no-restricted-globals` para `window`, `document`, `navigator`, `fetch` e `localStorage`; `@typescript-eslint/no-restricted-imports` com `react`, `react-dom`, `three` e `@react-three/*` proibidos e `@takt/plant-schema` com `allowTypeImports: true`.
  - Esquema: `@typescript-eslint/no-restricted-imports` proibindo `@takt/sim-engine`; os mesmos `no-restricted-globals` do motor.
  - Conferir cada regra na documentação da versão fixada antes de gravar (guia, seção 4).
- [ ] **Passo 4:** os mesmos comandos · Esperado: PASSA; `pnpm nx run-many -t lint` passa em todos os arquivos reais, inclusive os de configuração.

**Commit sugerido:** `chore(repo): enforce lint rules from the ADRs with conformance tests` · arquivos: os três `eslint.config.mjs` e os dois `lint-conformance.spec.ts`.

## Tarefa 4: Vitest e metas de cobertura

**Arquivos:**
- Modificar: a configuração do Vitest de cada biblioteca (da tarefa 2)

- [ ] **Passo 1:** em cada biblioteca, `coverage: { provider: 'v8', include: ['src/**/*.ts'], exclude: ['src/**/*.spec.ts'], thresholds: { lines: 90, branches: 90 } }`.
- [ ] **Passo 2: verificar.** `pnpm nx test sim-engine --coverage` e o mesmo no esquema passam (foco 2: registrar a saída). Para provar o portão, `libs/sim-engine/src/gate.proof.ts` com uma função exportada e sem teste faz o comando falhar com a meta de 90%; o arquivo é apagado em seguida.

**Commit sugerido:** `chore(repo): add 90% line and branch coverage gates` · arquivos: as duas configurações do Vitest.

## Tarefa 5: Stryker no motor

**Arquivos:**
- Criar: `libs/sim-engine/stryker.config.mjs`
- Modificar: `libs/sim-engine/package.json` (alvo `mutate` em `nx.targets`, comando `stryker run`, `cwd: {projectRoot}`)

- [ ] **Passo 1:** `testRunner: 'vitest'`, `checkers: ['typescript']`, `tsconfigFile: 'tsconfig.lib.json'`, `mutate: ['src/**/*.ts', '!src/**/*.spec.ts']`, `thresholds: { high: 90, low: 80, break: 80 }`, `reporters: ['clear-text', 'progress', 'html']`, relatório em `reports/mutation/`. O esquema não tem mutação (ADR-0009: só motor e domínio da API).
- [ ] **Passo 2: verificar.** `pnpm nx run sim-engine:mutate` (foco 3: registrar a saída).

**Commit sugerido:** `chore(sim-engine): configure Stryker with an 80% break threshold` · arquivos: `stryker.config.mjs`, `package.json` do motor.

## Tarefa 6: Prettier, commitlint e hooks locais

**Arquivos:**
- Criar: `.prettierrc.json`, `.prettierignore`, `commitlint.config.mjs`, `.lintstagedrc.json`, `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`
- Modificar: `package.json` (script `prepare: husky`)

- [ ] **Passo 1:** `.prettierrc.json`: `{ "singleQuote": true }`; `.prettierignore`: `*.md`, `.claude`, `pnpm-lock.yaml`, `coverage`, `reports`, `.stryker-tmp`, `dist`.
- [ ] **Passo 2:** `commitlint.config.mjs`: `extends: ['@commitlint/config-conventional']`, `scope-enum` com os escopos das restrições globais (nível erro), escopo vazio permitido (decisão do usuário).
- [ ] **Passo 3:** `.lintstagedrc.json`: `*.{ts,tsx,mjs,js}` → `prettier --write` e `eslint --max-warnings=0`; `*.{json,yml,yaml}` → `prettier --write`.
- [ ] **Passo 4:** hooks, com mensagens em inglês:
  - `pre-commit`: se o binário `gitleaks` não existir, sai com erro e a mensagem "gitleaks 8.30.1 is required; see docs/architecture/workspace.md" (foco 11); senão, `pnpm exec lint-staged` e `gitleaks git --pre-commit --staged --redact` (conferir com `gitleaks git --help`).
  - `commit-msg`: `pnpm exec commitlint --edit "$1"`.
  - `pre-push`: lê as referências da entrada padrão e sai com erro se alguma referência remota for exatamente `refs/heads/main`, com a mensagem "Direct push to main is not allowed: open a pull request" (ADR-0010).
- [ ] **Passo 5: verificar, pelo usuário** (o Claude Code não roda `git commit` nem `git push`):
  - numa branch descartável, `feat(motor): x` é recusado; `feat(sim-engine): x` passa; `docs: x` passa;
  - um arquivo com `AKIA` seguido de 16 caracteres maiúsculos (segredo falso no formato de chave da AWS) é recusado pelo pre-commit; com o `gitleaks` fora do PATH, o pre-commit falha com a mensagem acima;
  - `git push origin HEAD:main` é recusado; o push de uma branch `main-fix` passa;
  - `pnpm exec prettier --check .` passa e não lista nenhum `.md` nem arquivo de `.claude/`.

**Commit sugerido:** `chore(repo): add prettier, commitlint and git hooks` · arquivos: os da lista.

## Tarefa 7: CI no GitHub Actions

**Arquivos:**
- Criar: `.github/workflows/ci.yml`, `.github/workflows/nightly.yml`, `.github/pull_request_template.md`

- [ ] **Passo 1: `ci.yml`**, em `pull_request` para a `main`, com `permissions: contents: read`:
  - job `checks`: checkout com histórico completo; pnpm pelo `packageManager`; Node pelo `.nvmrc`; `pnpm install --frozen-lockfile`; `pnpm nx affected -t lint typecheck build --base=origin/main`; `pnpm nx run-many -t test --coverage` (todos os projetos, ADR-0010); `pnpm audit --audit-level high`;
  - job `gitleaks`: `gitleaks/gitleaks-action` v3 (v3.0.0, de 30/05/2026), com `GITHUB_TOKEN` e `GITLEAKS_ENABLE_COMMENTS: false`;
  - job `semgrep`: container `semgrep/semgrep` fixado por *digest* de uma imagem com pelo menos 7 dias, `semgrep scan --config p/default --metrics=off --error`.
- [ ] **Passo 2: `nightly.yml`**, em `schedule` (`0 6 * * *`) e `workflow_dispatch`, com `permissions: contents: read, actions: read`. Primeiro job, `changed`: com `GH_TOKEN: ${{ github.token }}`, compara o SHA da `main` com o `headSha` de `gh run list --workflow nightly.yml --branch main --status success --limit 1` e grava a saída `run` (`true` se diferentes ou se não houver execução anterior). Segundo job, `full`, com `needs: changed` e `if: needs.changed.outputs.run == 'true'`: instalação congelada, `pnpm nx run-many -t test --coverage` e `pnpm nx run sim-engine:mutate`.
- [ ] **Passo 3: actions fixadas pelo hash.** Para cada `uses:` (`actions/checkout`, `actions/setup-node`, `pnpm/action-setup`, `gitleaks/gitleaks-action`), a tag de release mais recente com pelo menos 7 dias, convertida em hash com `gh api repos/<dono>/<repo>/git/ref/tags/<tag>`, e a tag num comentário na mesma linha.
- [ ] **Passo 4: modelo de pull request** com o checklist do ADR-0010: testes (AAA, ID no nome, cobertura), autorização, documentação (ADR, PDR, regras, arquitetura), sem segredos.
- [ ] **Passo 5: verificar, pelo usuário:**
  - abrir um pull request com este plano implementado; os três jobs de `ci.yml` passam;
  - rodar `nightly.yml` à mão na `main` duas vezes seguidas: a primeira executa `full`, a segunda pula; uma execução manual em outra branch não muda o resultado (foco 13);
  - no GitHub, em *Settings → Code security*: alertas do Dependabot ligados, atualizações de segurança do Dependabot desligadas (ADR-0010).

**Commit sugerido:** `ci: add pull request and nightly workflows` · arquivos: os da lista.

## Tarefa 8: comandos e documentação viva

**Arquivos:**
- Modificar: `CLAUDE.md` ("Commands"), `docs/architecture/README.md` (índice), `docs/architecture/code-style.md` (seção 4: plugin de nomes escolhido), `.claude/rules/` (só se algum resumo citar o plugin de nomes), `docs/product/references.md`, `docs/plans/README.md`
- Criar: `docs/architecture/workspace.md`

- [ ] **Passo 1: `CLAUDE.md`, "Commands"**, só com comandos rodados nas tarefas 1 a 7: instalar (`pnpm install`; `pnpm install --frozen-lockfile` no CI), testar um projeto (`pnpm nx test <projeto>`), cobertura (`pnpm nx test <projeto> --coverage`), lint e tipos (`pnpm nx lint <projeto>`, `pnpm nx typecheck <projeto>`), o que a mudança afetou (`pnpm nx affected -t lint typecheck test`), mutação (`pnpm nx run sim-engine:mutate`, lenta), formatação (`pnpm exec prettier --check .`).
- [ ] **Passo 2: `docs/architecture/workspace.md`** (pt-BR, doc vivo, até cerca de 100 linhas): estrutura do monorepo; versões fixadas e como atualizar uma (pull request próprio, idade mínima de 7 dias); configuração de segurança do pnpm, com a nota de que `allowBuilds` substitui o `onlyBuiltDependencies` citado nos ADRs 0001 e 0010; como instalar o gitleaks; o que cada hook e cada workflow faz; por que o teste de conformidade desliga a informação de tipos; e a decisão dos 7 dias, com a data de 03/11/2026 e o gatilho de revisão (um incidente público em que o pacote malicioso ficou publicado por mais de 7 dias, ou o pnpm mudar o padrão).
- [ ] **Passo 3:** `code-style.md`, seção 4: trocar "(plugin a escolher)" por `eslint-plugin-check-file`, com a data. `references.md`: pnpm (*supply chain security*, `allowBuilds`, `minimumReleaseAge`), Nx 24 (`create-nx-workspace`, gerador de biblioteca), `eslint-plugin-check-file`, Stryker (configuração), gitleaks e gitleaks-action, Semgrep CE, Zod (`exactOptional`). `docs/plans/README.md`: este plano no índice.
- [ ] **Passo 4: verificar.** Cada comando do `CLAUDE.md` roda e passa num shell novo.

**Commit sugerido:** `docs: workspace commands and living doc` · arquivos: os da lista.

---

## Notas de execução

| Tarefa | O que divergiu do plano | O que foi feito | Data |
| --- | --- | --- | --- |
| 1 | O `create-nx-workspace` 24.0.2 trocou o preset `ts` pelo template `nrwl/empty-template` (baixado do GitHub): Nx 24.0.0, pasta `packages/`, sem ESLint nem Vitest, e ignorou `--aiAgents=none` (criou `CLAUDE.md`, `AGENTS.md`, `.claude/` e skills de outras ferramentas) | Nada disso foi copiado. O `eslint.config.mjs` da raiz passa a nascer na tarefa 2, pelo gerador de bibliotecas; `.editorconfig` não existe no template e não foi criado | 04/11/2026 |
| 1 | O template trouxe dependências fora da lista: `@swc/core`, `@swc-node/register`, `@swc/helpers`, `tslib`, `@types/node` | Mantidas, com versão exata: as do template (`@swc/*`), `tslib` 2.8.1 e `@types/node` 24.19.2 (as mais novas com 7 dias) | 04/11/2026 |
| 1 | `trustPolicy: no-downgrade` recusa o `semver@6.3.1` (anterior ao *trusted publishing*), e o `semver@6.3.2`, exigido pelo Babel via Nx, tem 2 dias | Exceção só para `semver@6.3.2` em `minimumReleaseAgeExclude`, aprovada pelo usuário: versão com proveniência do `npm/node-semver`. Remover depois de 09/11/2026 | 04/11/2026 |
| 1 | Foco 4: `nx` e `@swc/core` têm scripts de instalação | Lidos por inteiro e negados em `allowBuilds`: o do `nx` só atualiza o cliente do Nx Cloud; o do `@swc/core` faria `npm install @swc/wasm` por fora da política. Os binários nativos vêm por dependências opcionais; SWC e Nx conferidos funcionando | 04/11/2026 |
| 1 | Nome do pacote raiz `@org/source` e licença MIT no template | `@takt/source` (também em `customConditions`) e `UNLICENSED`, porque o repositório é fechado (PDR-0017) | 04/11/2026 |
| 2 | O gerador de bibliotecas não aceita `--dry-run` (instala os plugins) | Plugins e ferramentas instalados antes, nas versões exatas do plano; com a árvore limpa, o `git status` depois da geração serviu de lista do que ele criou e mudou | 04/11/2026 |
| 2 | O gerador criou na raiz `eslint.config.mjs`, `vitest.config.mts` (lista de projetos), `.prettierrc`, `.prettierignore` e acrescentou `eslint-config-prettier` com `^` | Mantidos; `eslint-config-prettier` fixado em 10.1.8. A tarefa 6 ajusta o `.prettierrc` existente em vez de criar `.prettierrc.json` | 04/11/2026 |
| 2 | O daemon do Nx 24 instala `nx@latest` numa pasta temporária, em segundo plano, para avisar sobre "configuração de agentes de IA" (lido em `dist/src/daemon/server/latest-nx.js`); é uma instalação fora do lockfile e da política do pnpm | `useDaemonProcess: false` e `neverConnectToCloud: true` no `nx.json`. Nada foi gravado no repositório pelo daemon | 04/11/2026 |
| 2 | `@nx/vitest` com `testMode: watch` | `testMode: run` (comando `vitest run`), explícito em vez de depender do `watch: false` de cada configuração | 04/11/2026 |
| 2 | O gerador criou um `README.md` genérico ("generated with Nx") em cada biblioteca, além dos arquivos de exemplo | Apagados; a documentação fica em `docs/architecture/` | 04/11/2026 |
| 2 | A referência de projeto do motor para o esquema exige `nx sync` | Rodado; `libs/sim-engine/tsconfig.lib.json` referencia o esquema | 04/11/2026 |
| 3 | O plano pedia `disableTypeChecked` nos `.mjs` | Os presets com tipos (`strictTypeChecked`, `stylisticTypeChecked`) e as regras só de TypeScript valem só para arquivos `.ts`/`.mts`/`.cts` (`defineConfig` com `extends`); os `.mjs` nunca recebem regras com tipos. Mesmo efeito, sem um bloco de exceção | 04/11/2026 |
| 3 | No *flat config*, uma regra redefinida num projeto substitui as opções da raiz: o `no-restricted-syntax` do motor apagaria a proibição de `enum` | A raiz exporta `noEnum` e `browserGlobals` (exports nomeados, permitidos), e o motor repete `noEnum` na própria lista; o teste `rejects enum declarations` nas duas bibliotecas segura isso | 04/11/2026 |
| 3 | O plano não dizia em qual biblioteca ficam os testes de nome de arquivo e os controles positivos | Nas duas, porque cada uma tem a própria configuração; 26 testes no motor, 14 no esquema | 04/11/2026 |
| 3 | `@nx/enforce-module-boundaries` gerado com `sourceTag: '*'` (libera tudo) | Trocado pelas três `depConstraints` do plano. Ignorados também `**/test-output` (pasta de cobertura do gerador; a tarefa 4 pode mudar) | 04/11/2026 |
| 3 | O cache do alvo `test` do Nx só declara o `vitest` como dependência externa: atualizar o ESLint ou um plugin não invalida o cache local dos testes de conformidade | Sem mudança: o CI não tem cache remoto e toda atualização vem num pull request próprio; a mudança da configuração da raiz invalida o cache (foco 15, conferido) | 04/11/2026 |
| 3 | Prettier com a largura padrão (80) reformatou os arquivos novos | `prettier --write` nos 5 arquivos; a tarefa 6 fixa a configuração | 04/11/2026 |
| 4 | Foco 2, cobertura sem instruções | Passa nas duas bibliotecas: "Lines 100% (0/0)", "Branches 100% (0/0)", "1 empty file skipped". Prova do portão: `gate.proof.ts` (uma função com um `if`, sem teste) deu "Coverage for lines (0%) does not meet global threshold (90%)" e o mesmo para *branches*, com saída 1; arquivo apagado | 04/11/2026 |
| 4 | As metas só valem com `--coverage`: `pnpm nx test <projeto>` sem a flag não mede | Sem mudança na configuração; a tarefa 7 roda o CI com `--coverage` e a tarefa 8 grava o comando no `CLAUDE.md` | 04/11/2026 |
| 5 | Com pnpm, o padrão `plugins: ['@stryker-mutator/*']` só procura na pasta interna do pacote `core` ("no Checker plugins were loaded"; lido em `dist/src/di/plugin-loader.js`) | Os dois plugins listados pelo nome | 04/11/2026 |
| 5 | Foco 3: com `cwd: {projectRoot}`, o sandbox copia só a pasta do motor e quebra `../../tsconfig.base.json` ("Tsconfig not found") | O alvo `mutate` roda da raiz (`stryker run libs/sim-engine/stryker.config.mjs`), com os caminhos da configuração relativos à raiz; o sandbox copia o repositório (216 arquivos, sem `node_modules`) | 04/11/2026 |
| 5 | Foco 3: o modo `related` do Vitest só roda testes que importam o código mutado; o teste de conformidade não importa nada ("No tests were executed") | `vitest.related: false`; com a análise de cobertura por teste, cada mutante continua rodando só os testes que o cobrem | 04/11/2026 |
| 5 | Saída com 0 mutantes | "Initial test run succeeded. Ran 26 tests"; "Final mutation score of NaN is greater than or equal to break threshold 80"; saída 0. Prova do portão: `gate.proof.ts` (uma função com `if`, sem teste) deu "Final mutation score 0.00 under breaking threshold 80, setting exit code to 1"; arquivo apagado | 04/11/2026 |
| 5 | Relatório HTML na raiz, `reports/mutation/sim-engine.html` (ignorado pelo git), em vez de dentro do projeto | Consequência de rodar da raiz; o nome do projeto no arquivo evita colisão com a futura mutação do domínio da API | 04/11/2026 |
| 6 | `eslint --max-warnings=0` num arquivo ignorado (por exemplo `.claude/hooks/*.mjs`) gera o aviso "File ignored because of a matching ignore pattern" e recusaria o commit | `--no-warn-ignored` no comando do lint-staged; conferido: saída 1 sem a flag, 0 com ela | 04/11/2026 |
| 6 | `.prettierignore` do plano sem as saídas de build e cobertura do Nx | Mantido o `.prettierrc` da tarefa 2; `.prettierignore` com a lista do plano mais `out-tsc`, `test-output`, `.nx/cache` e `.nx/workspace-data`. `prettier --file-info` conferido: `CLAUDE.md`, `docs/**/*.md`, `.claude/**` e `pnpm-lock.yaml` ignorados | 04/11/2026 |
| 6 | Passo 5 é do usuário, mas parte dele se verifica sem commit nem push | Rodado pelo Claude Code: `commit-msg` com arquivos de mensagem (`feat(motor): x`, `update stuff` e `Feat(repo): x` recusados; `feat(sim-engine): x`, `docs: x` e `chore: add hooks` aceitos); `pre-push` com a entrada padrão simulada (`refs/heads/main` recusado com a mensagem; `main-fix` e `feature/main` aceitos); o comando do gitleaks num repositório descartável fora do projeto (chave falsa `AKIA...` recusada, arquivo limpo aceito); `pre-commit` com o PATH sem gitleaks (mensagem e saída 1) e completo sem nada preparado (saída 0) | 04/11/2026 |
| 6 | `pnpm exec husky` grava `core.hooksPath = .husky/_` no `.git/config` local | Feito; o script `prepare` repete isso em cada `pnpm install`. `.husky/_/` tem o próprio `.gitignore` | 04/11/2026 |
| 7 | Versões das actions e da imagem | `actions/checkout` v7.0.1 (20/07/2026), `actions/setup-node` v7.1.0 (08/10/2026), `pnpm/action-setup` v6.1.0 (05/09/2026; a v6.1.1 tem 1 dia; a v6.1.0 é a que traz suporte ao pnpm 12), `gitleaks/gitleaks-action` v3.0.0 (30/05/2026); hash do commit por `gh api .../git/ref/tags/<tag>`, abrindo a tag anotada do `pnpm/action-setup`. Semgrep 1.182.1 (22/10/2026; a 1.183.0 tem 6 dias), *digest* do Docker Hub | 04/11/2026 |
| 7 | O `gitleaks-action` lê os commits do pull request (`GET /repos/{owner}/{repo}/pulls/{n}/commits`, em `src/gitleaks.js`), o que exige `pull-requests: read` num repositório privado; e usa o gitleaks 8.24.3 se nada for dito | Job `gitleaks` com `contents: read` e `pull-requests: read` (só leitura); `GITLEAKS_VERSION: 8.30.1`, a mesma do hook local | 04/11/2026 |
| 7 | Não previsto: o `checkout` deixa o token gravado na configuração do git por padrão | `persist-credentials: false` em todo `checkout`; nenhum passo precisa de git autenticado | 04/11/2026 |
| 7 | Uma execução manual do noturno em outra branch faria o `checkout` dessa branch | `ref: main` no job `full`; a execução em outra branch não entra no filtro `--branch main` (foco 13) | 04/11/2026 |
| 7 | O alvo `build` ainda não existe (bibliotecas sem *bundler*): `nx run-many -t build` responde "No tasks were run" | Mantido no `affected`, para as apps do marco 2 | 04/11/2026 |
| 7 | Modelo de pull request: o plano não diz o idioma | Inglês, como as mensagens de commit | 04/11/2026 |
| 7 | `pnpm audit --audit-level high` falhava: 6 alertas altos no `undici` 7.29.0, fixado exato pelo `nx` 24.0.2. O Nx 24.0.3 ("bump undici to 7.30.1 to patch security advisories") tinha 5 dias | Decisão do usuário: exceção para o Nx 24.0.3. O `minimumReleaseAgeExclude` não aceita padrão com versão ("Name patterns are not allowed with version unions"), então são 17 entradas exatas, com comentário e data de remoção (06/11/2026). Proveniência SLSA conferida nos 7 pacotes principais; o script de instalação do `nx` é o mesmo e continua negado. Depois: audit com saída 0 (5 moderadas), `nx report` 24.0.3, lint, tipos, testes com cobertura e mutação passando, `pnpm install --frozen-lockfile` em dia. As versões das restrições globais passam a ser Nx 24.0.3 | 04/11/2026 |
| 8 | O índice de `docs/plans/README.md` já listava este plano desde a aprovação | Sem mudança; o status passa a "Concluído" quando o pull request for mesclado | 04/11/2026 |
| 8 | Passo 4 | Cada comando do `CLAUDE.md` rodado num shell de login com ambiente limpo (`env -i`): todos com saída 0. `nx affected` sem `--base` usa `main` por padrão ("Affected criteria defaulted to --base=main") | 04/11/2026 |

---

## Revisão

| # | Achado | Fonte | Aceito? | Motivo |
| --- | --- | --- | --- | --- |
| 1 | Arquivos temporários de prova poderiam entrar num commit | autorrevisão | sim | sufixo `.proof.ts` no `.gitignore` |
| 2 | `type:lib` só depende de `type:lib` não está escrito no ADR-0001 | autorrevisão | sim | marcada como derivada |
| 3 | `pnpm config get` pode não ler o `pnpm-workspace.yaml` | autorrevisão | sim | prova pela recusa de uma versão de 1 dia |
| 4 | Testes de regras do guia nomeados como `ADR-0010:` | autorrevisão | sim | o usuário decidiu: sem ID, só a descrição |
| 5 | Geração e lockfile fora da política de 7 dias e de scripts | plan-reviewer, erro | sim | conferido: o gerador não tem opção para pular a instalação; lockfile descartado, política global na geração |
| 6 | Arquivos de configuração reprovam no lint (`export default`, `.mjs` sem tsconfig, sufixos intermediários) | plan-reviewer, erro | sim | conferido no guia, seção 4; exceção e controles positivos |
| 7 | Comentário planejado dentro de arquivo de teste | plan-reviewer, erro | sim | regra dura; nome autoexplicativo e motivo no doc vivo |
| 8 | `code-style.md` e `references.md` sem atualização | plan-reviewer, erro | sim | `CLAUDE.md` exige; tarefa 8 |
| 9 | Arquivos da raiz alterados pelo gerador fora das tarefas | plan-reviewer, erro | sim | `--dry-run` anotado; interfaces corrigidas |
| 10 | Focos 4 e 6 e as `depConstraints` sem verificação | plan-reviewer, erro | sim | verificações na tarefa 1; `depConstraints` testadas no plano do marco 2 |
| 11 | Testes de vários casos com `toContain` fraco | plan-reviewer, sugestão | sim | `it.each` por caso; dois testes para tipo e valor |
| 12 | `projectService: false` sozinho quebra as regras com tipos | plan-reviewer, sugestão | sim | `disableTypeChecked` |
| 13 | Caminho do helper relativo ao `cwd` errado | plan-reviewer, sugestão | sim | caminho absoluto e `cwd` na raiz |
| 14 | Cache do Nx desatualizado para os testes de conformidade | plan-reviewer, sugestão | sim | `sharedGlobals` |
| 15 | Stryker: `.stryker-tmp`, `cwd`, *sandbox* | plan-reviewer, sugestão | sim | tarefas 1 e 5, foco 3 |
| 16 | `.gitignore` do gerador substituído | plan-reviewer, sugestão | sim | mantido e acrescentado |
| 17 | Próximos `pnpm add` gravariam `^` | plan-reviewer, sugestão | sim | `saveExact: true` (conferido nos docs do pnpm) |
| 18 | Passo de pular o noturno não pula os seguintes | plan-reviewer, sugestão | sim | dois jobs com `if:`, `GH_TOKEN`, `--branch main` |
| 19 | Recusa do `trustPolicy` sem conduta | plan-reviewer, sugestão | sim | foco 6 |
| 20 | `Date()` sem `new` e `globalThis` escapam das proibições | plan-reviewer, sugestão | sim | regras e linhas na tabela de testes |
| 21 | Nenhum teste permanente de DOM fora do motor | plan-reviewer, sugestão | sim | `no-restricted-globals` com teste |
| 22 | Alertas do Dependabot não verificados | plan-reviewer, sugestão | sim | tarefa 7, passo 5 |
| 23 | Pre-commit sem gitleaks passaria em silêncio | plan-reviewer, sugestão | sim | falha com mensagem; foco 11 |
| 24 | Prettier e ESLint alcançam `.claude/` | plan-reviewer, sugestão | sim | `.claude/` ignorado pelas duas ferramentas |
| 25 | Mensagem do pre-push em pt-BR | plan-reviewer, sugestão | sim | `CLAUDE.md`, "Language" |
| 26 | Conferência em aberto do ADR-0013 | plan-reviewer, sugestão | sim | atribuída ao primeiro sub-plano do motor |
| 27 | Sem gatilho de revisão dos 7 dias e plano fora do índice | plan-reviewer, sugestão | sim | tarefa 8 |
| 28 | `gitleaks-action` v3 talvez não exista | plan-reviewer, suposição | não | conferido no GitHub: v3.0.0, de 30/05/2026 |
