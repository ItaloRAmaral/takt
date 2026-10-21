# Framework React para o front-end do Takt (estado em outubro de 2026)

Escopo: comparar **Next.js (App Router)**, **Vite + React SPA (React Router em modo declarative/data)**, **React Router framework mode (ex-Remix)** e **TanStack Start** para um app majoritariamente client-side: fábrica 3D editável (React Three Fiber), engine de simulação TypeScript em Web Worker, charts, painéis laterais, i18n pt-BR/en, login por cookie de sessão HttpOnly, reverse proxy `/api` → NestJS (front e API same-site em produção), monorepo Nx, Vitest + Playwright.

Convenção usada nestas notas:
- **[Fato]** = afirmação com fonte primária ou dado medido (npm registry).
- **[Fato, fonte secundária]** = afirmação com fonte, mas não primária; tratar com cautela.
- **[Estimativa]** = inferência razoável a partir dos fatos citados.
- **[Palpite]** = opinião/aposta sem evidência direta.

Data de coleta: 2026-10-20. Dados do npm coletados diretamente da API pública do registry nesse dia.

---

## 1. Versões estáveis atuais, datas, governança e indicadores de adoção

### Takeaway
Os quatro candidatos estão em versões estáveis e com manutenção ativa em outubro de 2026: Next.js 16.4.2 (Vercel), React Router 8.5.0 (equipe Remix/Shopify, que agora usa "Open Governance"), TanStack Start 1.169.x (o **1.0 estável saiu em 13/10/2026**, ou seja, há uma semana) e Vite 8.3.4 (VoidZero). Next.js segue líder em uso, mas com satisfação em queda nas pesquisas. TanStack Start é o mais novo e o de menor histórico em produção.

### Cited Findings

