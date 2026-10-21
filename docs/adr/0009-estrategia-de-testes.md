# ADR-0009: Estratégia de testes

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | Monorepo inteiro |

## Contexto

O Takt é portfólio: a qualidade dos testes faz parte do que se mostra. O motor precisa ser correto antes de aparecer em aula, as regras de acesso precisam ser provadas e o fundador quer um padrão rígido. **Fato:** cobertura mede linhas executadas, não verificações; sozinha, ela pode ser atingida com testes fracos.

## Decisão

### Ferramentas

- **Vitest** em todos os projetos. Na `takt-core-api`, com o plugin SWC, necessário para os metadados de decoradores do NestJS.
- **Playwright** para testes ponta a ponta no navegador.
- **fast-check** para testes por propriedade.
- **Stryker** para testes de mutação.

### O que testar em cada projeto

| Projeto | Testes |
| --- | --- |
| `@takt/sim-engine` | Casos da literatura com semente fixa e tolerância pelo intervalo de confiança ([simulation.md](../product/simulation.md)); determinismo; **propriedades** sobre plantas geradas aleatoriamente: Lei de Little e conservação (entrou = saiu + em processo + refugo) |
| `@takt/plant-schema` | Um teste por regra estrutural e semântica, com o código esperado; migrações com arquivos de exemplo de cada versão; JSON Schema gerado igual ao versionado |
| `takt-core-api` | **Unitário:** entidades e casos de uso com repositórios em memória. **Integração:** repositórios Prisma, RLS, isolamento, catálogo de políticas, contra PostgreSQL real. **API:** matriz papel × rota, validação, formato de erro, log canônico |
| `takt-web-app` | Lógica do editor e do estado; componentes; **Playwright** para a história do demo, login, importação e exportação e regras com vários usuários ao mesmo tempo. A cena 3D é testada pelo estado que ela desenha, não por pixel |

### Banco nos testes de integração

- PostgreSQL do `docker-compose` de desenvolvimento.
- **Um banco por *worker*** do Vitest, clonado de um banco modelo já migrado (`CREATE DATABASE ... TEMPLATE`), para os testes rodarem em paralelo sem interferir entre si.
- **Cada teste cria os próprios dados**, incluindo a própria organização e e-mails únicos. Nenhum teste depende de dado criado por outro.

### Padrões obrigatórios

- **AAA (Arrange, Act, Assert)**, separado por uma linha em branco entre os blocos, **sem comentários**.
- **Um único "Act" por teste.** Duas ações são dois testes.
- **Sem lógica no teste:** nada de `if` ou laços para decidir o que verificar.
- **O nome do teste cita o ID** da regra (`RN-PLT-002: ...`) ou do caso de uso quando houver.
- ***Factories*** para montar dados; dados falsos com **semente fixa**.
- **TDD obrigatório no motor e nas regras `RN-...`**: o teste é escrito e falha antes do código.

### Metas que bloqueiam o CI

- **Cobertura mínima de 90% de linhas e de ramificações em todos os projetos.**
- **Exclusões só por lista explícita e revisada**: `main.ts`, montagem de módulos do NestJS, código gerado, componentes que apenas desenham a cena 3D. Cada exclusão tem o motivo ao lado.
- **Teste de mutação no motor e no domínio da API: nota mínima de 80%.** Por ser lento, roda à noite e antes de cada release, não a cada pull request.

## Alternativas consideradas

- **Jest:** padrão histórico do NestJS; mais lento e com configuração de TypeScript e ESM mais trabalhosa.
- **Cypress:** ótima depuração, mas WebKit experimental, paralelização entre máquinas paga e suporte limitado a vários usuários num mesmo teste.
- **Testcontainers:** banco descartável por execução, mais isolado; descartado em favor do `docker-compose` já usado no desenvolvimento, com um banco por *worker*.
- **Cobertura só no domínio e no motor:** mais leve; descartada por pedido de um padrão mais rígido.
- **Comentários `// Arrange`, `// Act`, `// Assert`:** descartados; a estrutura com linhas em branco basta.

## Consequências

**Positivas:**
- O motor e o domínio têm prova de que os testes verificam algo (mutação), não só de que o código rodou.
- Regras com vários usuários (instrutor publica, aprendiz vê) testadas de ponta a ponta.

**Negativas e custos:**
- 90% em todos os projetos exige testes também em código de pouca lógica. A lista de exclusões precisa de revisão para não virar atalho.
- Testes de mutação levam tempo e máquina.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Dados reais em testes ou em arquivos de exemplo** | Vazamento de dados pessoais | Só dados falsos gerados; nenhum dump de produção em testes |
| **Credenciais do banco de testes reaproveitadas** em outro ambiente | Acesso indevido | Credenciais de teste exclusivas, só no `.env.example` e no CI |
| **Testes rodando com usuário de banco privilegiado** | O RLS não é testado de verdade | Os testes de integração usam `takt_app`, como a API ([ADR-0003](0003-postgresql-prisma-e-rls.md)) |

## Conformidade

- O CI falha abaixo de 90% de linhas ou de ramificações em qualquer projeto afetado.
- O relatório de mutação noturno falha abaixo de 80% no motor e no domínio da API.
- A skill de revisão confere AAA, um único "Act", ausência de lógica e o ID no nome.
- Uma alteração na lista de exclusões de cobertura exige justificativa no pull request.

## Relacionados

- [ADR-0002](0002-arquitetura-hexagonal-por-contexto.md), [ADR-0003](0003-postgresql-prisma-e-rls.md), [ADR-0006](0006-autorizacao-por-organizacao.md), [ADR-0008](0008-validacao-de-dados.md).
- [PDR-0006](../pdr/0006-escopo-do-mvp.md) (testes do motor antes do motor).

## Em aberto

- Execução do Playwright no CI (quais navegadores em cada pull request).
- Testes de regressão visual da interface, se forem úteis mais adiante.
