# ADR-0001: Monorepo com Nx e nomes dos projetos

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | Repositório inteiro |

## Contexto

O Takt tem um front-end web, uma API e código compartilhado pelos dois: o esquema da planta (usado pelo editor, pela API ao validar importações e pelo motor) e o motor de simulação (que roda no navegador e, no futuro, pode rodar num serviço do servidor). Manter isso em repositórios separados obrigaria a publicar e versionar pacotes internos a cada mudança.

O fundador já usou Nx no projeto `cliniccontrol`. **Estimativa:** Nx e Turborepo são as duas ferramentas de monorepo JavaScript mais usadas; o Nx tem mais recursos (geradores, grafo de dependências, regra de fronteiras entre projetos).

## Decisão

1. **Um monorepo gerenciado pelo Nx.**
2. **Nomes que dizem o que cada projeto é:**

```
apps/
  takt-web-app/       Vite + React + React Router (estático): interface, cena 3D, editor (ADR-0012)
  takt-core-api/      NestJS: núcleo de negócio (identidade, organizações, papéis,
                      planos, grupos, registro de plantas, auditoria)
libs/
  plant-schema/       @takt/plant-schema: tipos, validação (Zod) e migrações do JSON da planta
  sim-engine/         @takt/sim-engine: motor de simulação de eventos discretos, puro
```

3. **"core" no nome da API** porque serviços futuros terão nome próprio (por exemplo, `takt-sim-worker` para simulações pesadas no servidor e `takt-notifier` para e-mails).
4. **Apps com prefixo `takt-`** (claro em logs, contêineres e painéis). **Libs com escopo de pacote `@takt/`**, sem prefixo na pasta.
5. **Tags do Nx** marcam o tipo de cada projeto (`type:app`, `type:lib`, `scope:web`, `scope:api`, `scope:shared`), para a regra de fronteiras.
6. **Node.js na LTS ativa: 24** (24.22.0 em 20/10/2026, com suporte até abril de 2028), fixado no repositório (`.nvmrc` e `engines`). A troca para a próxima LTS é uma decisão registrada à parte.
7. **pnpm na versão estável mais recente: 12** (12.14.0 em 20/10/2026), fixado no campo `packageManager` do `package.json`.

## Alternativas consideradas

- **pnpm workspaces + Turborepo:** mais simples e com menos "mágica"; descartado porque o Nx já é conhecido pelo fundador e traz a regra de fronteiras entre projetos pronta.
- **Repositórios separados:** descartado pelo custo de versionar o esquema e o motor entre eles.
- **Nomes genéricos (`web`, `api`):** não dizem o que o serviço faz e ficam ambíguos quando surgirem outros serviços.

## Consequências

**Positivas:**
- Uma mudança no esquema da planta aparece na hora para o front, a API e o motor, num único commit.
- O Nx só roda testes e build do que foi afetado por uma mudança.
- A regra `@nx/enforce-module-boundaries` impede, por exemplo, que o `sim-engine` importe código do front.

**Negativas e custos:**
- O Nx tem curva de aprendizado e configuração própria; atualizações de versão exigem migrações (`nx migrate`).
- Mais configuração inicial do que um único projeto.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Dependência maliciosa ou comprometida** (cadeia de suprimentos). **Fato:** em agosto de 2025, versões maliciosas de pacotes do próprio Nx foram publicadas no npm e roubavam credenciais | Roubo de tokens, chaves SSH e segredos da máquina e do CI | Versões exatas no lockfile; `pnpm install --frozen-lockfile` no CI; scripts de instalação de dependências bloqueados por padrão (o pnpm só roda os da lista `onlyBuiltDependencies`); idade mínima de publicação antes de aceitar uma versão nova (configuração do pnpm); revisão de dependências e alertas automáticos no GitHub |
| **Segredo commitado** | Credenciais expostas no histórico, mesmo em repositório privado | `.env` no `.gitignore`, só `.env.example` versionado; varredura de segredos no GitHub e num hook de pré-commit |
| **Cache remoto do Nx envenenado** | Build com artefato adulterado | Não usar cache remoto no MVP; se usar no futuro, só com escrita restrita ao CI |
| **Fronteira violada** (o motor ou o front importando código da API) | Código de servidor ou segredo indo parar no navegador | `@nx/enforce-module-boundaries` no lint; variáveis de ambiente do front só com prefixo público explícito |

## Conformidade

- `@nx/enforce-module-boundaries` no lint, com as regras:
  - `scope:shared` não depende de `scope:web` nem de `scope:api`;
  - `sim-engine` não depende de nenhuma biblioteca de interface (React, Three.js) nem do DOM;
  - apps não dependem de apps.
- O CI roda `nx affected` para lint, typecheck, test e build.

## Relacionados

- [ADR-0002](0002-arquitetura-hexagonal-por-contexto.md): arquitetura interna da `takt-core-api`.
- [PDR-0008](../pdr/0008-simulacao-com-reproducao.md): motor puro e cena que só reproduz.

## Em aberto