**Next.js**
- [Fato] Versão `latest` no npm: **16.4.2**, publicada em 2026-10-15. O Next.js 16.0.0 foi publicado em 2025-10-22. — [npm registry: next](https://registry.npmjs.org/next) (consultado em 2026-10-20)
- [Fato] O Next.js 16.4 foi anunciado em **6/10/2026**. Ele recomenda **Cache Components** para todos os apps (habilitados por padrão no `create-next-app`) e diz que esse modelo "will become the default in Next.js 17". Vem com React 19.3, menor uso de disco/memória no Turbopack e ferramentas para agentes (`next upgrade --agent`). — [Next.js 16.4 blog](https://nextjs.org/blog/next-16-4) (2026-10-06)
- [Fato] O Next.js 16 (out/2025) tornou o Turbopack o bundler padrão e introduziu `proxy.ts` no lugar de `middleware.ts`. — [Next.js 16 blog](https://nextjs.org/blog/next-16) (2025-10); confirmado indiretamente pela doc de rewrites, que lista "proxy" na ordem de roteamento — [Next.js rewrites docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) (lastUpdated 2026-09-28)
- [Fato] Política de suporte: o post de segurança de outubro chama a v16.4.1 de "Active LTS" e a v15.5.28 de "Maintenance LTS". — [Next.js Security Update Oct 14 2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
- [Fato, fonte secundária] Segundo a Netlify, as correções de segurança de maio/2026 saíram só para a última minor de cada major (15.5.18 e 16.2.6). Minors antigas de 15.x/16.x não recebem patch. — [Netlify changelog May 2026](https://www.netlify.com/changelog/2026-05-08-react-nextjs-security-vulnerabilities/)
- [Fato] Governança: o projeto é mantido pela Vercel. A equipe listada no post do 16.4 inclui Andrew Clark, Dan Abramov, Sebastian Silbermann, Tim Neutkens, entre outros. — [Next.js 16.4 blog](https://nextjs.org/blog/next-16-4)

**React Router (framework mode / ex-Remix)**
- [Fato] Versão `latest` no npm: **8.5.0**, publicada em 2026-10-19. A v8.0.0 foi publicada em 2026-06-17. A linha 7.x ainda recebe patches (7.18.4 em 15/set). — [npm registry: react-router](https://registry.npmjs.org/react-router); [GitHub releases](https://github.com/remix-run/react-router/releases)
- [Fato] A v8 foi anunciada em 17/06/2026 como release "deliberadamente chato": ESM-only, target ES2022, middleware e split route modules ligados por padrão, `react-router-dom` removido. Requisitos mínimos: Node 22.22.0+, React 19.2.7+, Vite 7+. O time adota **major anual**. RR v6 e Remix v2 estão em EOL (sem patches de segurança), e a v7 continua recebendo patches de segurança. O suporte a RSC continua **unstable** e opt-in. — [React Router v8 blog](https://remix.run/blog/react-router-v8) (2026-06-17); [InfoQ](https://www.infoq.com/news/2026/08/react-route-v8/) (2026-08)
- [Fato] Governança: o post fala de "Open Governance" (processo via GOVERNANCE.md). O site é © Shopify, Inc. O Remix 3 virou um framework separado (beta, zero-dependency, sem React), e o próprio time recomenda React Router para produção. — [React Router v8 blog](https://remix.run/blog/react-router-v8); [LogRocket: Remix 3 ditched React](https://blog.logrocket.com/remix-3-ditched-react/)
- [Fato] Os três modos (declarative, data, framework) continuam suportados na v8. — [InfoQ](https://www.infoq.com/news/2026/08/react-route-v8/)

**TanStack Start**
- [Fato] **TanStack Start 1.0 estável** foi anunciado em **13/10/2026**, com "formal commitment" às APIs. Usa Vite (Rsbuild também é suportado) e Nitro para hosting. RSC é integração opt-in, e a equipe deixou de usar RSC no tanstack.com. Selective SSR por rota, server functions tipadas (`createServerFn`), middleware full-stack. — [TanStack Start 1.0 is Stable](https://tanstack.com/blog/tanstack-start-1-0) (2026-10-13)
- [Fato] Versão `latest` no npm: `@tanstack/react-start` **1.169.3** (2026-10-16). — [npm registry](https://registry.npmjs.org/@tanstack/react-start)
- [Fato] A migração desde a RC remove APIs: `@tanstack/nitro-v2-vite-plugin` sai e entra `nitro()` de `nitro/vite`. `useSession` foi removido, e o guia sugere libs como iron-session. — [Migrate from the Release Candidate](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate)
- [Fato, fonte secundária] O 1.0 exigiria Vite 8. — [Tech Insider](https://tech-insider.org/tanstack-start-1-0-stable-release-2026/) (não confirmado em fonte primária)
- [Fato] Governança: projeto open source independente (Tanner Linsley + mantenedores citados: Manuel Schiller, Florian Pellet, Christopher Horobin, Brenley Dueck, Birk Skyum, Sean Cassiere). É financiado por parceiros: Netlify, Cloudflare, Vercel, Railway, Render, Lovable, CodeRabbit (gold), entre outros. — [TanStack Start 1.0 blog](https://tanstack.com/blog/tanstack-start-1-0)

**Vite (base da SPA e de RR framework mode / TanStack Start)**
- [Fato] O Vite 8 ficou estável em 12/03/2026, com Rolldown como bundler único. O Rolldown 1.0 saiu em 07/05/2026. — [Announcing Vite 8](https://vite.dev/blog/announcing-vite8); [Announcing Rolldown 1.0](https://voidzero.dev/posts/announcing-rolldown-1-0)
- [Fato] Versão `latest`: vite **8.3.4**. — [npm registry](https://registry.npmjs.org/vite)

**React Three Fiber**
- [Fato] `@react-three/fiber` latest **9.8.2** (2026-10-14). A v10 está em alpha/canary (`10.0.0-alpha.6`). — [npm registry](https://registry.npmjs.org/@react-three/fiber)
- [Fato] A R3F v9 pareia com React 19 e a v8 com React 18 (major do R3F precisa casar com o major do React). — [R3F installation docs](https://r3f.docs.pmnd.rs/getting-started/installation)

**Downloads npm (semana 2026-10-12 a 2026-10-18)** — [Fato] [npm downloads API](https://api.npmjs.org/downloads/point/last-week/next)
| Pacote | Downloads/semana |
|---|---|
| vite | 119.005.168 |
| next | 41.069.423 |
| react-router | 33.097.258 |
| @tanstack/react-router | 12.275.215 |
| @tanstack/react-start | 7.193.027 |
| next-intl | 4.342.560 |

**Pesquisas**
- [Fato] State of JS 2025, categoria meta-frameworks: Next.js "keeps on gaining ground and dominating", mas ao mesmo tempo perde satisfação. Fica 39 pontos percentuais atrás do líder de satisfação (Astro). TanStack Start não foi opção oficial (estava em beta) e apareceu com 235 menções write-in e sentimento −0,41. Cerca de 11.411 respostas no bloco de meta-frameworks. — [State of JS 2025: Meta-Frameworks](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/)
- [Fato, fonte secundária] Uso de Next.js no State of JS 2025 ≈ 58,6–59%. — [InfoQ](https://www.infoq.com/news/2026/03/state-of-js-survey-2025/) (2026-03); [State of JS 2025: Libraries](https://2025.stateofjs.com/en-US/libraries/)
- [Fato, fonte secundária] State of React 2025 (3.760 respostas, nov/2025 a jan/2026): Next.js com ~80% de uso entre respondentes. A percepção sobre a Vercel foi notadamente negativa (receio de lock-in, features não pedidas). — [Strapi: State of React 2025 takeaways](https://strapi.io/blog/state-of-react-2025-key-takeaways); [Certificates.dev](https://certificates.dev/blog/breaking-down-state-of-react-2025-results)
- [Fato, fonte secundária] Stack Overflow Developer Survey 2025: React ≈ 44,7% de uso (46,9% entre profissionais). Next.js ≈ 20–21,5%. A admiração caiu: React de 62% para 52%, Next.js de 50% para 45%. — [Pagepro sobre SO 2025](https://pagepro.co/blog/react-tldr/stack-overflow-2025-react-and-next-js-grow-in-use-drop-in-admiration/) (dado de 2025, anterior ao período de interesse)

### Inferences
- [Estimativa] Os downloads de `react-router` misturam os três modos e muito uso legado ou transitivo. Não indicam adoção específica do framework mode. Os de `@tanstack/react-start` (~7,2M/sem) são altos para um framework recém-estável, provavelmente inflados por builders de IA (o post do 1.0 cita o app builder da Netlify, com ">1M" usuários) e por CI.
- [Estimativa] Em maturidade e risco de API, o Next.js está mais maduro, mas o modelo de programação ainda muda: Cache Components vira default no 17 e houve várias ondas de advisories em 2026. O React Router está estável e "chato" (bom sinal). O TanStack Start ainda não tem histórico de 1.x, e a migração RC→1.0 removeu APIs (sessão).
- [Palpite] A tendência de satisfação (State of JS/React) e o sentimento negativo sobre a Vercel não pesam tecnicamente, mas sinalizam que alternativas baseadas em Vite estão ganhando espaço mental.

### Gaps
- Não encontrei os números oficiais de "usage/retention" por framework do State of React 2025 diretamente no site da Devographics. Usei resumos secundários (Strapi).
- Não verifiquei na fonte primária a página de resultados do Stack Overflow 2025 (survey.stackoverflow.co/2025). O survey 2026 não foi pesquisado.
- Downloads de `@react-three/fiber`, `react-i18next` e `@remix-run/react` falharam (rate limit "error code: 1015" na API do npm).

---

## 2. Adequação a um app client-heavy com 3D: SSR/RSC agregam ou atrapalham?

### Takeaway
Para o núcleo do Takt (canvas WebGL, Worker, estado interativo), SSR/RSC não agregam: tudo que importa roda no browser. No Next.js App Router isso vira atrito real. Exige uma fronteira `'use client'` e `next/dynamic` com `ssr:false` (que só pode ser chamado de dentro de um Client Component). Além disso, Client Components ainda são pré-renderizados no servidor, então qualquer acesso a `window`/WebGL no import ou render quebra. Vite SPA não tem esse problema por construção. RR framework mode (`ssr:false`) e TanStack Start (`ssr:false` por rota) oferecem opt-out explícito, com a ressalva de que o root ainda é renderizado em build ou no servidor.

### Cited Findings
- [Fato] No Next.js, "Client Components are prerendered to HTML during `next build`". APIs como `window`, `localStorage` e `navigator` só podem ser acessadas no browser (ex.: dentro de `useEffect`). — [Next.js Static Exports docs](https://nextjs.org/docs/app/guides/static-exports) (lastUpdated 2026-08-09)
- [Fato] A doc oficial do R3F manda adicionar `three` em `transpilePackages` no `next.config.js` (Next ≥ 13.1). Para Vite, "works out of the box". — [R3F installation](https://r3f.docs.pmnd.rs/getting-started/installation)
- [Fato, fonte secundária] O padrão comunitário no App Router é renderizar o `<Canvas>` num Client Component e carregar o componente 3D com `next/dynamic({ ssr: false })`. Esse `ssr:false` precisa estar dentro de um Client Component (wrapper com `'use client'`). Erros típicos: "document is not defined" porque o three.js acessa browser APIs no import; loaders (ex.: OBJLoader) falham ao rodar em SSR. — [Three.js with Next.js Integration Guide (2026)](https://threejsresources.com/frameworks/three-js-nextjs); [three.js forum](https://discourse.threejs.org/t/nextjs-and-threejs-fiber-url-problem/57346) (antigo, ~2023); [hontran.dev R3F tutorial 2026](https://www.hontran.dev/blog/react-three-fiber-tutorial-for-beginners)
- [Fato, fonte secundária] Uma issue do R3F (#3268) com erro no Canvas foi atribuída a versões duplicadas de React, não ao App Router em si. — [pmndrs/react-three-fiber#3268](https://github.com/pmndrs/react-three-fiber/issues/3268)
- [Fato] O Next.js 16.4 empurra Cache Components (`'use cache'`, Partial Prefetching) como modelo recomendado e default no 17. É um modelo centrado em renderização no servidor e cache de UI. — [Next.js 16.4 blog](https://nextjs.org/blog/next-16-4)
- [Fato] O Next.js tem modo SPA/estático (`output: 'export'`). A doc diz que ele permite "starting as a static site or Single-Page Application (SPA)". — [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Fato] RR framework mode com `ssr: false`: não há servidor em runtime, mas o **root route é renderizado em build** para gerar `index.html`, então as rotas precisam ser "SSR-safe" (sem `window` no render inicial). `loader` só vale no root ou em rotas pré-renderizadas. As demais usam `clientLoader`/`clientAction`. — [React Router SPA Mode docs (v8.5.0)](https://reactrouter.com/how-to/spa)
- [Fato] A v8.5.0 trouxe mudanças **unstable** de SPA: hidratar páginas pré-renderizadas a partir de dados de build e servir documentos pré-renderizados quando existem, com fallback SPA nos demais caminhos. — [React Router changelog](https://reactrouter.com/changelog)
- [Fato] TanStack Start, Selective SSR: cada rota aceita `ssr: true | false | 'data-only'` (ou uma função). `defaultSsr` muda o default global. Filhos só podem ficar mais restritivos. Com `ssr:false`, `beforeLoad`, `loader` e componente rodam só no cliente, e o servidor mostra o `pendingComponent`. O `shellComponent` (o `<html>`) sempre é renderizado no servidor. — [TanStack Start Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)
- [Fato] TanStack Start SPA mode: `spa: { enabled: true }` no plugin, gera `/_shell.html` pré-renderizando só o root. Server functions e server routes continuam exigindo servidor. — [TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [Fato] A doc do Vite mostra que Web Workers e assets funcionam nativamente. Para R3F, "works out of the box". — [R3F installation](https://r3f.docs.pmnd.rs/getting-started/installation)

### Inferences
- [Estimativa] Para o Takt, o custo do App Router é sobretudo cognitivo e de disciplina. Toda a árvore do editor ficaria sob `'use client'`, envolta num dynamic `ssr:false`, e as features de servidor (RSC, Server Actions, Cache Components) ficariam sem uso. Na prática seria "uma SPA dentro do Next", pagando a complexidade e a superfície de ataque do servidor Next sem benefício.
- [Estimativa] Uma Vite SPA (React Router declarative/data mode ou TanStack Router) é o encaixe mais direto para canvas, Worker e estado client-side. Não existe passo de SSR que possa quebrar com three.js.
- [Estimativa] RR framework mode com `ssr:false` + `prerender` de algumas rotas (landing) é um meio-termo. SPA para o app, HTML estático para a landing, sem servidor Node em runtime. Ainda assim o root precisa ser SSR-safe, então o Canvas deve ficar atrás de lazy/ClientOnly.
- [Estimativa] TanStack Start com `defaultSsr: false` (ou SPA mode) também serve, mas só faz sentido se o time quiser server functions/SSR no futuro. O Takt já tem backend NestJS, então essas features de servidor seriam redundantes.
- [Palpite] Type-safe routing com search params tipados (TanStack Router) pode ser útil para estado de URL do editor (cenário, seed, painel aberto), mas isso independe de escolher o TanStack *Start*.

### Gaps
- Não encontrei doc oficial atual do pmndrs/R3F especificamente sobre o App Router (além do `transpilePackages`), nem issue oficial aberta "R3F + App Router" em 2026. A orientação de `ssr:false` vem de fontes comunitárias.
- Não medi bundle size nem tempo de build comparando os frameworks para um app R3F.

---

## 3. Proxy `/api` → NestJS: opções, cookies e CSRF

### Takeaway
Em todas as opções, o caminho mais simples e robusto é o mesmo: em dev, o proxy do dev server (Vite `server.proxy` ou `rewrites` do Next). Em produção, um reverse proxy/load balancer na frente (nginx, Cloud Run + HTTPS Load Balancer, Caddy) roteando `/api/*` ao NestJS e `/*` ao front. Assim o cookie HttpOnly fica first-party e same-origin. No Next, `rewrites` para URL externa funciona mas exige servidor Next (não funciona em `output: 'export'`) e coloca o Next no caminho de toda chamada de API. `proxy.ts`/middleware não deve ser o lugar da autorização (lição do CVE-2025-29927).

### Cited Findings
- [Fato] Next.js `rewrites` aceita `destination` em URL externa ("Rewriting to an external URL") e funciona como "URL proxy" que mascara o destino. A ordem de avaliação é headers → redirects → **proxy** → `beforeFiles` → arquivos estáticos/páginas → `afterFiles` → rotas dinâmicas → `fallback`. `has`/`missing` permitem casar por header/cookie/host/query. — [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) (lastUpdated 2026-09-28)
- [Fato] Com `output: 'export'`, ficam sem suporte: **Rewrites, Redirects, Headers, Proxy, Cookies, Route Handlers que dependem de Request, Server Actions, Image Optimization com loader padrão** e rotas dinâmicas sem `generateStaticParams`. — [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Fato] O `server.proxy` do Vite "Configure custom proxy rules for the dev server". Estende `http-proxy-3` e mostra `changeOrigin`, `rewrite`, `ws`, `configure`. A doc avisa: "Exercise caution using `rewriteWsOrigin` as it can leave the proxying open to CSRF attacks". As opções da seção valem só para dev. — [Vite server options](https://vite.dev/config/server-options)
- [Fato] O `@nx/react` 23.3.0 declara `http-proxy-middleware` como peer dependency, usado no proxy de dev dos executores Nx. — [npm registry: @nx/react@23.3.0](https://registry.npmjs.org/@nx/react/23.3.0)
- [Fato] TanStack Start SPA mode documenta regras de hosting nesta ordem: estáticos primeiro, depois repassar `/_serverFn/*` e `/api/*` ao servidor, depois rewrite do resto para `/_shell.html`. — [TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [Fato] RR SPA mode: o host precisa reescrever todas as URLs para `index.html` (ex.: `/* /index.html 200`). — [React Router SPA Mode](https://reactrouter.com/how-to/spa)
- [Fato] React Router teve CVEs de CSRF no framework mode em 2026. **CVE-2026-22030** (POST em document requests, corrigido em 7.12.0) e **CVE-2026-53663** (a checagem de CSRF cobria só POST e não PUT/PATCH/DELETE, baixa severidade, correção ~7.15.1). Esses advisories afetam o servidor do framework mode, e o declarative mode é em geral não afetado. — [CVE-2026-22030 (MITRE)](https://cveawg.mitre.org/api/cve/CVE-2026-22030); [GitLab advisory CVE-2026-53663](https://advisories.gitlab.com/npm/react-router/CVE-2026-53663/)

### Inferences
- [Estimativa] Cookies: com um reverse proxy servindo front e API no **mesmo host** (`app.exemplo.com` e `app.exemplo.com/api`), o cookie de sessão pode ser `HttpOnly; Secure; SameSite=Lax` (ou `Strict`), sem `Domain`, e o browser envia nas chamadas `fetch` same-origin sem CORS. Isso independe do framework.
- [Estimativa] CSRF: `SameSite=Lax/Strict` mitiga boa parte do CSRF cross-site, mas não protege contra ataques same-site (outro subdomínio do mesmo registrable domain). Recomenda-se uma defesa no NestJS (token double-submit/synchronizer ou checagem de `Origin`/`Sec-Fetch-Site`) nos métodos mutáveis. Com Vite SPA, o único servidor que processa mutações é o NestJS, então a superfície de CSRF fica concentrada num lugar só. No Next/RR framework/TanStack Start com servidor, o servidor do framework também vira superfície (Server Actions, actions, server functions), como mostram os CVEs de CSRF do React Router.
- [Estimativa] Next rewrites em produção: toda chamada `/api` passa pelo processo Node do Next (latência extra, um ponto a mais de falha e de vulnerabilidades). Route handlers como proxy manual dão controle (por exemplo, repassar `Set-Cookie`), mas acrescentam código. Para o Takt é preferível manter o roteamento `/api` no load balancer/nginx.
- [Estimativa] Em dev com Vite, `server.proxy['/api'] = { target: 'http://localhost:3000', changeOrigin: true }` mantém o front em `localhost:4200` e o cookie same-origin. Pode ser preciso reescrever o domínio do cookie se o Nest setar `Domain` (http-proxy-3 tem `cookieDomainRewrite`, não confirmado na doc do Vite).

### Gaps
- A doc de rewrites do Next não diz explicitamente se `Set-Cookie` e cabeçalhos hop-by-hop são repassados intactos em rewrites externos, nem dá timeouts ou limites de streaming. Não encontrei fonte oficial.
- `cookieDomainRewrite` não aparece na página do Vite. A suposição vem das opções do http-proxy-3, não verificadas.

---

## 4. i18n (pt-BR/en) e SEO mínimo (landing pública)

### Takeaway
O Next.js tem o ecossistema de i18n com roteamento mais pronto (next-intl, ~4,3M downloads/semana, com `proxy.ts` para negociar locale e segmento `[locale]`). Isso, porém, depende de servidor (proxy) ou de `generateStaticParams` e encaixa melhor em sites de conteúdo. Para um app interativo com uma landing pequena, i18n no cliente (ex.: i18next/react-i18next, FormatJS/react-intl, Lingui) funciona igual em qualquer framework Vite. O SEO mínimo da landing se resolve com pré-renderização estática (RR `prerender`, TanStack prerender, Next static) ou com uma landing separada.

### Cited Findings
- [Fato] next-intl com i18n routing: `defineRouting` (locales, defaultLocale) e `src/proxy.ts` exportando `createMiddleware(routing)` com `matcher` que exclui `/api`, `/_next` etc. O arquivo se chamava `middleware.ts` até o Next 16. Páginas ficam em `app/[locale]/`. Navegação locale-aware via `createNavigation`. Suporta prefixo (`/en/about`) ou domínio. Renderização estática requer `generateStaticParams`. — [next-intl routing setup](https://next-intl.dev/docs/routing/setup)
- [Fato] next-intl latest **4.14.9**, 4.342.560 downloads/semana (12–18/out/2026). — [npm registry](https://registry.npmjs.org/next-intl); [npm downloads API](https://api.npmjs.org/downloads/point/last-week/next-intl)
- [Fato] Next `output: 'export'` não suporta Proxy (logo, não suporta a negociação de locale via proxy do next-intl). — [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Fato] O SPA mode do TanStack Start é "less SEO-friendly" porque crawlers/unfurlers podem não executar JS. A recomendação é pré-renderizar mais rotas quando possível. — [TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [Fato] RR framework mode suporta estratégias SPA, SSR e static (pré-renderização), e SPA mode é descrito como forma especial de pré-renderização. Rotas pré-renderizadas podem ter `loader` em build. — [React Router SPA Mode](https://reactrouter.com/how-to/spa); [React Router modes (v8.3.0, jsdelivr)](https://cdn.jsdelivr.net/npm/react-router@8.3.0/docs/start/modes.md)

### Inferences
- [Estimativa] Para pt-BR/en num app logado, a detecção de idioma pode ser client-side (`navigator.language` + preferência salva no perfil via API), sem i18n routing por URL. Rotas `/pt-BR/...` só valem a pena para páginas públicas indexáveis (landing).
- [Estimativa] Landing com SEO: (a) RR framework mode `prerender: ['/', '/en']` + `ssr:false` para o app; (b) TanStack Start com prerender de rotas; (c) Vite SPA + landing separada (página estática/Astro ou HTML gerado), servida pelo mesmo reverse proxy. Next também resolve, mas a negociação de locale via proxy exige servidor.
- [Palpite] Se no futuro houver muito conteúdo público (docs, blog, cases), um site de conteúdo separado (Astro/Next) costuma ser mais simples do que forçar o app interativo a fazer SSR.

### Gaps
- Não pesquisei a fundo as alternativas de i18n client-side (react-i18next, Lingui, Paraglide) em 2026. Versões e downloads não coletados (rate limit).
- A página do next-intl consultada não documenta detecção por `Accept-Language`/cookie nem o modo "sem i18n routing". Ambos existem em versões anteriores, mas não verifiquei a doc v4 atual.

---

## 5. Suporte no Nx e integração com Vitest e Playwright

### Takeaway
Nx 23.3.0 (07/10/2026) tem plugins oficiais para Next (`@nx/next`, peer `next >=14 <17`), Vite (`@nx/vite`, Vite 5–8), Vitest (`@nx/vitest`, Vitest 3–5), Playwright (`@nx/playwright`) e React (`@nx/react`, que inclui o plugin inferido de React Router framework mode, `@nx/react/router-plugin`). **TanStack Start não tem generator/plugin oficial no Nx**: há um template no org nrwl e integração manual via Vite.

### Cited Findings
- [Fato] Nx latest **23.3.0** (2026-10-07). Nx 23.0.0 foi publicado em 2026-06-16. Os pacotes `@nx/next`, `@nx/vite`, `@nx/vitest`, `@nx/playwright`, `@nx/react` e `@nx/remix` estão todos em 23.3.0 (2026-10-07). — [npm registry: nx](https://registry.npmjs.org/nx); [@nx/next](https://registry.npmjs.org/@nx/next); [@nx/vite](https://registry.npmjs.org/@nx/vite); [@nx/vitest](https://registry.npmjs.org/@nx/vitest); [@nx/playwright](https://registry.npmjs.org/@nx/playwright)
- [Fato] Peer dependencies na 23.3.0: `@nx/next` → `next >=14.0.0 <17.0.0`. `@nx/vite` → `vite ^5 || ^6 || ^7 || ^8`. `@nx/vitest` → `vitest ^3 || ^4 || ^5` e `vite ^5–^8`. `@nx/react` → `react >=18 <20`. — [npm registry: @nx/next@23.3.0](https://registry.npmjs.org/@nx/next/23.3.0); [@nx/vite@23.3.0](https://registry.npmjs.org/@nx/vite/23.3.0); [@nx/vitest@23.3.0](https://registry.npmjs.org/@nx/vitest/23.3.0); [@nx/react@23.3.0](https://registry.npmjs.org/@nx/react/23.3.0)
- [Fato] React Router no Nx: o suporte vem no próprio `@nx/react`, via plugin `@nx/react/router-plugin` em `nx.json`. Ele detecta `react-router.config.*` + `vite.config.*` e infere tasks `build` (cacheado), `dev`, `start` (omitida se `ssr: false`) e `typecheck`. Generator: `nx g @nx/react:app apps/x --routing --use-react-router`. — [Nx: React Router guide](https://nx.dev/docs/technologies/react/guides/react-router); [Nx recipe React Router](https://nx.dev/recipes/react/react-router)
- [Fato, fonte secundária] Uma issue/task de mar/2026 relata que o `reactInitGenerator` adicionava `@nx/react/router-plugin` mesmo em workspaces sem React Router (ex.: TanStack Router). Não confirmei se o fix saiu. — [harbor task nrwl/nx-32814](https://hub.harborframework.com/tasks/abundant/nrwl__nx-32814)
- [Fato] TanStack Start: uma discussão no repo do Nx (jan/2026) pede suporte oficial e afirma que não há generator/template oficial. Existe o template `nrwl/tanstack-start-template` (Nx 23), que é template, não plugin. — [nrwl/nx Discussion #34273](https://github.com/nrwl/nx/discussions/34273); [nrwl/tanstack-start-template](https://github.com/nrwl/tanstack-start-template)
- [Fato, fonte secundária] Um relato de React duplicado com o plugin do Start no Vite foi resolvido removendo `react` de `optimizeDeps.include`. — [TanStack/router PR #5508](https://github.com/TanStack/router/pull/5508)
- [Fato] O pacote `@nx/remix` ainda é publicado (23.3.0). — [npm registry: @nx/remix](https://registry.npmjs.org/@nx/remix)

### Inferences
- [Estimativa] Vitest: Vite SPA, RR framework mode e TanStack Start compartilham o `vite.config`, então o Vitest reaproveita config, aliases e plugins sem duplicação. No Next (Turbopack/SWC), o Vitest precisa de config própria (plugin React + jsdom), e Server Components async não são bem testáveis em unit tests. Isso pesa pouco no Takt, porque o código relevante (engine, stores, componentes client) é TS/React puro.
- [Estimativa] Playwright é agnóstico a framework. `@nx/playwright` com `webServer` apontando para `nx serve`/`preview` funciona em todos. Para testes 3D, a dificuldade é a mesma em qualquer framework (WebGL headless, screenshots, hooks de teste).
- [Estimativa] Ranking de atrito no Nx: Vite SPA (`@nx/react` + `@nx/vite`) ≈ RR framework (`@nx/react` router-plugin) < Next (`@nx/next`, maduro) < TanStack Start (manual/template).

### Gaps
- Não li o release notes do Nx 23 (não apareceu na busca) nem confirmei se o `@nx/react/router-plugin` já suporta oficialmente o React Router **v8** (ESM-only).
- Não verifiquei se `@nx/next` 23.3 já cobre todas as features do Next 16.4 (Turbopack default, Cache Components) sem bugs.

---

## 6. Opções de deploy e complexidade

### Takeaway
O deploy mais simples para o Takt é uma **SPA estática** (Vite, RR `ssr:false` ou Next `output: 'export'`) servida por nginx/Caddy num container ou bucket+CDN, com o mesmo proxy/load balancer roteando `/api` ao NestJS. Next com servidor (`next start`/`standalone`), RR com SSR e TanStack Start com Nitro exigem um runtime Node a mais em produção, com os patches de segurança do framework passando a ser responsabilidade do time.

### Cited Findings
- [Fato] Next static export: gera `out/` com um HTML por rota. Pode ser servido por "any web server that can serve HTML/CSS/JS static assets". A doc traz exemplo de nginx com `try_files`. — [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Fato] RR SPA mode: `react-router build` → deploy de `build/client` em qualquer host estático, com rewrite de todas as rotas para `index.html`. A doc cita um "API-only Mode" experimental para SPA com loaders/actions no servidor. — [React Router SPA Mode](https://reactrouter.com/how-to/spa)
- [Fato] TanStack Start: a equipe deixou de manter adapters próprios e passou a usar Vite + Nitro. Targets citados: Netlify, Cloudflare (Workers), Railway, Render, Vercel. Em SPA mode, basta um CDN para os estáticos, mas server functions exigem servidor. — [TanStack Start 1.0 blog](https://tanstack.com/blog/tanstack-start-1-0); [TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [Fato, fonte secundária] O CVE-2025-29927 afetou sobretudo Next self-hosted com middleware (`next start`/`output: standalone`). Apps na Vercel/Netlify e static exports não foram afetados. — [Wiz vulnerability DB](https://www.wiz.io/pt-br/vulnerability-database/cve/cve-2025-29927)
- [Fato] O Image Optimization do Next em self-hosting depende de `sharp`. O RCE de out/2026 (CVE-2026-96889) atinge Next rodando em Linux glibc. — [Next.js Security Update Oct 14 2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026)

### Inferences
- [Estimativa] Cloud Run (se for o alvo): opção A, um único container nginx com o build estático, e o roteamento `/api` → serviço NestJS feito por um HTTPS Load Balancer com URL map (ou pelo próprio nginx fazendo `proxy_pass` para a URL interna do Nest). Opção B, para Next/RR SSR/Start, um container Node para o front, mais um serviço a escalar, monitorar e patchear.
- [Estimativa] Custo operacional: SPA estática não tem cold start de SSR nem processo de front para patchear contra RCE/DoS de servidor. As correções de segurança de framework passam a importar quase só para dependências client-side.
- [Palpite] Num projeto com time pequeno e foco em simulação/3D, eliminar um runtime de servidor de front tende a valer mais do que qualquer ganho de SSR.

### Gaps
- Não pesquisei guias oficiais de Cloud Run para Next 16 standalone, RR v8 ou TanStack Start/Nitro em 2026. Nem preços ou cold start.

---

## 7. Advisories de segurança recentes e impacto na escolha

### Takeaway
2025–2026 tiveram várias falhas graves no lado servidor dos frameworks React: Next middleware bypass (mar/2025), React2Shell RCE em RSC (dez/2025, CVSS 10), várias ondas de DoS/RCE em 2026 no Next (abr, mai e out/2026, esta com dois RCEs críticos), CSRF/DoS/prototype pollution no RR framework mode (jan–jun/2026) e um XSS refletido crítico no TanStack Start (set/2026). Quase todas exigem o **servidor do framework em execução** (RSC, Server Actions, middleware, server functions, image optimization). Uma SPA estática com API separada não fica exposta à maioria delas, o que é um argumento forte a favor de Vite SPA ou modos `ssr:false`.

### Cited Findings

**Next.js**
- [Fato] **CVE-2025-29927** (mar/2025, info antiga): bypass de autorização no middleware via header `x-middleware-subrequest`. Afeta versões anteriores a 12.3.5, 13.5.9, 14.2.25 e 15.2.3. — [NVD CVE-2025-29927](https://nvd.nist.gov/vuln/detail/cve-2025-29927); [Fastly](https://fastly.com/blog/cve-2025-29927-authorization-bypass-in-next-js)
- [Fato] Mitigação quando não dá para atualizar: bloquear/remover o header no reverse proxy/CDN/WAF. — [Azion guide](https://www.azion.com/en/documentation/products/guides/secure/mitigate-cve-2025-29927-nextjs/)
- [Fato] **CVE-2025-55182 "React2Shell"** (dez/2025, info anterior a 2026): RCE (CVSS 10) em React Server Components (react-server-dom-*), React 19.0.0–19.2.0. Afeta Next App Router 15.x/16.x (16.x antes de 16.0.7). O CVE downstream do Next (CVE-2025-66478) foi rejeitado no NVD como duplicata. Apps são vulneráveis mesmo sem usar server functions explicitamente, bastando suportar RSC. — [Next.js CVE-2025-66478 blog](https://nextjs.org/blog/CVE-2025-66478); [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/); [Bitsight](https://www.bitsight.com/blog/security-alert-cve-2025-66478-cve-2025-55182-react2shell-nextjs-react-server-components-remote)
- [Fato] **CVE-2026-23869** (abr/2026): DoS (CVSS 7.5) em Server Function endpoints do App Router (CPU excessiva). — [GHSA-q4gf-8mx6-v5v3](https://github.com/vercel/next.js/security/advisories/GHSA-q4gf-8mx6-v5v3); [Netlify Apr 2026](https://www.netlify.com/changelog/2026-04-08-react-nextjs-dos-vulnerability/)
- [Fato] **Maio/2026**: release coordenado com 13 advisories (DoS, middleware/proxy bypass, SSRF, cache poisoning, XSS). O DoS de RSC é o CVE-2026-23870. Fixes em 15.5.18 e 16.2.6. — [Vercel changelog May 2026](https://vercel.com/changelog/next-js-may-2026-security-release); [Cloudflare WAF changelog](https://developers.cloudflare.com/changelog/post/2026-05-06-react-nextjs-vulnerabilities/)
- [Fato] O Next mantém um programa de security releases programados, com anúncios prévios em ago e set/2026. — [Next security release program](https://nextjs.org/blog/next-security-release-program); [Upcoming release Sep 2026](https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026)
- [Fato] **14/10/2026** (out-of-band): (1) **GHSA-673q-mjm6-r5xr**, RCE crítico não autenticado em funções `use cache` (Cache Components) que retornam múltiplos typed arrays. Não há workaround, e a orientação é atualizar "even if your application does not have similar functions". (2) **CVE-2026-96889 / GHSA-2464-fhr4-w9xw**, RCE crítico no Image Optimization com SVG (lib upstream `sharp`, Linux glibc). Workaround: `sharp >= 0.35.5`. (3) **GHSA-p3m5-59mp-jv5r**, DoS alto em App Router com Server Actions. Pages Router ou apps sem Server Actions não são afetados. Fixes: **16.4.1** e **15.5.28**. — [Next.js Security Update Oct 14 2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
- [Fato, fonte secundária] O RCE de `use cache` afeta 16.0.0–16.4.0, e não há relato de exploração ativa. — [Daily Security Review](https://dailysecurityreview.com/?p=44596); [SecurityOnline](https://securityonline.info/nextjs-security-update-rce-october-2026/)

**React Router (framework mode)**
- [Fato] Jan/2026: **GHSA-2w69-qvjg-hvjx** (XSS via open redirect em loaders/actions, fix 7.12.0) e **CVE-2026-22030** (CSRF em POST, fix 7.12.0). — [GHSA-2w69-qvjg-hvjx](https://github.com/advisories/GHSA-2w69-qvjg-hvjx); [CVE-2026-22030](https://cveawg.mitre.org/api/cve/CVE-2026-22030)
- [Fato] Jun/2026: **CVE-2026-42342** (DoS via endpoint `__manifest`, High 7.5, fix 7.15.0) e **CVE-2026-53663** (CSRF em PUT/PATCH/DELETE, baixa). — [OSV CVE-2026-42342](https://osv.dev/vulnerability/CVE-2026-42342); [GitLab CVE-2026-53663](https://advisories.gitlab.com/npm/react-router/CVE-2026-53663/)
- [Fato, fonte secundária] Jun/2026: prototype pollution encadeável a RCE no Framework Mode (7.0.0–7.14.1, fix 7.14.2; CVE-2026-40181) e XSS nas APIs RSC unstable (fix 7.13.2). Vêm de mirror de terceiros e não foram verificados na fonte. — resultados agregados de busca; ver [GitLab advisories react-router](https://advisories.gitlab.com/npm/react-router/CVE-2026-42342/)
- [Fato, fonte secundária] O declarative mode (`<BrowserRouter>`) não é afetado pela maioria desses advisories. — agregado a partir das notas dos advisories (ver links acima)

**TanStack Start**
- [Fato] **CVE-2026-102989 / GHSA-qx66-fv34-fjm8** (30/09/2026): XSS refletido crítico (CVSS 9.3 segundo a Appwrite) no tratamento de respostas de server functions. Sem autenticação, um link malicioso faz o app devolver HTML do atacante na própria origem. Afeta a partir de 1.143.12, fix em `@tanstack/react-start` 1.168.60 e `start-server-core` 1.169.39. — [TanStack security update](https://tanstack.com/blog/tanstack-start-security-update-cve-2026-102989); [Netlify changelog Sep 2026](https://www.netlify.com/changelog/2026-09-30-tanstack-start-security-vulnerability/); [Appwrite](https://appwrite.io/blog/post/tanstack-start-server-function-xss)

### Inferences
- [Estimativa] Quase todos os advisories graves listados exigem features de servidor: RSC/Server Actions/`use cache`/Image Optimization/middleware no Next, servidor do framework mode no RR, server functions no Start. Um build estático servido por nginx não roda nenhum desses caminhos. O risco remanescente fica no NestJS e nas dependências client-side.
- [Estimativa] O ritmo de advisories do Next em 2026 (abril, maio, ago/set anunciados, outubro OOB) somado à política de patch só na última minor implica atualizações frequentes e obrigatórias se o Next rodar com servidor. O fato de o Next 16.4 tornar Cache Components default para apps novos e o RCE de out/2026 estar justamente em `use cache` indicam que a superfície de servidor tende a crescer.
- [Estimativa] O CVE-2025-29927 reforça uma regra de design para qualquer escolha: **autorização sempre no NestJS** (guards), nunca só no middleware/proxy do front. O reverse proxy pode ainda remover headers internos (`x-middleware-*`) como defesa em profundidade.
- [Estimativa] O XSS do TanStack Start apareceu duas semanas antes do 1.0. Mostra que server functions são superfície real mesmo em SPA mode, já que o SPA mode do Start ainda expõe `/_serverFn/*`. Para o Takt, que não precisa de server functions, isso é risco sem benefício.

### Gaps
- Não verifiquei nas páginas GHSA originais os CVEs de RR de junho/2026 (prototype pollution → RCE, XSS RSC). Os dados vêm de agregadores.
- Não pesquisei advisories do Vite dev server em 2025–2026 (houve casos de `server.fs` bypass em anos anteriores). Isso afeta só dev, mas vale checar.
- Não verifiquei se os patches de out/2026 do Next exigem atualizar o React separadamente (o advisory upstream é GHSA-xqc2-xf4c-x3h3 no repo do React).

---

### Síntese comparativa (para o redator — tudo aqui é [Estimativa] derivada das seções acima)

| Critério | Next.js App Router | Vite + React SPA (RR declarative/data ou TanStack Router) | RR 8 framework mode (`ssr:false` + prerender) | TanStack Start 1.x |
|---|---|---|---|---|
| Fit 3D/Worker client-heavy | Atrito (`'use client'`, `dynamic ssr:false`, prerender de Client Components) | Ideal | Bom (root SSR-safe em build) | Bom com `ssr:false`/SPA mode |
| Proxy `/api` | rewrites (exige servidor) ou LB | dev proxy + LB/nginx | dev proxy + LB/nginx | dev proxy + LB (mais `/_serverFn`) |
| i18n | next-intl maduro (proxy/`[locale]`) | lib client-side | lib client-side + prerender por locale | lib client-side + prerender |
| SEO landing | Excelente | Fraco sem landing separada/prerender | Bom (prerender) | Bom (prerender/SSR) |
| Nx | `@nx/next` oficial | `@nx/react`+`@nx/vite` oficial | `@nx/react/router-plugin` oficial | Sem plugin oficial (template) |
| Deploy | Node server (ou export com limitações) | Estático | Estático | Nitro/Node (ou SPA + servidor para serverFn) |
| Superfície de segurança server-side | Alta (vários RCE/DoS em 2025–26) | Mínima | Mínima com `ssr:false` (vira servidor se ativar SSR) | Média (server functions) |
| Maturidade/estabilidade | Muito alta, mas o modelo de programação ainda muda | Muito alta | Alta (v8 "boring", major anual) | Nova (1.0 em 13/10/2026) |
