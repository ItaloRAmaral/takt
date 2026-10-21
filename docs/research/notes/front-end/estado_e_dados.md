# Estado no cliente, undo/redo, persistência local e comunicação com Web Worker (Takt, outubro de 2026)

Contexto do Takt (lido do repositório, não é pesquisa externa): o `takt-web-app` é **Next.js** com cena 3D e editor, o `@takt/sim-engine` roda num Web Worker, rascunhos ficam no IndexedDB e o `@takt/plant-schema` valida o JSON (ADR 0001, ADR 0011, `docs/architecture/README.md`). Em produção o Next.js faz proxy de `/api` para a NestJS (ADR 0001), então as chamadas à API saem da mesma origem. O relatório inicial (`docs/archive/2026-10-19-relatorio-inicial.md`) já sugeria Zustand e Dexie, mas sem justificativa pesquisada.

Legenda usada abaixo: **Fato** = tem fonte. **Estimativa** = número derivado de fontes, com o raciocínio indicado. **Palpite** = julgamento sem fonte direta.

Método: versões, datas e downloads semanais vêm direto do registry do npm (`registry.npmjs.org` e `api.npmjs.org/downloads/point/last-week/<pkg>`), consultados em **2026-10-20**. Atividade dos repositórios vem da API do GitHub (`api.github.com/repos/<repo>`), consultada no mesmo dia. Downloads do npm incluem dependências transitivas e CI, então medem uso só de forma indireta.

---

## 1. Gerenciamento de estado: Zustand vs Redux Toolkit vs Jotai vs MobX (vs Valtio, TanStack Store)

### Takeaway
O Zustand 5 é a escolha mais segura para o editor do Takt. É o mais baixado do grupo (37,7 mi/semana), tem a maior satisfação no State of React, é o padrão que a documentação do React Three Fiber usa para transient updates e tem o único middleware de undo/redo pronto (zundo). Redux Toolkit é a alternativa mais "enterprise" (devtools, RTK Query), mas exige mais cerimônia. Jotai 3 e MobX 7 acabaram de lançar versões major (set/jul 2026) e se encaixam menos num documento JSON único com histórico.

### Cited Findings

**Versões, datas e adoção (npm, 2026-10-20)**

