# ADR-0012: Front-end estático com Vite, React e React Three Fiber

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-web-app`, hospedagem |

## Contexto

No Takt, a cena 3D, o editor, o estado e o motor (em Web Worker) rodam no navegador; o servidor só existe para a API. A [pesquisa de escolhas do front-end](../research/escolhas-tecnicas-do-front-end.md) (20/10/2026) concluiu:
- **fato:** quase todas as vulnerabilidades graves de 2025–2026 em frameworks React exigem o servidor do framework em execução: dois RCEs críticos no Next.js em 14/10/2026, React2Shell (CVSS 10) em dezembro de 2025, XSS crítico no TanStack Start em 30/09/2026;
- **fato:** no Next.js, o 3D exige `'use client'` e `ssr:false`, e a exportação estática não suporta rewrites nem proxy;
- **fato:** React Server Components exigem servidor em execução; a geração de HTML no build não exige.

A página pública de apresentação precisa de SEO.

## Decisão

1. **Aplicação estática, sem servidor de front-end em produção:**
   - **Vite 8** + **React 19.3.1** (a versão estável mais recente; fixada no repositório) + **React Router 8** em modo *framework* com `ssr: false`;
   - **páginas públicas pré-renderizadas no build** (`prerender`), com HTML pronto para SEO; o resto da aplicação é servido por um único HTML de *fallback*.
2. **Um proxy reverso único em produção** serve os arquivos estáticos e repassa `/api/*` para a `takt-core-api`, no mesmo site ([ADR-0005](0005-sessao-no-banco-com-cookie.md)). Ele também aplica CSP, HSTS e os demais cabeçalhos de segurança. **No desenvolvimento**, o proxy do Vite faz o mesmo papel.
3. **3D:** React Three Fiber 9 + drei 10 + three, com `WebGLRenderer` (WebGL2) e materiais padrão, sem GLSL próprio, para migrar ao WebGPU quando o R3F 10 estiver estável.
   - Um `InstancedMesh` por tipo de elemento.
   - **Nada que muda a cada quadro passa pelo React:** refs e leitura direta do store dentro de `useFrame`.
   - Grade, encaixe, ocupação de células e rotação de 90° são código do Takt.
4. **Estado:** Zustand 5, em fatias (documento da planta, interface, reprodução). **Dados da API:** TanStack Query 5.
5. **Desfazer e refazer:** pilha própria, com rótulo por ação, limite de 100 (RN-EDT-002) e **um passo por arraste**, gravado ao soltar o ponteiro.
6. **Rascunhos locais:** IndexedDB com idb 8; migração de versão pelo `@takt/plant-schema`; pedido de armazenamento persistente.
   - **Fato:** o Safari apaga os dados do site após 7 dias de uso do navegador sem interação com ele. Por isso, exportar JSON fica sempre visível, e a planta é salva no servidor quando houver conta.
7. **Comunicação com o Worker:** `postMessage` tipado (união discriminada de mensagens). O log de eventos vai em colunas (*typed arrays*) transferidas, sem cópia. Replicações num conjunto de Workers ([ADR-0011](0011-motor-de-simulacao-e-esquema.md)).
8. **Componentes:** Base UI via shadcn/ui + Tailwind CSS v4.
   - A dica é só um rótulo complementar. O "Saiba mais" é um botão que abre um painel não modal ([RN-HLP-002](../product/rules/help.md)). **Fato:** nenhuma das bibliotecas avaliadas mostra dica no toque.
   - A escolha entre **Base UI** e **React Aria** fecha depois de um protótipo do painel, testado com leitor de tela.
9. **i18n:** use-intl, com mensagens ICU e `Intl` nativo. Mensagens com plural têm o caso `=0`, porque o pt-BR trata 0 como singular.
10. **Gráficos:** ECharts 6 (séries temporais, com linha do fim do aquecimento e faixas de intervalo de confiança) e Recharts 3 (indicadores). Todo gráfico tem uma tabela de dados alternativa e números formatados pelo idioma.
11. **Testes:** Vitest + `@react-three/test-renderer` para a cena; Playwright com WebGL por software (SwiftShader) no CI ([ADR-0009](0009-estrategia-de-testes.md)).

## Alternativas consideradas

- **Next.js (App Router):** líder em uso, mas o servidor não traz ganho para o Takt e é onde aparecem as vulnerabilidades graves; a exportação estática não tem proxy.
- **TanStack Start:** a versão 1.0 saiu em 13/10/2026, com uma vulnerabilidade crítica duas semanas antes; sem plugin oficial do Nx.
- **React Router só em modo biblioteca:** mais simples, mas sem pré-renderização das páginas públicas.
- **Babylon.js 9:** editor mais completo e um pacote oficial de acessibilidade, porém integração com React fraca e adoção muito menor.
- **Redux Toolkit, Jotai, MobX:** viáveis; Zustand tem a maior satisfação e é o padrão recomendado pela documentação do R3F. Jotai e MobX acabaram de lançar versões maiores.
- **zundo, Comlink, Dexie:** zundo e Comlink sem versão nova desde 11/2024; Dexie é boa alternativa ao idb, com mais recursos do que o necessário.

## Consequências

**Positivas:**
- Sem servidor de front-end, a maior parte das vulnerabilidades recentes dos frameworks não se aplica.
- Deploy simples: arquivos estáticos e um proxy.
- O modelo de sessão do [ADR-0005](0005-sessao-no-banco-com-cookie.md) continua igual.

**Negativas e custos:**
- O proxy, a CSP e o HSTS passam a ser configuração de infraestrutura, a decidir com a hospedagem.
- Código próprio onde as bibliotecas pequenas estão paradas (desfazer, protocolo do Worker, encaixe na grade, painel "Saiba mais").
- **O R3F 9 aceita React até a versão anterior à 19.4.** Atualizar o React depende do R3F.
- Duas bibliotecas de gráfico.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **XSS** | Ações em nome do usuário | CSP no proxy; React escapa por padrão; nenhum HTML vindo do usuário |
| **Segredo embutido no pacote estático** | Exposição pública | Só variáveis com prefixo público explícito do Vite chegam ao navegador; nenhum segredo no front |
| **Pré-renderização no build vazando dado privado** | Página pública com informação interna | Só páginas públicas são pré-renderizadas, sem chamadas autenticadas no build |
| **Mensagem malformada vinda do Worker** | Estado corrompido | Mensagens tipadas e validadas na fronteira |
| **Dependências pequenas abandonadas** | Vulnerabilidade sem correção | Preferir código próprio testado a pacotes parados ([ADR-0010](0010-qualidade-e-ci.md)) |
| **Rascunho local em computador compartilhado** (laboratório) | Outra pessoa vê a planta | Rascunhos apagados ao sair da conta; planta salva no servidor |

## Conformidade

- Regras de fronteira do Nx: o `takt-web-app` não importa a `takt-core-api`; o `sim-engine` não importa React.
- Versões fixadas (React 19.3.1 e as demais) e atualização manual ([ADR-0010](0010-qualidade-e-ci.md)).
- Teste ponta a ponta no build de produção, com uma simulação real rodando no Worker.
- Teste de acessibilidade das dicas e do painel ([RN-HLP-002](../product/rules/help.md)).
- Teste: as páginas públicas pré-renderizadas não contêm dados de usuário.

## Relacionados

- [ADR-0001](0001-monorepo-nx-e-nomes.md), [ADR-0005](0005-sessao-no-banco-com-cookie.md), [ADR-0008](0008-validacao-de-dados.md), [ADR-0009](0009-estrategia-de-testes.md), [ADR-0011](0011-motor-de-simulacao-e-esquema.md).
- [PDR-0016](../pdr/0016-idiomas.md), [PDR-0018](../pdr/0018-identidade-visual-e-ux.md), [PDR-0021](../pdr/0021-explicacao-em-camadas.md).
- Pesquisa: [Escolhas técnicas do front-end](../research/escolhas-tecnicas-do-front-end.md).

## Em aberto

- Base UI ou React Aria, depois do protótipo do painel.
- Quem é o proxy reverso em produção (nginx, *load balancer*), no tema de hospedagem.
- Confirmar o suporte do plugin do Nx ao React Router 8.
- Exclusões de cobertura para o código que só inicializa o renderizador 3D.
