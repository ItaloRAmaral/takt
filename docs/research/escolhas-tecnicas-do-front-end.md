# Vite SPA vence o Next.js no Takt

**Resposta direta.** Em outubro de 2026, a combinação mais estável, mantida e aceita pelo mercado para o `takt-web-app` é esta. A aplicação é uma **SPA estática com Vite 8 + React 19 + React Router 8** (em modo de biblioteca, sem servidor). A cena 3D usa **React Three Fiber 9.8 + drei 10.7 + three r186**, com WebGL2 como renderizador padrão. O estado fica com **Zustand 5** e **TanStack Query 5**. O histórico de desfazer é próprio, com um passo por arraste. Os rascunhos ficam no IndexedDB via **idb 8**, e o Worker conversa por `postMessage` tipado, com log de eventos em colunas de *typed arrays* transferidas. A interface usa **Base UI via shadcn/ui + Tailwind v4**, i18n com mensagens ICU (**use-intl**) e **ECharts 6** para séries temporais, com tabela de dados alternativa.

**Por que importa.** A escolha que mais pesa é largar o Next.js App Router, previsto no ADR-0001. No Takt, tudo o que importa roda no navegador: canvas WebGL, Worker e estado interativo. Nesse cenário, o servidor do Next não traz benefício e traz custo. Em 2026, quase todas as falhas graves dos frameworks React estavam no lado servidor: RCEs no Next em outubro/2026, CSRF e DoS no modo framework do React Router, XSS crítico no TanStack Start ([Next.js, 14/10/2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026); [TanStack, 30/09/2026](https://tanstack.com/blog/tanstack-start-security-update-cve-2026-102989)).

**Decisão que exige confirmação.** A troca afeta diretamente o ADR-0005. Uma SPA estática não tem processo de servidor para fazer o proxy `/api`. O mesmo site em produção passa a ser garantido por um proxy reverso (nginx ou *load balancer*) na frente do front e da NestJS. O cookie continua `HttpOnly; SameSite=Lax` e *first-party*. O que muda é quem faz o repasse.

**Riscos residuais da pilha.** Há três: a manutenção irregular da drei, a transição do R3F para a v10 (WebGPU primeiro) e a regra de apagamento de 7 dias do Safari para o IndexedDB.

> **Como ler este relatório.** **[Fato]** é afirmação com fonte primária, consultada pelos pesquisadores em 20/10/2026 (versões e downloads lidos direto do registry do npm nessa data). **[Fato, fonte secundária]** tem fonte, mas não primária. **[Estimativa]** é dedução a partir de fatos citados. **[Palpite]** é julgamento sem evidência direta. **[Conhecimento prévio]** é algo conhecido antes da pesquisa e **não verificado na fonte nesta rodada**: confira antes de levar a um ADR. Downloads semanais referem-se à semana de 12 a 18/10/2026 e incluem dependências transitivas e CI. Medem adoção só de forma indireta.

## O servidor do framework é superfície de ataque sem uso para o Takt

### Os quatro candidatos estão maduros, mas em fases diferentes

Os quatro estão em versões estáveis e com manutenção ativa.

- **Next.js 16.4.2** (15/10/2026) [Fato] ([npm](https://registry.npmjs.org/next)). Lidera o uso: cerca de 59% no State of JS 2025 [Fato, fonte secundária] ([InfoQ, 03/2026](https://www.infoq.com/news/2026/03/state-of-js-survey-2025/)). Mas perde satisfação, ficando 39 pontos atrás do líder [Fato] ([State of JS 2025](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/)). O modelo de programação continua mudando: o 16.4 recomenda **Cache Components** e avisa que eles serão o padrão no Next 17 [Fato] ([Next.js 16.4, 06/10/2026](https://nextjs.org/blog/next-16-4)).
- **React Router 8.5.0** (19/10/2026) [Fato] ([npm](https://registry.npmjs.org/react-router)). É o oposto em temperamento. A v8 foi lançada em 17/06/2026 como release "deliberadamente chato": só ESM, major anual, mantendo os modos *declarative*, *data* e *framework*. A linha 7.x ainda recebe correções de segurança [Fato] ([React Router v8](https://remix.run/blog/react-router-v8); [InfoQ, 08/2026](https://www.infoq.com/news/2026/08/react-route-v8/)).
- **TanStack Start**: o 1.0 estável saiu há uma semana, em **13/10/2026** [Fato] ([TanStack Start 1.0](https://tanstack.com/blog/tanstack-start-1-0)). A migração da RC para o 1.0 ainda removeu APIs, como `useSession` [Fato] ([guia de migração](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate)).
- **Vite 8.3.4** é a base de três dos quatro candidatos, com Rolldown como bundler único desde março/2026. É o pacote mais baixado do grupo, com 119 milhões de downloads por semana [Fato] ([Vite 8](https://vite.dev/blog/announcing-vite8); [npm downloads](https://api.npmjs.org/downloads/point/last-week/vite)).

### No App Router, a cena 3D vira uma SPA presa dentro do Next

No App Router, até Client Components são pré-renderizados no servidor durante o `next build`. Por isso, `window`, WebGL e `localStorage` só podem ser acessados depois da montagem [Fato] ([Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)). A documentação do R3F pede `transpilePackages: ['three']` no Next e diz que no Vite tudo "works out of the box" [Fato] ([R3F Installation](https://r3f.docs.pmnd.rs/getting-started/installation)). O padrão comunitário é envolver o `<Canvas>` em `next/dynamic({ ssr: false })` dentro de um componente `'use client'` [Fato, fonte secundária] ([threejsresources, 2026](https://threejsresources.com/frameworks/three-js-nextjs)).

O Worker do motor também sofreu. Uma regressão do Turbopack resolvia `new Worker(new URL('./worker.ts', import.meta.url))` a partir da raiz do projeto, e não do módulo que importa. Ela apareceu na 16.2.4 [Fato, fonte secundária: agregador de commits] ([commit cb96548](https://app.semanticdiff.com/gh/vercel/next.js/commit/cb96548418cb856cf91d2bdda2083f5bd1e9611b)). No Vite, esse mesmo padrão é o caminho documentado [Fato] ([Vite: Web Workers](https://vite.dev/guide/features#web-workers)).

[Estimativa] O resultado no Next seria "uma SPA dentro do Next": toda a árvore do editor sob `'use client'`, e RSC, Server Actions e Cache Components sem uso. Mesmo assim, o time pagaria a complexidade e os patches de um servidor Node.

### Quase todos os advisories graves de 2025–2026 exigem o servidor do framework

A lista de 2025–2026 é longa:

- **Next.js, fora do ciclo, em 14/10/2026**:
  - RCE crítico não autenticado em funções `use cache` (GHSA-673q-mjm6-r5xr), sem *workaround*;
  - RCE crítico no Image Optimization via `sharp` (CVE-2026-96889);
  - DoS alto em Server Actions.
  - Correções nas versões 16.4.1 e 15.5.28 [Fato] ([Next.js, 14/10/2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026)).
- **Next.js antes disso**:
  - o React2Shell (CVE-2025-55182, CVSS 10, dez/2025) [Fato] ([Next.js](https://nextjs.org/blog/CVE-2025-66478));
  - um DoS em abril/2026 [Fato] ([GHSA-q4gf-8mx6-v5v3](https://github.com/vercel/next.js/security/advisories/GHSA-q4gf-8mx6-v5v3));
  - um pacote coordenado de 13 advisories em maio/2026 [Fato] ([Vercel, 05/2026](https://vercel.com/changelog/next-js-may-2026-security-release)).
- **React Router, modo framework**: CSRF em POST (CVE-2026-22030, corrigido na 7.12.0), CSRF em PUT/PATCH/DELETE (CVE-2026-53663) e DoS pelo endpoint `__manifest` (CVE-2026-42342) [Fato] ([MITRE](https://cveawg.mitre.org/api/cve/CVE-2026-22030); [GitLab](https://advisories.gitlab.com/npm/react-router/CVE-2026-53663/); [OSV](https://osv.dev/vulnerability/CVE-2026-42342)). Há ainda um prototype pollution encadeável a RCE (CVE-2026-40181) [Fato, fonte secundária, não verificado na GHSA].
- **TanStack Start**: XSS refletido crítico nas *server functions* (CVE-2026-102989, 30/09/2026) [Fato] ([TanStack](https://tanstack.com/blog/tanstack-start-security-update-cve-2026-102989)).

Dois agravantes no Next. A Netlify relata que as correções de maio saíram só para a última minor de cada major [Fato, fonte secundária] ([Netlify, 05/2026](https://www.netlify.com/changelog/2026-05-08-react-nextjs-security-vulnerabilities/)). E o RCE de outubro está justamente no modelo que vira padrão no 17 [Fato] ([Next.js 16.4](https://nextjs.org/blog/next-16-4)). [Estimativa] Logo, um Next com servidor obriga a atualizar com frequência. Um build estático servido por nginx não executa nenhum desses caminhos, e o risco fica concentrado na NestJS e nas dependências do cliente.

### O proxy /api passa para a infraestrutura em qualquer cenário estático

O Next faz proxy para URL externa com `rewrites` [Fato] ([Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)). Mas o `output: 'export'` não suporta rewrites, proxy, cookies nem Server Actions [Fato] ([Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)). Ou seja: manter "o front faz o proxy" obriga a ter o servidor Next em produção.

O `server.proxy` do Vite vale só para o servidor de desenvolvimento [Fato] ([Vite server options](https://vite.dev/config/server-options)). Em produção, o caminho é um nginx, Caddy ou *load balancer* com `/api/*` indo para a NestJS e `/*` para os arquivos estáticos. O TanStack Start documenta exatamente essa ordem de regras para o seu modo SPA [Fato] ([TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)).

[Estimativa] Com front e API no mesmo host, o cookie do ADR-0005 (`HttpOnly; Secure; SameSite=Lax`, sem `Domain`) segue *first-party* e sem CORS, seja qual for o framework. A checagem de origem fica num único servidor que aceita mutações, a NestJS. O CVE-2025-29927, *bypass* de autorização pelo middleware do Next [Fato] ([NVD](https://nvd.nist.gov/vuln/detail/cve-2025-29927)), reforça uma regra válida em qualquer cenário: **autorização sempre nos guards da NestJS**, nunca no proxy.

### React Router em modo biblioteca é a base mais simples

No Nx 23.3.0 (07/10/2026), Vite, Vitest, Playwright, React e Next têm plugin oficial. O `@nx/next` aceita `next >=14 <17`. **TanStack Start não tem plugin nem generator oficial**, só um template [Fato] ([npm @nx/next@23.3.0](https://registry.npmjs.org/@nx/next/23.3.0); [nrwl/nx #34273](https://github.com/nrwl/nx/discussions/34273)). O modo framework do React Router é atendido pelo `@nx/react/router-plugin` [Fato] ([Nx: React Router](https://nx.dev/docs/technologies/react/guides/react-router)), mas não se confirmou o suporte a RR **v8** (lacuna).

[Estimativa] A SPA com React Router 8 em modo *data* (`createBrowserRouter`) usa só `@nx/react` + `@nx/vite` e dispensa o router-plugin. O Vitest reaproveita o `vite.config`, o que ajuda na meta de 90% de cobertura do ADR-0009.

Se a landing pública precisar de SEO, há um caminho barato dentro da mesma biblioteca: o modo framework com `ssr:false` + `prerender` gera HTML estático sem servidor. O custo é manter a rota raiz segura para SSR [Fato] ([React Router SPA Mode](https://reactrouter.com/how-to/spa)).

### i18n por URL não é necessário no Takt

O PDR-0016 define o idioma pelo navegador na primeira visita e depois pelo perfil. Isso elimina a principal vantagem do next-intl no Next, o roteamento por `[locale]` com negociação no proxy [Fato] ([next-intl routing](https://next-intl.dev/docs/routing/setup)). Esse recurso, aliás, também não funciona em `output: 'export'` [Fato] ([Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)).

## R3F com instancing aguenta milhares de peças, desde que o React fique fora do frame

### Adoção e manutenção das quatro engines

Em adoção, three.js e o ecossistema pmndrs ficam uma ou duas ordens de grandeza acima dos concorrentes [Fato] ([npm downloads](https://api.npmjs.org/downloads/point/last-week/three); [npm registry R3F](https://registry.npmjs.org/@react-three/fiber); [npm registry Babylon](https://registry.npmjs.org/@babylonjs/core); [npm registry PlayCanvas](https://registry.npmjs.org/playcanvas)):

| Pacote | Downloads/semana | Downloads em 12 meses | Versão atual |
|---|---|---|---|
| `three` | 14,1 milhões | — | 0.186.1 |
| `@react-three/fiber` | 4,0 milhões | 150 milhões | 9.8.2 (14/10/2026) |
| `@babylonjs/core` | 234 mil | 10 milhões | 9.31.1 |
| `playcanvas` | 107 mil | — | — |

Duas correções e um alerta sobre os concorrentes e a drei:

- **Babylon.js já não está na 8.x.** A 9.0 saiu em 26/03/2026, com minor semanal e um time da Microsoft [Fato] ([Windows Dev Blog, 26/03/2026](https://blogs.windows.com/windowsdeveloper/2026/03/26/announcing-babylon-js-9-0)).
- **O wrapper React do PlayCanvas** ainda está em 0.11.7, com cerca de 6 mil downloads por semana [Fato] ([npm @playcanvas/react](https://registry.npmjs.org/@playcanvas/react)).
- **A drei é o elo frágil.** Ficou quase nove meses sem release estável, entre a 10.7.7 (13/11/2025) e a 10.7.8 (05/08/2026), enquanto a v11 alpha andava [Fato] ([npm drei](https://registry.npmjs.org/@react-three/drei)). [Estimativa] O impacto é baixo, porque o Takt usaria poucos componentes dela (controles, Grid, Instances, Html).

[Estimativa] Babylon e PlayCanvas têm patrocínio corporativo, mas a integração React deles é fraca: o `react-babylonjs` tem cerca de 1,7 mil downloads por semana [Fato] ([npm](https://registry.npmjs.org/react-babylonjs)). Isso obrigaria a escrever à mão a ligação entre o store e a cena. O three.js puro tem o mesmo poder de render que o R3F, mas perde a cena declarativa e a integração com o Zustand, que é do mesmo coletivo.

### Desempenho: o limite é de draw calls e se resolve com instancing

O orçamento a vigiar é de draw calls e CPU por frame. A doc do R3F fixa um **"hard maximum of 1000 and ideally a few hundred or fewer"** draw calls e recomenda `instancedMesh` para objetos repetidos [Fato] ([R3F: Scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)). A doc de armadilhas manda mutar via refs dentro de `useFrame` e nunca usar `setState` por frame. Para estado transitório, a regra é ler `api.getState()` do Zustand dentro do loop [Fato] ([R3F: Performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)).

O three.js oferece mais duas peças:

- **`BatchedMesh`**: desenha geometrias diferentes com o mesmo material em um draw call, com `setMatrixAt`, `setColorAt` e `setVisibleAt` por instância [Fato] ([three.js BatchedMesh](https://threejs.org/docs/pages/BatchedMesh.html)).
- **Raycast em instâncias**: o resultado traz `instanceId` para seleção em `InstancedMesh` [Fato] ([three.js Raycaster](https://threejs.org/docs/pages/Raycaster.html)).

O `<Instances>` da drei é declarativo, mas cobra overhead de CPU, e a própria doc indica `InstancedMesh` cru para contagens muito grandes [Fato] ([drei Instances](https://drei.docs.pmnd.rs/performances/instances)).

[Estimativa] Com 10 a 30 tipos de elemento, cada um num `InstancedMesh` com cor por instância, milhares de objetos cabem em dezenas de draw calls. A reprodução a 100x não muda o custo por frame: consome mais eventos do cursor, mas continua escrevendo N matrizes uma vez. [Palpite] Peças em movimento devem sempre ir para `InstancedMesh` cru. Máquinas editáveis podem ser `<mesh>` individuais até algumas centenas.

### WebGPU ainda não é universal, e WebGL2 continua obrigatório

Segundo o wiki do gpuweb (editado em 02/10/2026), o WebGPU vem ligado por padrão em [Fato] ([gpuweb Implementation Status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)):

- Chrome/Edge no Windows, Mac e ChromeOS;
- Android 12+;
- Safari 26;
- Firefox no Windows e no macOS.

**Firefox Linux e Android e boa parte do Chromium Linux ainda não têm.** O caniuse dá cerca de 88% de suporte, mas contradiz o gpuweb sobre o Firefox [Fato] ([caniuse WebGPU](https://caniuse.com/webgpu)).

Nas bibliotecas:

- **three.js**: o `WebGPURenderer` cai automaticamente para WebGL2 [Fato, fonte parcial: conteúdo do manual obtido por snippet de busca] ([three.js manual](https://threejs.org/manual/en/webgpurenderer)).
- **R3F**: a v10.0.0-alpha.6 (17/10/2026) torna o WebGPU padrão com fallback WebGL2, mas a própria release pede que tudo seja tratado como experimental [Fato] ([R3F releases](https://github.com/pmndrs/react-three-fiber/releases)).
- **Babylon**: suporta WebGPU desde a 5.0, mas exige escolher o engine antes de criar a cena, sem troca automática [Fato] ([Babylon WebGPU](https://doc.babylonjs.com/setup/support/webGPU)).

[Estimativa] Para uma cena low-poly, WebGL2 tem folga, e o WebGPU só pagaria com *compute shaders*. A rota de menor risco tem três partes: R3F 9 com `WebGLRenderer`; só materiais padrão com `flatShading`, sem GLSL próprio; e TSL se algum shader custom for inevitável. Assim, a migração futura para a v10 fica quase transparente.

### Recursos de editor: o encaixe em grade é código do Takt

Nenhuma engine traz um "modo construção" pronto. O encaixe é código de domínio:

1. raycast no chão;
2. `Math.round(p / célula) * célula` para posicionar a prévia;
3. tecla R para girar +π/2;
4. mapa de células ocupadas no store.

Isso vale em qualquer stack [Estimativa]. Para o modo avançado:

- o `TransformControls` tem `translationSnap` e `rotationSnap` em radianos [Fato] ([three.js TransformControls](https://threejs.org/docs/pages/TransformControls.html));
- na drei, ele desativa o `OrbitControls makeDefault` durante o arraste [Fato] ([drei TransformControls](https://drei.docs.pmnd.rs/gizmos/transform-controls));
- se o hover virar gargalo, o `three-mesh-bvh` 0.9.16 acelera o raycast [Fato] ([npm](https://registry.npmjs.org/three-mesh-bvh)).

Aqui o Babylon tem um diferencial real. Ele traz GizmoManager com `snapDistance` [Fato] ([Babylon Gizmos](https://doc.babylonjs.com/features/featuresDeepDive/mesh/gizmo)) e o pacote oficial `@babylonjs/accessibility`, que gera "HTML twins" da cena para leitor de tela [Fato] ([npm](https://registry.npmjs.org/@babylonjs/accessibility)). O equivalente no R3F, `@react-three/a11y`, não publica release desde **15/05/2022** e não declara suporte ao R3F 9 [Fato] ([npm](https://registry.npmjs.org/@react-three/a11y)). [Estimativa] O caminho sustentável é espelhar a cena num DOM acessível fora do canvas: uma lista de elementos com foco, setas para mover, R para girar e Delete, ligada ao mesmo store.

### Testes: domínio puro, test-renderer e um E2E vigiado

A estratégia tem três camadas, de acordo com o ADR-0009 ("a cena 3D é testada pelo estado que ela desenha"):

- **Domínio puro (Vitest)**: snap, colisão, rotação e o redutor de replay ficam fora do WebGL e respondem pela maior parte da cobertura de 90% [Estimativa].
- **Componentes da cena**: o `@react-three/test-renderer` 9.1.1 permite inspecionar o grafo da cena, disparar `fireEvent` e chamar `advanceFrames` [Fato] ([R3F Testing](https://r3f.docs.pmnd.rs/api/testing); [npm](https://registry.npmjs.org/@react-three/test-renderer)).
- **E2E (Playwright)**: em CI sem GPU, o Chromium 139+ exige `--enable-unsafe-swiftshader` para WebGL por software. Quando o WebGL falha em silêncio, um screenshot pode passar com saída errada [Fato, fonte secundária] ([microlink](https://microlink.io/blog/webgl-without-a-gpu)). [Estimativa] Um teste de diagnóstico deve registrar qual renderer foi usado. Os baselines visuais devem ser gerados só no contêiner de CI.

## Um store, uma fila de comandos e um log em colunas

### Estado no cliente: Zustand 5 com TanStack Query 5

Os números de adoção do npm, lidos direto do registry [Fato] ([npm zustand](https://registry.npmjs.org/zustand); [npm RTK](https://registry.npmjs.org/@reduxjs/toolkit); [Jotai releases](https://github.com/pmndrs/jotai/releases); [MobX releases](https://github.com/mobxjs/mobx/releases)):

| Biblioteca | Versão | Downloads/semana | Observação |
|---|---|---|---|
| Zustand | 5.0.15 | 37,7 milhões | linha 5 estável desde out/2024 |
| Redux Toolkit | 2.13.0 | 19,9 milhões | — |
| Jotai | 3.0.1 | 3,8 milhões | v3 saiu em 08/09/2026; a 3.0.1 já corrigiu uma regressão |
| MobX | 7.1.0 | 2,0 milhões | v7 saiu em 30/07/2026, removendo decorators legados e APIs com namespace |

No State of React 2025, o Zustand aparece "gaining ground fast" e com a **maior satisfação** da categoria [Fato] ([State of React 2025](https://2025.stateofreact.com/en-US/libraries/state-management/)).

[Estimativa] O Zustand cobre num só lugar os três modos de acesso de um editor 3D:

- hooks com seletores para os painéis;
- `getState()` e `subscribe()` para o `useFrame`;
- `createStore` *vanilla* para testar a lógica de edição no Vitest sem React.

O Redux Toolkit atende, com mais cerimônia. Jotai e MobX encaixam menos num documento JSON único, validado por Zod e com histórico por snapshot.

Para dados do servidor, a escolha é o TanStack Query 5.104.5, com 40,1 milhões de downloads por semana [Fato] ([npm](https://registry.npmjs.org/@tanstack/react-query)). A tabela comparativa, mantida pelo próprio TanStack (parte interessada), lhe dá cancelamento de query e mutações offline que SWR e RTK Query não têm [Fato] ([TanStack comparison](https://tanstack.com/query/latest/docs/framework/react/comparison)). [Conhecimento prévio] Na mesma origem, o `fetch` envia o cookie por padrão (`credentials: 'same-origin'`). [Palpite] Rascunho é documento do usuário, não cache do servidor. Por isso não deve usar o *persister* do Query.

### Desfazer e refazer: histórico próprio, com commit no pointerup

O zundo 2.3.0, único middleware pronto de desfazer para Zustand, **não publica desde 17/11/2024**, e o último commit de código na branch principal é de 29/04/2025 [Fato] ([npm zundo](https://registry.npmjs.org/zundo); [GitHub commits](https://api.github.com/repos/charkour/zundo/commits)). Seu mecanismo para mudanças rápidas é *throttle* ou *debounce* no `handleSet` [Fato] ([zundo README](https://github.com/charkour/zundo)). [Estimativa] Nenhum dos dois produz "um arraste = um passo".

[Estimativa] O padrão robusto tem quatro peças:

- a posição da prévia fica em estado transitório (ref ou fatia fora do histórico), como o R3F já recomenda;
- no `pointerup`, um único `set` grava no documento, e a validação Zod roda só nesse commit;
- a pilha própria, de umas 40 linhas, guarda `{rótulo, doc}[]`, tem limite de 100 e permite "Desfazer: mover Estação 3";
- o *structural sharing* faz cada passo custar só os nós alterados.

Os patches do Immer economizam memória, mas dependem de índices de array. O Immer corrigiu justamente um bug de patches em arrays reordenados em 20/10/2026 [Fato] ([Immer releases](https://github.com/immerjs/immer/releases); [Immer Patches](https://immerjs.github.io/immer/patches)).

### IndexedDB: idb ou Dexie, e no Safari o rascunho pode sumir em 7 dias

As duas bibliotecas estão ativas [Fato] ([npm idb](https://registry.npmjs.org/idb); [npm dexie](https://registry.npmjs.org/dexie); [Dexie versioning](https://dexie.org/docs/Tutorial/Design#database-versioning)):

- **idb 8.0.4** (06/10/2026, 15,5 milhões de downloads por semana).
- **Dexie 4.4.6** (10/09/2026, 1,56 milhão por semana). Tem migrações declarativas com rollback em caso de falha.

O **localForage está parado desde 18/08/2021** [Fato] ([npm](https://registry.npmjs.org/localforage)). [Estimativa] O Takt guarda poucos documentos grandes e consulta por id ou por data, o que favorece o idb. A versão do esquema da planta deve migrar no `@takt/plant-schema` (que também atende importações e o servidor), não no mecanismo do banco local.

O ponto crítico é a política de apagamento:

- **Safari**: com a prevenção de rastreamento ativa, apaga tudo o que foi gravado por script quando a origem fica **7 dias de uso do navegador sem interação** [Fato] ([MDN, mod. 05/01/2026](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria); [WebKit, 24/03/2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). Web apps na tela de início têm contador próprio. O WebKit concede `persist()` por heurística [Fato] ([WebKit, 10/08/2023](https://webkit.org/blog/14403/updates-to-storage-policy/)).
- **Firefox**: o `persist()` mostra um prompt ao usuário [Fato] ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)).

[Estimativa] Um aluno que volta depois de duas semanas cai exatamente nessa regra. As mitigações:

- chamar `persist()` depois do primeiro salvamento;
- deixar "Baixar JSON" sempre visível;
- salvar no servidor quando houver conta;
- cair para "só memória + exportar" se o `open()` falhar.

Não se encontrou fonte de 2025–2026 indicando mudança na regra (lacuna).

### Worker: postMessage tipado e log de eventos em colunas

O Comlink 4.4.2 tem 1,1 kB, mas **não publica desde 07/11/2024**, e sua tipagem é "best-effort" [Fato] ([npm comlink](https://registry.npmjs.org/comlink); [Comlink README](https://github.com/GoogleChromeLabs/comlink)). [Estimativa] Um protocolo de quatro mensagens (`run`, `progress`, `result`, `error`) cabe numa união discriminada no próprio pacote do motor, sem dependência. O cancelamento mais confiável é `worker.terminate()` seguido de recriar o Worker.

O formato do log pesa mais que a biblioteca. Um benchmark de 2019 mostra o custo do `postMessage` crescendo com o tamanho do payload, e a transferência de `ArrayBuffer` praticamente independente dele [Fato, medição antiga] ([Surma, 15/07/2019](https://surma.dev/things/is-postmessage-slow/)).

[Estimativa] O formato recomendado tem quatro partes:

- 100 mil eventos como objetos dariam de 5 a 10 MB e dezenas a centenas de ms de clonagem;
- em colunas (`Float64Array` de tempos, `Uint8Array` de tipos, `Uint32Array` de ids, mais uma tabela de strings), a transferência é quase gratuita;
- o playback lê por índice, sem alocar, direto no `useFrame`;
- checkpoints periódicos de estado permitem o *seek* sem reaplicar o log inteiro.

O SharedArrayBuffer exige isolamento *cross-origin* (COOP/COEP) [Fato] ([MDN SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)). Não se justifica no MVP. Replicações paralelas (ADR-0011) usam um pool de Workers independentes.

## Base UI, mensagens ICU e ECharts cobrem a acessibilidade, com uma ressalva

### Componentes: Base UI é o padrão do shadcn desde julho de 2026

O shadcn/ui trocou o padrão em julho de 2026. Diz o anúncio: "Starting something new? We recommend Base UI"; "Radix is not being deprecated" [Fato] ([shadcn, 07/2026](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)). No mesmo mês, o React Aria virou a terceira base oficial (`init --base aria`) [Fato] ([shadcn React Aria](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)).

As versões atuais [Fato] ([npm @base-ui/react](https://registry.npmjs.org/@base-ui/react); [npm react-aria-components](https://registry.npmjs.org/react-aria-components); [npm radix-ui](https://registry.npmjs.org/radix-ui)):

| Biblioteca | Versão | Downloads/semana | Observação |
|---|---|---|---|
| `@base-ui/react` | 1.9.0 | 10,8 milhões | 1.0 estável em 11/12/2025 |
| `react-aria-components` | 1.22.1 | 2,9 milhões | — |
| `radix-ui` | 1.8.1 | — | voltou a publicar |

As críticas à manutenção do Radix em 2025 vêm de fonte secundária, sem link para as declarações originais [Fato, fonte secundária] ([DEV, 30/06/2025](https://dev.to/mashuktamim/is-your-shadcn-ui-project-at-risk-a-deep-dive-into-radixs-future-45ei)). MUI 9 e Mantine 9 trazem design system opinativo. [Conhecimento prévio] O MUI usa Emotion/`sx`, que não combina bem com Tailwind v4.

### Tooltip e toggletip: nenhuma biblioteca abre tooltip no toque

Para o PDR-0021 e a WCAG 2.2 1.4.13, o fato decisivo é que **nenhuma biblioteca abre tooltip no toque**.

- **Base UI**: diz que "tooltips are disabled on touch devices". O popup é *hoverable* por padrão e fecha com Escape. Para ícones "i", manda usar **Popover com `openOnHover`**, para que usuários de toque e de leitor de tela alcancem o conteúdo [Fato] ([Base UI Tooltip](https://base-ui.com/react/components/tooltip)).
- **React Aria**: também não mostra tooltip no toque e não tem componente Toggletip [Fato] ([React Aria Tooltip](https://react-aria.adobe.com/Tooltip)).
- **Ark UI**: vem com `interactive: false` por padrão, o que violaria o requisito de conteúdo *hoverable* [Fato] ([Ark UI Tooltip](https://ark-ui.com/docs/components/tooltip)).
- **APG**: o padrão Tooltip ainda é "work in progress" e diz que tooltip não recebe foco [Fato] ([W3C APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)).

[Estimativa] Daí saem três regras:

1. A **dica** é um Tooltip apenas suplementar, com o mesmo texto em `aria-label`.
2. O **toggletip** é um Popover não modal aberto por botão, com `aria-expanded`, Escape, foco que volta ao gatilho e **nenhum elemento interativo dentro**. O "Saiba mais" abre o painel.
3. O **painel lateral** é um `<aside>` rotulado ou um Dialog `modal={false}`, sem *focus trap*, para conviver com o editor.

[Palpite] O comportamento não modal difere entre Base UI e React Aria e merece um protótipo antes da escolha final.

### i18n: use-intl, por manter a escolha de framework reversível

As quatro bibliotecas publicaram nas últimas três semanas [Fato] ([npm next-intl](https://registry.npmjs.org/next-intl); [npm i18next](https://registry.npmjs.org/i18next); [npm react-i18next](https://registry.npmjs.org/react-i18next); [npm @lingui/core](https://registry.npmjs.org/@lingui/core); [npm react-intl](https://registry.npmjs.org/react-intl)):

| Biblioteca | Versão | Downloads/semana |
|---|---|---|
| next-intl | 4.14.9 | 4,3 milhões |
| i18next | 26.5.3 | 14,1 milhões |
| react-i18next | 17.1.0 | 10,5 milhões |
| Lingui | 6.10.0 | 1,06 milhão |
| react-intl | 12.1.5 | 1,7 milhão |

O que diferencia cada uma:

- **next-intl 4**: tem tipos estritos de chaves **e de argumentos ICU** [Fato] ([next-intl 4.0](https://next-intl.dev/blog/next-intl-4-0)). Seu núcleo `use-intl` funciona fora do Next, com `useTranslations`, `useFormatter` e `createTranslator` [Fato] ([next-intl core library](https://next-intl.dev/docs/environments/core-library)).
- **i18next**: as tipagens estão em transição para a *selector API*, porque a validação legada pode estourar a memória com milhares de chaves. A doc avisa que o suporte de tipos da API por string pode ser descontinuado na v27 [Fato] ([i18next TypeScript](https://www.i18next.com/overview/typescript)). [Conhecimento prévio] ICU exige o plugin `i18next-icu`.
- **Lingui 6**: o núcleo tem cerca de 2 KB, mas depende de macros na toolchain [Fato] ([Lingui v6.0.0](https://github.com/lingui/js-lingui/releases/tag/v6.0.0)).

[Estimativa] O **use-intl** vence por três razões:

- mensagens ICU com tipos estritos, o que importa para um conteúdo didático extenso;
- a mesma API e os mesmos arquivos de mensagens servem se o Next.js for mantido;
- ele nunca vira pré-requisito de servidor.

O risco é que a versão e os downloads do `use-intl` isolado não foram coletados (lacuna). O react-i18next é a alternativa mais aceita pelo mercado.

Um teste local verificou um detalhe que vira regra de estilo: `Intl.PluralRules('pt-BR').select(0)` retorna `"one"` [Fato, teste local 20/10/2026] ([MDN PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)). Sem um caso `=0` explícito na mensagem ICU, a interface diria "0 peça". Os códigos de erro da API (RN-I18-004) devem virar uma *union* gerada do OpenAPI e mapeada para chaves declaradas explicitamente.

### Gráficos: ECharts nas séries, Recharts nos cards, tabela sempre

As opções e seu estado [Fato] ([npm echarts](https://registry.npmjs.org/echarts); [npm recharts](https://registry.npmjs.org/recharts); [npm uplot](https://registry.npmjs.org/uplot)):

| Biblioteca | Versão | Downloads/semana | Observação |
|---|---|---|---|
| ECharts | 6.1.0 (19/05/2026) | 3,6 milhões | canvas, Apache |
| Recharts | 3.10.1 | 33,3 milhões | SVG |
| uPlot | 1.6.32 | — | **sem release desde 14/03/2025** |

O que cada uma oferece para o Takt:

- **ECharts**: o módulo `aria` gera uma descrição textual dos dados e oferece *decal patterns* para distinguir séries sem depender de cor. Mas vem desligado por padrão, e a doc não menciona navegação por teclado [Fato] ([ECharts Aria](https://echarts.apache.org/handbook/en/best-practices/aria/)).
- **Recharts 3**: liga o `accessibilityLayer` por padrão, com Tab e setas [Fato] ([Recharts v3.0.0](https://github.com/recharts/recharts/releases/tag/v3.0.0)). O próprio guia de desempenho manda agregar ou amostrar volumes grandes [Fato] ([Recharts performance](https://recharts.github.io/en-US/guide/performance/)).
- **uPlot**: o benchmark do README mede 10% de CPU contra 70% do ECharts num streaming de 3.600 pontos, mas o README não fala de acessibilidade [Fato, benchmark de 2023] ([uPlot](https://github.com/leeoniya/uPlot)).

[Conhecimento prévio] O ECharts tem `markLine`/`markArea` (linha e área de aquecimento), bandas de intervalo de confiança empilhadas, `dataZoom` e `sampling: 'lttb'`.

[Estimativa] Cinco séries com cinco mil pontos cabem com folga em canvas. Em SVG, seriam precisos downsampling LTTB e reamostragem no zoom. Nenhuma biblioteca dispensa três coisas que o app deve fazer por conta própria:

- um resumo textual gerado pelo app;
- a **tabela de dados alternativa**, formatada no locale;
- formatadores `Intl` injetados nos eixos e tooltips, sem os quais aparece ponto decimal em pt-BR.

## Recomendação por camada e decisões pendentes

| Camada | Recomendação | Versão atual (20/10/2026) | Alternativa | Riscos principais |
|---|---|---|---|---|
| Build e framework | Vite + React SPA estática | Vite 8.3.4; React 19.3 (via Next 16.4) [Fato] | Next.js 16.4.2 com servidor; RR 8 framework `ssr:false` + `prerender` | SEO da landing sem pré-renderização; perde convenções "full-stack" |
| Roteamento | React Router 8, modo *data* | 8.5.0 | TanStack Router (12,3 milhões/semana; search params tipados) | Major anual; Nx router-plugin e RR v8 não confirmados |
| Proxy `/api` | nginx/LB na frente: `/api/*` para a NestJS, `/*` estático; `server.proxy` do Vite no dev | — | Next `rewrites` (exige servidor Next) | Proxy, CSP e HSTS passam para a infraestrutura |
| Monorepo | `@nx/react` + `@nx/vite` + `@nx/vitest` + `@nx/playwright` | Nx 23.3.0 | `@nx/next` | — |
| 3D | React Three Fiber + drei + three, `WebGLRenderer`, materiais padrão | R3F 9.8.2; drei 10.7.9; three 0.186.1 | Babylon.js 9.31.1 (gizmos e a11y embutidos) | drei com hiatos; R3F v10 com breaking changes; `@react-three/a11y` parado |
| Utilitários 3D | `camera-controls`, `three-mesh-bvh` sob demanda, `@react-three/postprocessing` | 3.1.2; 0.9.16; 3.2.1 | Outline por cor de instância | — |
| Testes 3D | Vitest (domínio) + `@react-three/test-renderer` + Playwright com SwiftShader | test-renderer 9.1.1 | Vitest Browser Mode (não avaliado) | WebGL em CI degrada em silêncio; baselines só no CI |
| Estado | Zustand com fatias de documento, UI e playback | 5.0.15 | Redux Toolkit 2.13.0 | Disciplina: nada por frame passa pelo React |
| Dados do servidor | TanStack Query | 5.104.5 | SWR 2.5.1; RTK Query | Baixo |
| Desfazer/refazer | Pilha própria com rótulo, limite de 100 e commit no `pointerup` | — | zundo 2.3.0; patches do Immer 11.2.3 | Código próprio a testar; zundo sem release desde nov/2024 |
| Persistência local | idb + migração no `@takt/plant-schema` | idb 8.0.4 | Dexie 4.4.6 | Safari apaga após 7 dias sem interação; modo privado |
| Worker | `postMessage` tipado (união discriminada); log em colunas transferidas; pool para replicações | — | Comlink 4.4.2 | Formato próprio de log a manter |
| Componentes | Base UI via shadcn + Tailwind v4 | Base UI 1.9.0; shadcn 4.22.1; Tailwind 4.3.3 | React Aria Components 1.22.1 (`--base aria`) | Sem auditoria independente de a11y; toggletip é código do Takt |
| i18n | use-intl (ICU, tipos estritos) + `Intl` nativo | next-intl/use-intl 4.14.9 [versão do use-intl isolado não verificada] | react-i18next 17.1.0 / i18next 26.5.3 | Mantenedor concentrado [Palpite]; plural pt-BR `0 → one` |
| Gráficos | ECharts (séries temporais, build modular, wrapper próprio) + Recharts (KPIs) + tabela alternativa | ECharts 6.1.0; Recharts 3.10.1 | uPlot 1.6.32 | Canvas é opaco a leitor de tela; duas bibliotecas de gráfico |

As decisões abaixo mudam documentos já escritos ou dependem de produto. Por isso precisam da confirmação do usuário antes de virar ADR.

| # | Decisão a confirmar | O que muda | Recomendação |
|---|---|---|---|
| 1 | Trocar Next.js por Vite SPA no `takt-web-app` | ADR-0001 (linha "Next.js... proxy /api em produção") e o diagrama de `docs/architecture/README.md` | Trocar |
| 2 | Quem faz o proxy `/api` em produção | ADR-0005, item 6 ("o `takt-web-app` responde em `/api` e repassa"). Passa a ser o nginx/LB, e o "Em aberto: configuração do proxy" vira tema central. A confiança em `X-Forwarded-For` passa a valer só para esse proxy | Proxy reverso único servindo estático + `/api` |
| 3 | Usar o proxy do Vite também no desenvolvimento | ADR-0005, item 7 (dev "sem proxy", com portas diferentes). Com `server.proxy` o dev espelha a produção, sem CORS nem `credentials: 'include'` | Usar o proxy no dev |
| 4 | Se mantiver o Next.js: aceitar um servidor Node no front | Exige `next start`, só `rewrites`, sem Server Actions, sem `use cache`, `images.unoptimized`, remover `x-middleware-*` no proxy e acompanhar sempre a última minor | Só se houver motivo que este relatório não cobre |
| 5 | A landing pública precisa de SEO? | Se sim: RR modo framework `ssr:false` + `prerender`, ou landing estática separada | Decidir com o produto |
| 6 | Onde ficam os cabeçalhos de segurança (CSP, HSTS) | A mitigação de XSS do ADR-0005 ("CSP no front") vai para a config do nginx/LB | Configurar no proxy |
| 7 | Base de componentes: Base UI ou React Aria | Comportamento de tooltip, toggletip e painel não modal; NumberField com vírgula decimal [Conhecimento prévio: React Aria] | Base UI, após protótipo do painel |
| 8 | Biblioteca de i18n e formato de mensagem | ICU (use-intl) ou formato i18next; regra de estilo `=0` | use-intl com ICU |
| 9 | Rascunho só local ou também no servidor | Regra de 7 dias do Safari (PDR-0013, importar e exportar) | Exportar sempre visível + salvar no servidor quando houver conta |
| 10 | WebGL2 agora, WebGPU depois | Proibir GLSL próprio; TSL se necessário; migrar para R3F v10 quando estável | Sim |
| 11 | Exclusões de cobertura para "cola" do canvas | ADR-0009 exige 90% e justificativa por exclusão | Cobrir via test-renderer; excluir só o bootstrap do renderer |
| 12 | Duas bibliotecas de gráfico ou uma | Bundle e consistência visual | ECharts + Recharts; reavaliar se os KPIs couberem em HTML/CSS |

## Conclusão

A pergunta "qual framework React" estava mal colocada para o Takt. O produto não tem conteúdo para renderizar no servidor, e 2026 mostrou que o servidor do framework é onde as vulnerabilidades críticas aparecem. A decisão real é **onde mora o proxy `/api`**. Mover o proxy para a infraestrutura simplifica três frentes de uma vez: a superfície de ataque, o deploy (um contêiner nginx ou um bucket) e o modelo de cookie do ADR-0005, que continua válido sem alteração de semântica. O custo é que o ADR-0005, hoje "Proposto", precisa ser revisto antes de ser aceito.

A segunda lição é que os pontos frágeis da pilha não estão nas bibliotecas grandes, e sim nas pequenas que as completam: zundo, Comlink, `@react-three/a11y`, os hiatos da drei e uPlot ou Nivo sem releases. [Estimativa] O padrão que se repete é que, onde o Takt precisa de comportamento específico (desfazer por arraste, protocolo do Worker, toggletip, espelho acessível da cena, tabela dos gráficos), escrever algumas dezenas de linhas próprias e testadas custa menos que depender de um pacote parado. Isso também conversa bem com a meta de 90% de cobertura. Fica uma lacuna que nenhuma fonte cobriu: não há auditoria independente recente comparando Base UI, React Aria e Radix com leitores de tela reais. Um teste próprio com NVDA, VoiceOver e TalkBack é o próximo passo antes de fechar a camada de interface.

## Referências

Todas acessadas em 20/10/2026, salvo indicação. A data entre parênteses é a de publicação ou da versão citada.

**Framework, roteamento, build e monorepo**
- Next.js. "Next.js 16.4" (06/10/2026). https://nextjs.org/blog/next-16-4
- Next.js. "Next.js 16" (10/2025). https://nextjs.org/blog/next-16
- Next.js. "Next.js Security Update: October 14, 2026" (14/10/2026). https://nextjs.org/blog/nextjs-security-update-october-14-2026
- Next.js. "CVE-2025-66478" (12/2025). https://nextjs.org/blog/CVE-2025-66478
- Next.js. "Next.js Security Release Program". https://nextjs.org/blog/next-security-release-program
- Next.js. "Upcoming Next.js security release, September 2026". https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026
- Next.js Docs. "Static Exports" (atualizado 09/08/2026). https://nextjs.org/docs/app/guides/static-exports
- Next.js Docs. "rewrites" (atualizado 28/09/2026). https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
- Next.js. "Next.js 16.2: Turbopack" (18/03/2026). https://nextjs.org/blog/next-16-2-turbopack
- Vercel. "Next.js May 2026 security release" (05/2026). https://vercel.com/changelog/next-js-may-2026-security-release
- GitHub Security Advisory GHSA-q4gf-8mx6-v5v3 / CVE-2026-23869 (04/2026). https://github.com/vercel/next.js/security/advisories/GHSA-q4gf-8mx6-v5v3
- Netlify. Changelog, "React/Next.js DoS vulnerability" (08/04/2026). https://www.netlify.com/changelog/2026-04-08-react-nextjs-dos-vulnerability/
- Netlify. Changelog, "React and Next.js security vulnerabilities" (08/05/2026). https://www.netlify.com/changelog/2026-05-08-react-nextjs-security-vulnerabilities/
- Netlify. Changelog, "TanStack Start security vulnerability" (30/09/2026). https://www.netlify.com/changelog/2026-09-30-tanstack-start-security-vulnerability/
- Cloudflare. WAF changelog (06/05/2026). https://developers.cloudflare.com/changelog/post/2026-05-06-react-nextjs-vulnerabilities/
- NVD. CVE-2025-29927 (03/2025). https://nvd.nist.gov/vuln/detail/cve-2025-29927
- Fastly. "CVE-2025-29927: authorization bypass in Next.js" (03/2025). https://fastly.com/blog/cve-2025-29927-authorization-bypass-in-next-js
- Wiz. CVE-2025-29927. https://www.wiz.io/pt-br/vulnerability-database/cve/cve-2025-29927
- Azion. "Mitigate CVE-2025-29927". https://www.azion.com/en/documentation/products/guides/secure/mitigate-cve-2025-29927-nextjs/
- Datadog Security Labs. "CVE-2025-55182 React2Shell" (12/2025). https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/
- Bitsight. "React2Shell" (12/2025). https://www.bitsight.com/blog/security-alert-cve-2025-66478-cve-2025-55182-react2shell-nextjs-react-server-components-remote
- Daily Security Review (10/2026). https://dailysecurityreview.com/?p=44596
- SecurityOnline. "Next.js security update RCE, October 2026" (10/2026). https://securityonline.info/nextjs-security-update-rce-october-2026/
- Remix. "React Router v8" (17/06/2026). https://remix.run/blog/react-router-v8
- InfoQ. "React Router v8" (08/2026). https://www.infoq.com/news/2026/08/react-route-v8/
- React Router Docs. "SPA Mode" (v8.5.0). https://reactrouter.com/how-to/spa
- React Router. Changelog. https://reactrouter.com/changelog
- React Router. "Modes" (v8.3.0, jsDelivr). https://cdn.jsdelivr.net/npm/react-router@8.3.0/docs/start/modes.md
- GitHub. remix-run/react-router releases. https://github.com/remix-run/react-router/releases
- MITRE. CVE-2026-22030 (01/2026). https://cveawg.mitre.org/api/cve/CVE-2026-22030
- GitHub Advisory GHSA-2w69-qvjg-hvjx (01/2026). https://github.com/advisories/GHSA-2w69-qvjg-hvjx
- OSV. CVE-2026-42342 (06/2026). https://osv.dev/vulnerability/CVE-2026-42342
- GitLab Advisory. CVE-2026-53663 (06/2026). https://advisories.gitlab.com/npm/react-router/CVE-2026-53663/
- GitLab Advisory. CVE-2026-42342 (06/2026). https://advisories.gitlab.com/npm/react-router/CVE-2026-42342/
- LogRocket. "Remix 3 ditched React". https://blog.logrocket.com/remix-3-ditched-react/
- TanStack. "TanStack Start 1.0 is Stable" (13/10/2026). https://tanstack.com/blog/tanstack-start-1-0
- TanStack. "Security update: CVE-2026-102989" (30/09/2026). https://tanstack.com/blog/tanstack-start-security-update-cve-2026-102989
- TanStack Start Docs. "Selective SSR". https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
- TanStack Start Docs. "SPA mode". https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode
- TanStack Start Docs. "Migrate from the Release Candidate". https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate
- Appwrite. "TanStack Start server function XSS" (10/2026). https://appwrite.io/blog/post/tanstack-start-server-function-xss
- Tech Insider. "TanStack Start 1.0" (10/2026). https://tech-insider.org/tanstack-start-1-0-stable-release-2026/
- Vite. "Announcing Vite 8" (12/03/2026). https://vite.dev/blog/announcing-vite8
- VoidZero. "Announcing Rolldown 1.0" (07/05/2026). https://voidzero.dev/posts/announcing-rolldown-1-0
- Vite Docs. "Server Options". https://vite.dev/config/server-options
- Vite Docs. "Features: Web Workers". https://vite.dev/guide/features#web-workers
- Nx Docs. "React Router guide". https://nx.dev/docs/technologies/react/guides/react-router
- Nx. "React Router recipe". https://nx.dev/recipes/react/react-router
- GitHub. nrwl/nx Discussion #34273 (01/2026). https://github.com/nrwl/nx/discussions/34273
- GitHub. nrwl/tanstack-start-template. https://github.com/nrwl/tanstack-start-template
- GitHub. TanStack/router PR #5508. https://github.com/TanStack/router/pull/5508
- Harbor. Task nrwl/nx-32814 (03/2026). https://hub.harborframework.com/tasks/abundant/nrwl__nx-32814
- semanticdiff. vercel/next.js commit d23af53. https://app.semanticdiff.com/gh/vercel/next.js/commit/d23af53268d062ff70b7c12322750b85ed3a76ba
- semanticdiff. vercel/next.js commit cb96548. https://app.semanticdiff.com/gh/vercel/next.js/commit/cb96548418cb856cf91d2bdda2083f5bd1e9611b
- npm registry: next, react-router, @tanstack/react-start, vite, nx, @nx/next@23.3.0, @nx/vite@23.3.0, @nx/vitest@23.3.0, @nx/playwright, @nx/react@23.3.0, @nx/remix (consultados em 20/10/2026). https://registry.npmjs.org/
- npm downloads API, semana 12–18/10/2026. https://api.npmjs.org/downloads/point/last-week/next

**Pesquisas de mercado**
- Devographics. State of JS 2025, Meta-Frameworks. https://2025.stateofjs.com/en-US/libraries/meta-frameworks/
- Devographics. State of JS 2025, Libraries. https://2025.stateofjs.com/en-US/libraries/
- Devographics. State of React 2025, State Management. https://2025.stateofreact.com/en-US/libraries/state-management/
- Devographics. State of React 2025 (questionário). https://survey.devographics.com/survey/state-of-react/2025
- Devographics. State of React 2024, State Management. https://2024.stateofreact.com/en-US/libraries/state-management/
- InfoQ. "State of JS 2025" (03/2026). https://www.infoq.com/news/2026/03/state-of-js-survey-2025/
- Strapi. "State of React 2025 key takeaways". https://strapi.io/blog/state-of-react-2025-key-takeaways
- Certificates.dev. "Breaking down State of React 2025 results". https://certificates.dev/blog/breaking-down-state-of-react-2025-results
- Pagepro. "Stack Overflow 2025: React and Next.js" (2025). https://pagepro.co/blog/react-tldr/stack-overflow-2025-react-and-next-js-grow-in-use-drop-in-admiration/

**3D**
- three.js. Releases (r183–r186, 2026). https://github.com/mrdoob/three.js/releases
- three.js Docs. BatchedMesh. https://threejs.org/docs/pages/BatchedMesh.html
- three.js Docs. Raycaster. https://threejs.org/docs/pages/Raycaster.html
- three.js Docs. TransformControls. https://threejs.org/docs/pages/TransformControls.html
- three.js Manual. WebGPURenderer (obtido por snippet de busca). https://threejs.org/manual/en/webgpurenderer
- pmndrs. R3F Installation. https://r3f.docs.pmnd.rs/getting-started/installation
- pmndrs. R3F Scaling performance. https://r3f.docs.pmnd.rs/advanced/scaling-performance
- pmndrs. R3F Performance pitfalls. https://r3f.docs.pmnd.rs/advanced/pitfalls
- pmndrs. R3F Events. https://r3f.docs.pmnd.rs/api/events
- pmndrs. R3F Testing. https://r3f.docs.pmnd.rs/api/testing
- GitHub. pmndrs/react-three-fiber releases (9.6–9.8.2; 10.0.0-alpha.1–alpha.6, 2026). https://github.com/pmndrs/react-three-fiber/releases
- GitHub. pmndrs/react-three-fiber issue #3268. https://github.com/pmndrs/react-three-fiber/issues/3268
- pmndrs. drei Instances. https://drei.docs.pmnd.rs/performances/instances
- pmndrs. drei TransformControls. https://drei.docs.pmnd.rs/gizmos/transform-controls
- pmndrs. drei PivotControls. https://drei.docs.pmnd.rs/gizmos/pivot-controls
- GitHub. pmndrs/react-three-a11y. https://github.com/pmndrs/react-three-a11y
- Microsoft Windows Developer Blog. "Announcing Babylon.js 9.0" (26/03/2026). https://blogs.windows.com/windowsdeveloper/2026/03/26/announcing-babylon-js-9-0
- Microsoft Windows Developer Blog. "Babylon.js 9.0 Part 3: OpenPBR" (02/04/2026). https://blogs.windows.com/windowsdeveloper/2026/04/02/part-3-babylon-js-9-0-openpbr-and-additional-engine-updates/
- Babylon.js Docs. Thin Instances. https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/thinInstances
- Babylon.js Docs. WebGPU support. https://doc.babylonjs.com/setup/support/webGPU
- Babylon.js Docs. Gizmos. https://doc.babylonjs.com/features/featuresDeepDive/mesh/gizmo
- Babylon.js Forum. "Selection outliner". https://forum.babylonjs.com/t/selection-outliner-blender-style-outlines/61598
- Babylon.js Forum. "Selection outliner bug with instances". https://forum.babylonjs.com/t/selection-outliner-bug-with-instances/63029
- unpkg. selectionOutlineLayer.pure.d.ts (@babylonjs/core 9.18.0). https://app.unpkg.com/@babylonjs/core@9.18.0/files/Layers/selectionOutlineLayer.pure.d.ts
- GitHub. playcanvas/engine. https://github.com/playcanvas/engine
- GitHub. playcanvas/react. https://github.com/playcanvas/react
- gpuweb. Implementation Status (editado em 02/10/2026). https://github.com/gpuweb/gpuweb/wiki/Implementation-Status
- caniuse. WebGPU (dados de uso de 09/2026). https://caniuse.com/webgpu
- web.dev. "WebGPU is now supported in major browsers" (11/2025). https://web.dev/blog/webgpu-supported-major-browsers
- Utsubo. "WebGPU + Three.js Migration Guide" (2026). https://www.utsubo.com/blog/webgpu-threejs-migration-guide
- buildmvpfast. "WebGL to WebGPU migration" (2026). https://www.buildmvpfast.com/blog/threejs-webgl-to-webgpu-renderer-migration-2026
- threejsresources. "Three.js with Next.js Integration Guide" (2026). https://threejsresources.com/frameworks/three-js-nextjs
- hontran.dev. "React Three Fiber tutorial" (2026). https://www.hontran.dev/blog/react-three-fiber-tutorial-for-beginners
- three.js forum. "Next.js and three fiber URL problem" (~2023). https://discourse.threejs.org/t/nextjs-and-threejs-fiber-url-problem/57346
- microlink. "WebGL without a GPU". https://microlink.io/blog/webgl-without-a-gpu
- Chromium. chromedp v0.14.1 (SwiftShader). https://chromium.googlesource.com/external/github.com/chromedp/chromedp/+/refs/tags/v0.14.1
- Chromium. "headless osmesa → SwiftShader". https://chromium.googlesource.com/chromium/src.git/+/d99a9664c873fc38e226e33bc92da974fb852da3
- Dave Snider. "GPU tests". https://backiee.wasmer.app/https_davesnider_com/posts/gputests
- npm registry: three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, @react-three/test-renderer, @react-three/a11y, camera-controls, three-mesh-bvh, @babylonjs/core, @babylonjs/accessibility, react-babylonjs, reactylon, playcanvas, @playcanvas/react (20/10/2026). https://registry.npmjs.org/
- GitHub API: repositórios three.js, react-three-fiber, drei, Babylon.js, playcanvas/engine, react-three-a11y (20/10/2026). https://api.github.com/repos/mrdoob/three.js

**Estado, dados e Worker**
- Zustand Docs. devtools middleware [conhecimento prévio, não reaberto]. https://zustand.docs.pmnd.rs/middlewares/devtools
- GitHub. pmndrs/jotai releases (v3.0.0 em 08/09/2026; 3.0.1 em 29/09/2026). https://github.com/pmndrs/jotai/releases
- GitHub. Jotai, "Migrating to v3". https://github.com/pmndrs/jotai/blob/main/docs/guides/migrating-to-v3.mdx
- GitHub. mobxjs/mobx releases (7.0.0 em 30/07/2026). https://github.com/mobxjs/mobx/releases
- GitHub. immerjs/immer releases (11.2.3 em 20/10/2026). https://github.com/immerjs/immer/releases
- Immer Docs. Patches. https://immerjs.github.io/immer/patches
- TanStack Query Docs. Comparison. https://tanstack.com/query/latest/docs/framework/react/comparison
- GitHub. charkour/zundo (README). https://github.com/charkour/zundo
- GitHub API. charkour/zundo commits. https://api.github.com/repos/charkour/zundo/commits
- Dexie Docs. "Design: database versioning". https://dexie.org/docs/Tutorial/Design#database-versioning
- MDN. "Storage quotas and eviction criteria" (modificado em 05/01/2026). https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- WebKit. "Full Third-Party Cookie Blocking and More" (24/03/2020). https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- WebKit. "Updates to Storage Policy" (10/08/2023). https://webkit.org/blog/14403/updates-to-storage-policy/
- GitHub. GoogleChromeLabs/comlink (README). https://github.com/GoogleChromeLabs/comlink
- GitHub API. comlink commits. https://api.github.com/repos/GoogleChromeLabs/comlink/commits
- Surma. "Is postMessage slow?" (15/07/2019). https://surma.dev/things/is-postmessage-slow/
- MDN. SharedArrayBuffer (modificado em 10/02/2026). https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
- web.dev. "Making your website cross-origin isolated" [conhecimento prévio, não reaberto]. https://web.dev/articles/coop-coep
- npm registry: zustand, @reduxjs/toolkit, react-redux, jotai, mobx, mobx-react-lite, valtio, @tanstack/store, immer, @tanstack/react-query, swr, zundo, redux-undo, dexie, idb, localforage, comlink, zod (20/10/2026). https://registry.npmjs.org/
- GitHub API: repositórios zustand, jotai, mobx, immer, zundo, Dexie.js, idb, localForage, comlink (20/10/2026). https://api.github.com/repos/pmndrs/zustand

**Interface, i18n e gráficos**
- shadcn/ui. Changelog. https://ui.shadcn.com/docs/changelog
- shadcn/ui. "Base UI as the Default" (07/2026). https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn/ui. "React Aria" (07/2026). https://ui.shadcn.com/docs/changelog/2026-07-react-aria
- OpenReplay. "shadcn/ui switches from Radix to Base UI" (13/09/2026). https://blog.openreplay.com/shadcn-ui-radix-base-ui-switch/
- Mashuk Tamim, DEV Community. "Is your shadcn/ui project at risk?" (30/06/2025; comentário de 13/12/2025). https://dev.to/mashuktamim/is-your-shadcn-ui-project-at-risk-a-deep-dive-into-radixs-future-45ei
- Product Hunt. Colm Tuite. https://www.producthunt.com/@colmtuite
- Base UI Docs. Tooltip. https://base-ui.com/react/components/tooltip
- React Aria Docs. Tooltip. https://react-aria.adobe.com/Tooltip
- React Aria. Components index. https://react-spectrum.adobe.com/react-aria/components.html
- Radix Primitives Docs. Tooltip. https://www.radix-ui.com/primitives/docs/components/tooltip
- Ark UI Docs. Tooltip. https://ark-ui.com/docs/components/tooltip
- Mantine Docs. Styles overview. https://mantine.dev/styles/styles-overview/
- GitHub. MUI v9.0.0 release (08/04/2026). https://github.com/mui/material-ui/releases/tag/v9.0.0
- GitHub. Mantine 9.0.0 release (31/03/2026). https://github.com/mantinedev/mantine/releases/tag/9.0.0
- W3C WAI-ARIA APG. Tooltip Pattern. https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- W3C. APG meeting minutes (24/08/2021). https://www.w3.org/2021/08/24-aria-apg-minutes.html
- GitHub. w3c/aria-practices PR #811. https://github.com/w3c/aria-practices/pull/811
- next-intl Docs. Routing setup. https://next-intl.dev/docs/routing/setup
- next-intl. "next-intl 4.0" (12/03/2025). https://next-intl.dev/blog/next-intl-4-0
- next-intl Docs. Core library (use-intl). https://next-intl.dev/docs/environments/core-library
- next-intl Docs. Extraction. https://next-intl.dev/docs/usage/extraction
- next-intl Docs. Agents. https://next-intl.dev/docs/workflows/agents
- GitHub. next-intl v4.5.0 release (07/11/2025). https://github.com/amannn/next-intl/releases/tag/v4.5.0
- jsDelivr. next-intl 4.14.2 README. https://cdn.jsdelivr.net/npm/next-intl@4.14.2/README.md
- newreleases. next-intl 4.5.6. https://newreleases.io/project/npm/next-intl/release/4.5.6
- i18next Docs. TypeScript. https://www.i18next.com/overview/typescript
- newreleases. i18next 26.0.0 (28/03/2026). https://newreleases.io/project/npm/i18next/release/26.0.0
- GitHub. Lingui v6.0.0 release (22/04/2026). https://github.com/lingui/js-lingui/releases/tag/v6.0.0
- GitHub. Lingui releases. https://github.com/lingui/js-lingui/releases
- Lingui. "Announcing Lingui 6.0" (22/04/2026). https://lingui.dev/blog/2026/04/22/announcing-lingui-6.0
- Lingui. Migration guide 6.x. https://lingui.dev/releases/migration-6
- GitHub. react-intl@12.0.0 release (15/09/2026). https://github.com/formatjs/formatjs/releases/tag/react-intl%4012.0.0
- MDN. Intl.NumberFormat. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- MDN. Intl.PluralRules. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
- GitHub. Recharts v3.0.0 release (23/06/2025). https://github.com/recharts/recharts/releases/tag/v3.0.0
- GitHub. Recharts 3.0 migration guide. https://github.com/recharts/recharts/wiki/3.0-migration-guide
- Recharts Docs. Performance guide. https://recharts.github.io/en-US/guide/performance/
- GitHub. Apache ECharts 6.0.0 release (30/07/2025). https://github.com/apache/echarts/releases/tag/6.0.0
- ECharts Handbook. Aria. https://echarts.apache.org/handbook/en/best-practices/aria/
- GitHub. leeoniya/uPlot (README; benchmark de 11/03/2023). https://github.com/leeoniya/uPlot
- GitHub. visx v4.0.0 release (11/06/2026). https://github.com/airbnb/visx/releases/tag/v4.0.0
- Querio. "Top React chart libraries" (2026). https://querio.ai/articles/top-react-chart-libraries-data-visualization
- PkgPulse. "Best JavaScript charting libraries 2026". https://www.pkgpulse.com/guides/best-javascript-charting-libraries-2026
- LightningChart. "Best Chart.js alternatives in 2026". https://lightningchart.com/blog/best-chart-js-alternatives-in-2026/
- bundlephobia API (pacote inteiro, sem tree-shaking; 20/10/2026). https://bundlephobia.com/api/size?package=react-aria-components@1.22.1
- npm registry: radix-ui, @radix-ui/react-tooltip, @base-ui/react, @base-ui-components/react, react-aria-components, @mui/material, @mantine/core, @ark-ui/react, shadcn, tailwindcss, @floating-ui/react, next-intl, i18next, react-i18next, @lingui/core, react-intl, recharts, echarts, echarts-for-react, @visx/xychart, uplot, uplot-react, @observablehq/plot, @nivo/line, chart.js, react-chartjs-2, chartjs-plugin-annotation, chartjs-plugin-zoom (20/10/2026). https://registry.npmjs.org/

**Documentos internos do Takt citados**
- ADR-0001, "Monorepo com Nx e nomes" (20/10/2026). `docs/adr/0001-monorepo-nx-e-nomes.md`
- ADR-0005, "Sessão no banco com cookie e proxy pelo front" (20/10/2026). `docs/adr/0005-sessao-no-banco-com-cookie.md`
- ADR-0009, "Estratégia de testes". `docs/adr/0009-estrategia-de-testes.md`
- ADR-0011, "Motor de simulação e esquema". `docs/adr/0011-motor-de-simulacao-e-esquema.md`
- PDR-0016, "Idiomas" (19/10/2026). `docs/pdr/0016-idiomas.md`
- PDR-0021, "Explicação em camadas" (20/10/2026). `docs/pdr/0021-explicacao-em-camadas.md`