| Pacote | Última versão | Data | Downloads/semana | Fonte |
|---|---|---|---|---|
| zustand | 5.0.15 | 2026-08-13 | 37.735.389 | [npm registry](https://registry.npmjs.org/zustand), [npm downloads](https://api.npmjs.org/downloads/point/last-week/zustand) |
| @reduxjs/toolkit | 2.13.0 | 2026-09-29 | 19.869.881 | [npm registry](https://registry.npmjs.org/@reduxjs/toolkit), [npm downloads](https://api.npmjs.org/downloads/point/last-week/@reduxjs/toolkit) |
| react-redux | 9.3.0 | 2026-05-15 | 23.655.511 | [npm registry](https://registry.npmjs.org/react-redux) |
| jotai | 3.0.1 | 2026-09-29 | 3.777.019 | [npm registry](https://registry.npmjs.org/jotai) |
| mobx | 7.1.0 | 2026-10-20 | 2.018.950 | [npm registry](https://registry.npmjs.org/mobx) |
| mobx-react-lite | 5.1.0 | 2026-09-24 | 1.976.156 | [npm registry](https://registry.npmjs.org/mobx-react-lite) |
| valtio | 2.3.2 | 2026-05-01 | 1.330.298 | [npm registry](https://registry.npmjs.org/valtio) |
| @tanstack/store | 0.11.2 | 2026-09-29 | 17.561.682 | [npm registry](https://registry.npmjs.org/@tanstack/store) |
| immer | 11.2.3 | 2026-10-20 | 38.669.610 | [npm registry](https://registry.npmjs.org/immer) |

- Fato: Zustand 5.0.0 saiu em 2024-10-14. A linha 5.x está estável há 2 anos (patches até 5.0.15). As peer dependencies do 5.0.15 são `react >=18`, `immer >=9.0.6` (opcional, para o middleware immer) e `use-sync-external-store >=1.2.0` — [npm registry zustand](https://registry.npmjs.org/zustand)
- Fato: RTK 2.0.0 saiu em 2023-12-04. A linha 2.x continua ativa (2.13.0 em 2026-09-29) — [npm registry @reduxjs/toolkit](https://registry.npmjs.org/@reduxjs/toolkit)
- Fato (repositórios no GitHub, 2026-10-20): pmndrs/zustand tem 58,8 mil estrelas, 8 issues abertas e último push em 2026-10-14. pmndrs/jotai tem 21,3 mil estrelas, 1 issue aberta e push em 2026-10-19. mobxjs/mobx tem 28,2 mil estrelas, 22 issues abertas e push em 2026-10-20. immerjs/immer tem 29,0 mil estrelas e push em 2026-10-20 — [GitHub API zustand](https://api.github.com/repos/pmndrs/zustand), [jotai](https://api.github.com/repos/pmndrs/jotai), [mobx](https://api.github.com/repos/mobxjs/mobx), [immer](https://api.github.com/repos/immerjs/immer)
- Fato: **Jotai v3.0.0 saiu em 2026-09-08** e a 3.0.1 em 2026-09-29, que corrige uma regressão em `useAtomValue` introduzida na 3.0.0 — [Jotai releases](https://github.com/pmndrs/jotai/releases)
- Fato: o Jotai v3 é ESM-only (sem CJS/UMD), exige React 18+, TypeScript 5.5+ e Node >=22.12, compila para ES2020 e tirou o `atomFamily` de `jotai/utils` (agora fica no pacote `jotai-family`). A API pública (`useAtom`, `useAtomValue`, `useSetAtom`) não mudou, mas há uma mudança sutil no timing de mount — [Migrating to v3](https://github.com/pmndrs/jotai/blob/main/docs/guides/migrating-to-v3.mdx)
- Fato: **MobX 7.0.0 saiu em 2026-07-30**, junto com mobx-react-lite 5 e mobx-react 10. O MobX 7 usa sempre observables baseados em Proxy (o fallback ES5 foi removido), não aceita mais legacy decorators, troca APIs com namespace (`observable.ref` → `observableRef`, `action.bound` → `actionBound` etc.) e remove a API pública `trace`. O bundle ESM prod caiu de 17,02 KiB para 13,96 KiB gzip — [MobX releases](https://github.com/mobxjs/mobx/releases)
- Fato: o Immer teve várias releases em 2026-10-20 (11.1.23 → 11.2.3), com correções em Map/Set e em patches de arrays reordenados. O Immer 11.0.0 saiu em 2025-11-23 — [Immer releases](https://github.com/immerjs/immer/releases), [npm registry immer](https://registry.npmjs.org/immer)

**Pesquisas (State of React)**
- Fato: no **State of React 2024**, o uso do Zustand subiu de 28% para 41% em um ano, e ele foi a biblioteca mais bem avaliada depois do `useState` padrão — [State of React 2024, state management (espelho)](https://state-of-react-2024.onrender.com/pt-BR/libraries/state-management); página oficial: [2024.stateofreact.com](https://2024.stateofreact.com/en-US/libraries/state-management/). Ressalva: o número veio de um espelho via snippet de busca, não da página oficial.
- Fato: no **State of React 2025**, a página de state management diz que Redux e Redux Toolkit são há muito tempo os mais difundidos, que o Zustand está "gaining ground fast" e que tem a **maior satisfação** entre os usuários. Na pergunta aberta "outras bibliotecas" (181 respondentes), as mais citadas foram TanStack Query (42), useContext (14), Valtio (12), Nano Stores (12), Redux (10), nuqs (9), Zustand (8) e TanStack Store (7) — [State of React 2025, state management](https://2025.stateofreact.com/en-US/libraries/state-management/). Os percentuais de uso de 2025 estão em gráficos que não consegui extrair (ver Gaps).
- Fato: o State of React 2025 diz que 48% dos respondentes já usam React 19 no dia a dia e 41% usam React 18 — [certificates.dev, Breaking Down State of React 2025](https://certificates.dev/blog/breaking-down-state-of-react-2025-results) (fonte secundária)

**Encaixe com 3D (React Three Fiber)**
- Fato: a documentação do R3F diz que "Fast updates are carried out in `useFrame` by mutation" e desaconselha `setState` dentro de `useFrame` e em `onPointerMove` ("use references"). Para estado transitório, recomenda ler o store de forma imperativa (`api.getState().x` dentro de `useFrame`) em vez de assinar com um selector reativo. O exemplo usa Zustand e diz que vale o mesmo para Redux. Gerenciadores de estado são aceitáveis, mas "not for updates that happen rapidly" — [R3F Performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- Fato: R3F está em 9.8.2, three em 0.186.1, Zod em 4.6.7 e Next.js em 16.4.2 (publicado em 2026-10-15) — [npm @react-three/fiber](https://registry.npmjs.org/@react-three/fiber), [npm three](https://registry.npmjs.org/three), [npm zod](https://registry.npmjs.org/zod), [npm next](https://registry.npmjs.org/next)

### Inferences
- Inferência: o Zustand cobre, numa só biblioteca, os três modos de acesso que um editor 3D precisa. Hooks com selectors servem os painéis React. `getState()` e `subscribe()` servem o `useFrame` e o gizmo de arraste sem re-render. A API vanilla (`createStore`) deixa testar a lógica de edição no Vitest sem React. É o padrão que a doc do R3F mostra ([R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)).
- Inferência: o Redux Toolkit também atende (devtools com time-travel, padrões fortes, RTK Query). Em troca, exige actions/slices para cada edição e liga o projeto ao ecossistema Redux, o que pesa mais para um projeto pequeno. Seu ponto forte (RTK Query) não é decisivo aqui (ver seção 2).
- Inferência: Jotai (estado em átomos) combina bem com estado de UI granular. Já o documento da planta é um JSON único validado por Zod e precisa de snapshot e undo do documento inteiro, o que um store único descreve de forma mais natural. Além disso, o Jotai v3 tem só 6 semanas e já teve uma regressão corrigida ([Jotai releases](https://github.com/pmndrs/jotai/releases)).
- Inferência: o MobX 7 (reatividade mutável com Proxy) seria bom para muitas atualizações finas. Porém, o undo por snapshot imutável e o "JSON puro validado por Zod" ficam menos diretos (exigem `toJS` e snapshots). A versão major é de jul 2026.
- Inferência: o volume alto do `@tanstack/store` (17,5 mi/semana) e do `react-redux` provavelmente vem de dependências transitivas (TanStack Form/Router usam o TanStack Store). O TanStack Store ainda é 0.x ([npm](https://registry.npmjs.org/@tanstack/store)), então não é candidato para o estado principal.
- Palpite: Valtio (proxy mutável, do mesmo coletivo pmndrs) é uma opção intermediária válida, mas não traz vantagem clara sobre o Zustand com o middleware immer para este caso.
- Inferência (devtools): o Zustand tem middleware `devtools` que conecta à extensão Redux DevTools. Conheço da documentação ([Zustand devtools](https://zustand.docs.pmnd.rs/middlewares/devtools)), mas não reabri a página nesta sessão.

### Gaps
- Não consegui extrair os percentuais de uso, satisfação e retenção de 2025 (Zustand, Redux, Jotai, MobX), porque estão em gráficos interativos ([State of React 2025](https://2025.stateofreact.com/en-US/libraries/state-management/)). Também não consultei o State of JS 2025.
- Não há benchmark independente e recente (2026) comparando essas bibliotecas num editor 3D.

---

## 2. Server state: TanStack Query vs RTK Query vs SWR (NestJS com sessão por cookie)

### Takeaway
O TanStack Query v5 é o padrão de fato: 40 mi/semana, a release mais recente é de ontem, e tem a tabela de recursos mais completa. Como o Next.js faz proxy de `/api` na mesma origem, o cookie de sessão vai junto sem configuração especial em qualquer das três. O RTK Query só compensa se o projeto adotar Redux.

### Cited Findings
- Fato: @tanstack/react-query 5.104.5, publicado em 2026-10-19, com 40.112.338 downloads/semana. swr 2.5.1, publicado em 2026-08-12, com 11.391.409/semana. O RTK Query vem dentro do @reduxjs/toolkit 2.13.0 — [npm react-query](https://registry.npmjs.org/@tanstack/react-query), [npm swr](https://registry.npmjs.org/swr), [npm downloads react-query](https://api.npmjs.org/downloads/point/last-week/@tanstack/react-query), [npm downloads swr](https://api.npmjs.org/downloads/point/last-week/swr)
- Fato (tabela mantida pelo TanStack, que pede correções mas é parte interessada): React Query tem query cancellation, offline mutation support, auto garbage collection e full structural sharing. O SWR não tem garbage collection automático nem query cancellation, não tem selectors e não suporta offline mutation. O RTK Query tem GC e selectors, mas não tem query cancellation nem offline mutation e não suporta Suspense. Todos têm devtools, mutation hooks, infinite queries e cache persistence — [TanStack Query Comparison](https://tanstack.com/query/latest/docs/framework/react/comparison)
- Fato: no State of React 2025, o TanStack Query foi a biblioteca mais citada na pergunta aberta de state management (42 menções) — [State of React 2025](https://2025.stateofreact.com/en-US/libraries/state-management/)
- Fato (repositório): o `takt-web-app` faz proxy de `/api` em produção — ADR 0001 (`docs/adr/0001-monorepo-nx-e-nomes.md`).

### Inferences
- Inferência: na mesma origem, `fetch` envia cookies por padrão (o padrão de `credentials` é `same-origin`, conforme MDN `Request.credentials`; não reaberto nesta sessão). Assim, TanStack Query e SWR funcionam sem ajuste, porque não fazem a requisição, apenas chamam a sua função. No RTK Query, o `fetchBaseQuery` aceita `credentials`. Se em desenvolvimento a API estiver em outra origem, é preciso `credentials: 'include'` e CORS com `credentials: true` na NestJS.
- Inferência: o tráfego com a API no MVP é pequeno (login, organizações, turmas, plantas publicadas). Isso torna a diferença de recursos pouco decisiva. O TanStack Query ganha pela adoção e pelos recursos de mutation e invalidação. Ele combina bem com Zustand: Zustand para o documento local e para a UI, TanStack Query para dados do servidor, e nada da API duplicado no store.
- Palpite: não usar o persister do TanStack Query para os rascunhos. Rascunho é documento do usuário, não cache do servidor, e deve ficar na camada de IndexedDB própria (seção 4).

### Gaps
- Não verifiquei nesta sessão o tamanho atual dos bundles (Bundlephobia) nem a lista de mudanças do TanStack Query entre a 5.x de 2025 e a 5.104.

---

## 3. Undo/redo: zundo vs Immer patches vs command pattern

### Takeaway
Para ~100 ações num documento JSON imutável, snapshots com structural sharing (zundo ou um `past/future` próprio) são simples e usam pouca memória. Patches do Immer economizam mais, mas trazem riscos com arrays. Command pattern dá o maior controle. O ponto crítico é **agrupar o arraste num único passo**: o estado intermediário do arraste deve ficar fora do histórico, com um único commit no `pointerup`, em vez de throttle. O zundo está quase parado (última release em nov 2024), então um histórico próprio de poucas dezenas de linhas é uma alternativa real.

### Cited Findings

**zundo**
- Fato: zundo 2.3.0, publicado em **2024-11-17** e sem release desde então, com 254.664 downloads/semana. Peer dependency: `zustand ^4.3.0 || ^5.0.0` — [npm registry zundo](https://registry.npmjs.org/zundo), [npm downloads](https://api.npmjs.org/downloads/point/last-week/zundo)
- Fato: no repositório charkour/zundo (896 estrelas, 21 issues abertas, push em 2026-01-30), o último commit na branch principal é de 2025-04-29 (ajuste de README) — [GitHub API zundo](https://api.github.com/repos/charkour/zundo), [commits](https://api.github.com/repos/charkour/zundo/commits)
- Fato: a API do `temporal(config, options)` tem estas opções: `partialize` (quais campos entram no histórico), `limit` (sem limite por padrão), `equality` (evita snapshots iguais), `diff` (guarda deltas em vez de snapshots), `onSave`, `handleSet` (para envolver com throttle/debounce; o exemplo usa 1000 ms) e `wrapTemporal`. Os métodos são `undo(steps?)`, `redo(steps?)`, `clear()`, `pause()`, `resume()` e `isTracking`. Uma nova mudança limpa o `futureStates`. `pastStates`/`futureStates` não são reativos se lidos direto. O bundle é de menos de 700 B. Para persistir o histórico, usa-se `wrapTemporal` com `persist` — [zundo README](https://github.com/charkour/zundo)
- Fato: o README do zundo não traz exemplo específico de arraste. O mecanismo documentado para agrupar mudanças rápidas é throttle/debounce no `handleSet` — [zundo README](https://github.com/charkour/zundo)

**Immer patches**
- Fato: desde o Immer v6 é preciso chamar `enablePatches()`. `produceWithPatches` retorna `[nextState, patches, inversePatches]`, `applyPatches` aplica patches, e os inverse patches servem para undo. O formato é parecido com JSON Patch (RFC 6902), mas com `path` em array. Os patches são corretos, mas **não são garantidamente mínimos**. Mudanças em arrays viram operações por índice (`["tags", 3]`) — [Immer Patches](https://immerjs.github.io/immer/patches)
- Fato: a release 11.2.3 do Immer (2026-10-20) corrige "skip nested patches for children of shifted or reordered arrays" — [Immer releases](https://github.com/immerjs/immer/releases)
- Fato: redux-undo 1.1.0 tem 71.034 downloads/semana (referência para quem usa Redux) — [npm redux-undo](https://registry.npmjs.org/redux-undo/latest)

### Inferences
- Estimativa (memória): com estado imutável, um snapshot custa só os nós alterados no caminho até a raiz, porque o resto é compartilhado por referência. Mover uma máquina numa planta com ~500 entidades guardadas como `Record<id, Entity>` copia o objeto `entities` (~500 ponteiros) e uma entidade. 100 passos dariam algo na ordem de dezenas a poucas centenas de KB, não 100 cópias do documento. Isso deixa de valer se o histórico for serializado (persistido no IndexedDB ou enviado ao worker), porque o compartilhamento se perde.
- Inferência (arraste): o throttle no `handleSet` cria vários passos por arraste (1 a cada N ms), e o debounce atrasa o registro. Nenhum dos dois dá "um arraste = um passo". O padrão mais robusto é manter a posição de preview num estado transitório: um ref ou uma fatia excluída do histórico via `partialize`, atualizada a cada `pointermove`, que é exatamente o que o R3F recomenda ([R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)). No `pointerup`, faz-se um único `set` no documento. Um passo, e o Zod/a validação só roda no commit.
- Palpite (sobre o código do zundo, não verificado nesta sessão): usar `pause()` no `pointerdown` e `resume()` antes de um `set` final pode registrar como "estado anterior" a posição quase final, e não a de antes do arraste, porque o zundo captura o estado anterior no momento do `set`. Seria preciso testar. O commit único a partir do preview transitório evita a questão.
- Inferência (patches vs snapshots): patches do Immer guardam menos e servem também para sincronização futura. Em troca, dependem de índices de array (o que é frágil, haja vista o bug corrigido hoje) e exigem `enablePatches` mais uma pilha própria. Se o documento usar mapas por id em vez de arrays, o risco cai.
- Inferência (command pattern): comandos explícitos (`MoveStation`, `ConnectBuffer`, cada um com `do`/`undo` e um rótulo) permitem rótulos legíveis na UI ("Desfazer: mover Estação 3"), juntar comandos (`merge` de arrastes consecutivos) e transações compostas. Custam mais código por tipo de edição. Um meio-termo prático: cada ação do store recebe um rótulo e faz um snapshot do documento numa pilha própria `{label, doc}[]` limitada a 100. Isso dá ~40 linhas e elimina a dependência de uma biblioteca parada.
- Inferência: aplicar `partialize` para que só o documento da planta entre no histórico (sem seleção, câmera, painéis abertos nem resultados de simulação). E limpar o histórico, ou marcá-lo, ao trocar de planta.

### Gaps
- Não encontrei benchmark de memória de zundo vs patches para documentos do tamanho do Takt. Os números acima são estimativas.
- Não confirmei se o zundo tem problemas abertos com Zustand 5.0.x ou React 19 (as 21 issues abertas não foram lidas).

---

## 4. IndexedDB: Dexie vs idb vs localForage; quota, eviction, persist(), modo privado

### Takeaway
Dexie 4 (ativo, migrações declarativas por versão, `liveQuery`) ou idb 8 (wrapper mínimo de Promise, mantido por Jake Archibald) são as duas opções viáveis. O localForage está parado desde 2021 e deve ser evitado. Para o Takt (poucos object stores: rascunhos, talvez metadados), as duas servem. Dexie ganha se houver consultas e migrações, idb se o objetivo for tamanho mínimo. Em qualquer caso o IndexedDB é **best-effort**: no Safari, sem interação por 7 dias de uso do navegador, os dados são apagados. Exportar o JSON continua sendo a garantia real.

### Cited Findings

**Bibliotecas**
- Fato: dexie 4.4.6, publicado em 2026-09-10 (tag `dev` 4.4.7), com 1.555.766 downloads/semana. O Dexie 4.0.1 saiu em 2024-03-26. O repositório dexie/Dexie.js tem 14,7 mil estrelas, 584 issues abertas e push em 2026-10-19 — [npm dexie](https://registry.npmjs.org/dexie), [GitHub API](https://api.github.com/repos/dexie/Dexie.js)
- Fato: idb 8.0.4, publicado em 2026-10-06, com 15.515.397 downloads/semana. O repositório jakearchibald/idb tem 7,4 mil estrelas, 56 issues abertas e push em 2026-10-06 — [npm idb](https://registry.npmjs.org/idb), [GitHub API](https://api.github.com/repos/jakearchibald/idb)
- Fato: localforage 1.10.0, publicado em **2021-08-18** (sem release desde então), mas ainda com 4.672.023 downloads/semana. No repositório (25,8 mil estrelas, 251 issues abertas), o último push foi em 2024-07-30 — [npm localforage](https://registry.npmjs.org/localforage), [GitHub API](https://api.github.com/repos/localForage/localForage)
- Fato (migrações no Dexie): cada versão é declarada com `db.version(n).stores({...})`, listando só os campos indexados. `.upgrade(tx => ...)` transforma os dados existentes. "A version with an upgrader attached must never be altered". Se o upgrade falha, a transação faz rollback e `db.open()` falha (os dados não ficam pela metade). Desde o Dexie 3, só é preciso manter as versões que têm upgrader, enquanto houver usuários em versão inferior. Uma instalação nova cria o schema mais recente direto — [Dexie Design: database versioning](https://dexie.org/docs/Tutorial/Design#database-versioning)

**Quota e eviction (MDN, página modificada em 2026-01-05)**
- Fato: **Chrome/Edge** dão até 60% do disco por origem (best-effort ou persistente). O total de todas as origens fica em até 80% do disco, e acima disso origens best-effort são removidas. O `persist()` é aprovado ou negado automaticamente, sem prompt, conforme o histórico de interação com o site — [MDN Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Fato: **Firefox** dá, em best-effort, o menor entre 10% do disco e 10 GiB (limite de grupo por site). Persistente, até 50% do disco (máx. 8 TiB). O `persist()` mostra **prompt ao usuário** — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Fato: **Safari (macOS 14 / iOS 17+)** dá ~60% do disco por origem nos browser apps, ~15% em WKWebView, e o mesmo em web apps na Home Screen/Dock. O total fica em 80% (browser apps). Versões antigas tinham 1 GiB inicial com pedido de permissão. Com a prevenção de rastreamento ativa, **se a origem não teve interação (clique/toque) nos últimos 7 dias de uso do navegador, os dados criados por script são apagados**. Cookies setados pelo servidor ficam isentos. Na UE (iOS 17.4+), motores alternativos podem ter políticas próprias — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Fato: sob pressão de armazenamento, a remoção é por LRU, só de origens não persistentes. A remoção é tudo ou nada por origem (IndexedDB, Cache API etc.). Dados persistentes só saem por ação do usuário — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Fato: em modo privado (Firefox e Chrome Incognito), as quotas podem ser diferentes e os dados normalmente são apagados ao fim da sessão. O MDN não dá números — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Fato: `localStorage`/`sessionStorage` têm limite de 5 MiB cada por origem — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

**WebKit (fontes primárias)**
- Fato (**informação de 2020, ainda referenciada pelo MDN em 2026**): o Safari 13.1 / iOS 13.4 introduziu o limite de 7 dias para todo armazenamento gravável por script: IndexedDB, LocalStorage, Media keys, SessionStorage, registros e cache de Service Worker. Os dados são apagados "after seven days of Safari use without user interaction on the site". Web apps adicionados à Home Screen "are not part of Safari and thus have their own counter of days of use", e a WebKit não espera que os dados de primeira parte deles sejam apagados — [WebKit, Full Third-Party Cookie Blocking and More (2020-03-24)](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- Fato (**2023, Safari 17**): a política de quotas descrita acima (60%/80% para browser apps, 15%/20% para outros apps; frame cross-origin = 10% da quota do frame principal; `QuotaExceededError` ao atingir o limite). A eviction é por origem e por LRU, e uma origem com página ativa ou em modo persistente pode ser poupada. `estimate()` tem suporte completo, mas a quota "é um limite superior, não garantia" e pode variar para reduzir fingerprinting. O WebKit concede `persist()` "based on heuristics, such as whether the site is opened as a Home Screen Web App" — [WebKit, Updates to Storage Policy (2023-08-10)](https://webkit.org/blog/14403/updates-to-storage-policy/)

### Inferences
- Inferência: o padrão de uso esperado do Takt (alunos que abrem a planta por uma aula e voltam depois de 1 a 2 semanas) cai exatamente na regra dos 7 dias do Safari. Um rascunho só local pode sumir entre aulas no Safari/iOS. Mitigações: (1) chamar `navigator.storage.persist()` e mostrar o resultado; (2) lembrete de exportar e um botão "Baixar JSON" sempre visível; (3) quando houver backend para plantas, salvar no servidor, já que cookies do servidor ficam isentos; (4) sugerir "Adicionar à Tela de Início" no iOS. Isso confirma o cuidado já anotado no relatório inicial.
- Inferência: o `persist()` tem semântica diferente em cada navegador. No Chrome e no Safari é decidido em silêncio por heurística, no Firefox abre um prompt. A UI deve tratar `false` como resultado normal e chamar `persist()` só depois de um gesto com significado (por exemplo, o primeiro salvamento), para o prompt do Firefox não aparecer logo ao abrir a página.
- Inferência: a quota não é problema para o Takt (plantas JSON de KB a poucos MB). O risco real é eviction e modo privado, não espaço.
- Inferência (Dexie vs idb): o Takt guarda poucos documentos grandes (o JSON da planta, metadados de rascunho e talvez snapshots de autosave). As consultas são triviais (por id, por data). Isso favorece o idb, que é mínimo, ou mesmo um key-value simples. O Dexie compensa se houver migrações de schema frequentes (o `upgrade()` com rollback é bem útil) e reatividade entre abas (`liveQuery`). Os dois estão ativos em out/2026.
- Inferência (migrações): há duas camadas de versão. (1) A versão do banco IndexedDB (stores e índices), que muda raramente. (2) A `schemaVersion` dentro do JSON da planta, migrada por funções puras no `@takt/plant-schema` e validada pelo Zod ao carregar. A segunda também vale para JSON importado e para plantas do servidor, então não deve depender do mecanismo do Dexie.
- Palpite: gravar com debounce (~500 ms a 1 s depois da última edição, e também em `visibilitychange`/`pagehide`), e não a cada `set` do store. Se usar o middleware `persist` do Zustand, ele serializa o estado particionado inteiro a cada mudança, por isso é melhor um storage assíncrono com debounce.
- Palpite: com duas abas editando o mesmo rascunho, vale a última escrita. Detectar com `BroadcastChannel` ou com `liveQuery` do Dexie e avisar o usuário.
- Inferência (modo privado, conhecimento prévio não verificado nesta sessão): Firefox liberou IndexedDB em navegação privada por volta da v115, e Safari aceita IndexedDB em privado com dados efêmeros. Em todos os casos os dados somem ao fechar. O app deve detectar falha de `open()` ou `QuotaExceededError` e cair para "somente memória + exportar".

### Gaps
- Não reabri a documentação de `liveQuery` nem do Dexie 4 especificamente (a página de design consultada fala do Dexie 3). Também não verifiquei a licença atual (conhecimento prévio: Apache-2.0) nem a relação com o Dexie Cloud (produto pago à parte).
- Não encontrei fonte oficial de 2025-2026 dizendo se a regra dos 7 dias do Safari mudou depois de 2023. O MDN (jan/2026) ainda a descreve.
- Não verifiquei os critérios atuais da heurística de `persist()` do Chrome (versões anteriores do web.dev citavam favoritos, PWA instalado, engajamento e notificações).

---

## 5. Comunicação com Web Worker: Comlink vs postMessage; transferables, SharedArrayBuffer, vários workers, bundler

### Takeaway
Comlink (1,1 kB) dá RPC tipado e confortável e continua funcional, mas está praticamente sem releases desde nov/2024. Como o protocolo do Takt é pequeno (rodar simulação → resultados + log), um `postMessage` tipado com união discriminada é igualmente viável. O que pesa no desempenho é o **formato do log de eventos**. Com objetos via structured clone, o custo cresce com o tamanho. Com colunas em typed arrays transferidas, o custo é quase zero e independe do tamanho. SharedArrayBuffer não é necessário e exigiria cross-origin isolation (COOP/COEP), com custo de integração. Em Next.js, `new Worker(new URL('./x.ts', import.meta.url))` funciona, mas o Turbopack teve regressões recentes nesse caminho.

### Cited Findings

**Comlink**
- Fato: comlink 4.4.2, publicado em **2024-11-07** (sem release depois), com 1.594.788 downloads/semana. No repositório GoogleChromeLabs/comlink (12,8 mil estrelas, 125 issues + PRs abertos), o último commit na branch principal é de 2025-06-18 ("Fix message ports not being closed", da Foxglove). O repo teve push em 2026-10-14, provavelmente de bots de dependência — [npm comlink](https://registry.npmjs.org/comlink), [GitHub API](https://api.github.com/repos/GoogleChromeLabs/comlink), [commits](https://api.github.com/repos/GoogleChromeLabs/comlink/commits)
- Fato: ~1,1 kB brotli. A API tem `expose`, `wrap` (retorna `Comlink.Remote<T>`), `transfer(value, transferables)`, `proxy` (para callbacks), `releaseProxy` (automático via WeakRef/GC) e transfer handlers customizados (precisam ser registrados dos dois lados). Por padrão usa structured clone. Toda chamada é assíncrona ("put `await` in front of it"). A tipagem TypeScript é "best-effort" e às vezes exige `as unknown as` — [Comlink README](https://github.com/GoogleChromeLabs/comlink)

**Custo de structured clone e transferables**
- Fato (**2019, microbenchmark**): o tempo de `postMessage` cresce de forma aproximadamente proporcional ao tamanho do `JSON.stringify` do objeto (correlação forte acima de ~100 KiB). No aparelho mais lento testado (Nokia 2), payloads até ~100 KiB cabem no orçamento de 100 ms (RAIL), e até ~10 KiB não ameaçam animações de 16 ms. `JSON.stringify` manual vs structured clone: sem vencedor claro. Transferir `ArrayBuffer` é "muito rápido" e praticamente independente do tamanho, ao custo de definir o próprio formato — [Surma, Is postMessage slow? (2019-07-15)](https://surma.dev/things/is-postmessage-slow/). Ressalva: medições antigas (Chrome/Firefox/Safari em MacBook Pro 2018, Pixel 3 XL, Nokia 2). Os números absolutos devem ser melhores hoje, mas a relação com o tamanho continua.

**SharedArrayBuffer**
- Fato: SharedArrayBuffer exige secure context e **cross-origin isolation** (checar com `crossOriginIsolated`). Sem isolamento, o construtor fica oculto e `postMessage` lança erro para SAB. `Atomics` está sempre disponível. Existe SAB growable (`maxByteLength`, `grow()`, só cresce). É Baseline "widely available" desde dez/2021. A página do MDN aponta para `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy` e `Cross-Origin-Resource-Policy` (modificada em 2026-02-10) — [MDN SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- Fato (valores dos headers, conhecimento prévio, não reaberto nesta sessão): `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` (ou `credentialless`) — [web.dev, Making your website cross-origin isolated](https://web.dev/articles/coop-coep)

**Bundlers**
- Fato: no Vite (doc mostrando a v8.3.4), o padrão recomendado é `new Worker(new URL('./worker.js', import.meta.url))`, opcionalmente com `{ type: 'module' }`. A detecção só funciona se o `new URL()` estiver **diretamente** dentro do `new Worker()`, e as options precisam ser literais estáticos. Também há os sufixos `?worker`, `?worker&inline` e `?worker&url` — [Vite Features: Web Workers](https://vite.dev/guide/features#web-workers)
- Fato: as notas do Next.js 16.2 (2026-03-18) citam "Web Worker Origin" como melhoria para bibliotecas WASM em workers — [Next.js 16.2 Turbopack](https://nextjs.org/blog/next-16-2-turbopack)
- Fato (commits do Next.js, datas relativas segundo o indexador de busca, possivelmente set-out/2026): (1) o Turbopack trocou as blob URLs de workers por arquivos de entrypoint reais (as blob URLs quebravam a resolução relativa de assets, como WASM via `import.meta.url`) e ganhou suporte a SharedWorker; (2) foi corrigida uma regressão em que o Turbopack resolvia `new Worker(new URL('./worker.ts', import.meta.url))` a partir da raiz do projeto, e não do módulo importador. Ela apareceu na **16.2.4 e na 16.3.0-canary.8** e funcionava na 16.1.7 — [commit d23af53](https://app.semanticdiff.com/gh/vercel/next.js/commit/d23af53268d062ff70b7c12322750b85ed3a76ba), [commit cb96548](https://app.semanticdiff.com/gh/vercel/next.js/commit/cb96548418cb856cf91d2bdda2083f5bd1e9611b). Ressalva: fonte agregadora de commits, não doc oficial. Não encontrei página oficial do Next.js descrevendo o suporte atual.

### Inferences
- Estimativa (log de eventos): um log com 100 mil eventos como objetos `{t, type, entityId, ...}` dá na ordem de 5 a 10 MB de JSON. Pela proporcionalidade de Surma, isso significa clonar dezenas a centenas de ms. A desserialização bloqueia a thread principal no `onmessage`. Em formato colunar (`Float64Array` de tempos, `Uint8Array` de tipos, `Uint32Array` de ids, e uma tabela de strings pequena enviada por clone), a transferência dos `ArrayBuffer` custa praticamente zero, e o playback lê por índice sem alocar objetos. Isso também combina com a leitura imperativa no `useFrame`.
- Inferência: o SharedArrayBuffer só valeria para streaming contínuo ou progresso em tempo real lido sem mensagens. O Takt roda a simulação e devolve o resultado, então transferir no fim, ou em lotes de progresso, basta. Ativar COOP/COEP no Next.js afetaria todos os recursos de terceiros (fontes, imagens, analytics, popups de login), com custo de integração sem ganho claro. Recomendação: não usar no MVP.
- Inferência (Comlink vs postMessage): o protocolo do Takt tem 3 a 4 mensagens (`run`, `progress`, `result`, `error`/`cancel`). Um `postMessage` com união discriminada tipada, compartilhada no pacote do motor, dá segurança de tipos sem dependência e sem o "best-effort" do `Remote<T>`. O Comlink faz sentido se a API do worker crescer (muitos métodos, callbacks de progresso via `Comlink.proxy`). Ele está estável e pequeno, mas quase sem manutenção. Se for usado, envolva-o num módulo próprio para poder trocá-lo.
- Inferência (cancelamento): o jeito mais simples e confiável de cancelar uma simulação longa é `worker.terminate()` e recriar o worker. Um flag cooperativo exigiria o motor ceder controle (por exemplo, checar mensagens entre lotes de eventos).
- Inferência (vários workers): cada worker tem seu próprio heap e event loop. Para replicações com sementes diferentes ou para comparar cenários, um pool de tamanho `navigator.hardwareConcurrency - 1` (limitado a algo como 4) roda em paralelo de verdade. Como o motor é TS puro e determinístico por semente (ADR 0011), as replicações são independentes e "embaraçosamente paralelas". Cada worker recebe a planta por structured clone. Um JSON de alguns MB é aceitável uma vez por execução.
- Inferência (Next.js): o worker só pode ser criado no cliente (`'use client'` e dentro de `useEffect`/handler, nunca no render do servidor). Com Turbopack, fixar a versão do Next.js e ter um teste e2e (Playwright) que rode uma simulação de verdade no build de produção, para pegar regressões como a da 16.2.4. Como alternativa robusta, o motor pode ser compilado num bundle separado servido em `public/`, mas isso perde o HMR.
- Inferência (validação): validar com Zod na fronteira do worker (entrada da planta) e ao carregar do IndexedDB/importar, não a cada edição. Evita custo repetido e dá ao motor um contrato único.

### Gaps
- Não encontrei benchmark atual (2025-2026) de structured clone para payloads de vários MB nos navegadores de hoje. A referência de Surma é de 2019.
- Não confirmei a versão exata do Next.js em que a correção da resolução relativa de workers no Turbopack foi publicada como estável (16.4.x?). É preciso conferir o changelog antes de fixar a versão.
- Não avaliei alternativas a Comlink como `threads.js` ou `workerpool` (versões e manutenção não consultadas).
