# ADR-0013: Erros esperados como exceções com código

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 03/11/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api`, `@takt/sim-engine`, `takt-web-app` (casca do Worker), testes do monorepo |

## Contexto

O [ADR-0002](0002-arquitetura-hexagonal-por-contexto.md) deixou em aberto o "formato do `Result` (retorno de erro tipado) × exceções de domínio", e o guia de estilo marca o ponto como pendente (D3, [code-style.md](../architecture/code-style.md#5-erros)). O guia já separa dois tipos de erro: **esperado**, que faz parte do fluxo de negócio e tem um `code` da [tabela de códigos](../product/rules/README.md#códigos-de-erro), e **defeito**, que é bug. O doc vivo [takt-core-api.md](../architecture/takt-core-api.md#erros) mostra hoje o domínio lançando `RealPlantNotPublishableError extends DomainError` com `code`.

Forças em jogo:

- **fato:** o TypeScript não tem exceções tipadas: a proposta de cláusula `throws` foi recusada ([#13219](https://github.com/microsoft/TypeScript/issues/13219), "Declined", 19/04/2023). O tipo de uma função não diz quais erros ela lança; um `Result` diria.
- **fato:** a transação do Prisma "commits when the callback returns and rolls back when it throws" ([Prisma, Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)). Lançar desfaz a transação sem código extra; devolver o erro como valor confirmaria a gravação parcial.
- **fato:** o filtro de exceções global do NestJS traduz erros em respostas num só lugar ([NestJS, Exception filters](https://docs.nestjs.com/exception-filters)).
- **fato:** a API responde com códigos, nunca com frases ([RN-I18-004](../product/rules/i18n.md)); o log registra o código e a mensagem interna, e a pilha de chamadas só para erros inesperados ([ADR-0007](0007-observabilidade-log-canonico-e-tracing.md)).
- **fato:** o [ADR-0009](0009-estrategia-de-testes.md) exige AAA "separado por uma linha em branco entre os blocos" e um único Act. No Vitest, um erro lançado em código síncrono só é verificado embrulhando a chamada numa função (`expect(() => ...).toThrow()`), o que junta Act e Assert; em código assíncrono, `rejects` desembrulha a promessa e o Act fica separado ([Vitest, toThrow](https://vitest.dev/api/expect.html#tothrow)).
- **fato:** o motor roda num Web Worker ([ADR-0011](0011-motor-de-simulacao-e-esquema.md)). Na cópia de dados entre Worker e página, de um `Error` só `name` e `message` são garantidos, e a classe não é copiada ([MDN, structured clone](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)): o `code` precisa ser enviado como dado.
- **fato:** os tetos de segurança do ADR-0011 param a execução com `SIMULATION_LIMIT_EXCEEDED`.

## Decisão

1. **Erro esperado é exceção com `code`, em todo o repositório.** Cada erro esperado é uma classe com um `code` literal da tabela de códigos. No `takt-core-api`, as classes estendem `DomainError` (em `shared/kernel/`); no `@takt/sim-engine`, que não importa a API, uma classe-base própria do motor com o mesmo formato. Não há tipo `Result`. A `message` é interna, para o log; nunca vai para a resposta.
2. **Ninguém captura um erro esperado no meio do caminho**, só nas duas fronteiras que o traduzem:
   - **API:** um único filtro global (registrado com `APP_FILTER` na camada `http`) traduz `code` em status por uma tabela tipada sobre todos os códigos, para que um código novo sem status não compile. A resposta leva só `code`, `details` (no formato declarado para cada código) e `requestId`. Erro sem `code` é defeito: 500 genérico e log com a pilha (ADR-0007).
   - **Worker:** a casca do Worker no `takt-web-app` captura o erro do motor e envia à página `{ code, details }` como dado.
3. **Transações:** o erro lançado dentro da transação sai dela sem ser capturado, e o rollback acontece pelo próprio Prisma. O mecanismo de transação e RLS (D1) mantém essa propriedade.
4. **Motor:** os tetos são verificados no laço principal por contadores; ao passar de um, o motor lança o erro com `SIMULATION_LIMIT_EXCEEDED` uma única vez, sem custo no caminho normal.
5. **Testes:** em código assíncrono, o Act é a chamada e o Assert usa `rejects` (`await expect(promise).rejects.toMatchObject({ code })`). Em código síncrono (entidades e motor), um helper de teste `catchError(fn)` devolve o erro lançado e falha se nada for lançado, para manter o Act separado do Assert:

   ```ts
   const error = catchError(() => plant.publishTo(group));

   expect(error).toMatchObject({ code: 'FORBIDDEN' });
   ```

   O erro é identificado pelo `code`, nunca pela mensagem.

## Alternativas consideradas

- **`Result` próprio em tudo** (recomendação da [pesquisa do guia](../research/guia-de-estilo-de-codigo.md)): o tipo da função mostraria os erros. Perde porque pede código que as exceções não pedem: um adaptador que transforme o erro em rollback na transação, repasse manual em cada caso de uso (`if (!r.ok) return r`) e uma regra de lint para ninguém ignorar um `Result<void>`, que não existe no typescript-eslint (**estimativa:** procurada e não encontrada).
- **Exceção na API e valor no motor:** o argumento era a fronteira do Worker, mas a tradução em dado cabe num só lugar, a casca do Worker. Dois formatos no repositório não compensam (**estimativa**). Só voltaria a valer se a execução interrompida por um teto precisasse devolver resultados parciais grandes (ver "Em aberto").
- **Bibliotecas (neverthrow, Effect):** o domínio não importa nada externo (ADR-0002), e o neverthrow não publica versão desde 02/2025 (**fato:** registro do npm, versão 8.2.0).
- **Substituir o ADR-0009 para aceitar `expect(() => ...).toThrow()`:** troca uma regra aceita por um caso que um helper de poucas linhas resolve.

## Consequências

**Positivas:**
- Um só formato de erro esperado no repositório, no idioma do NestJS; o exemplo de `takt-core-api.md` continua válido.
- Menos código: sem tipo `Result`, sem adaptador de transação, sem regra de lint nova; rollback automático.

**Negativas e custos:**
- O compilador não avisa quem chama que uma função pode lançar `PLAN_LIMIT`: o tipo de `execute` não declara erros (fato do contexto). Quem lê o código descobre pelos testes nomeados por regra, pelas regras e pela tabela de códigos.
- A casca do Worker precisa traduzir o erro em dado; se esquecer, a página recebe só a mensagem.
- O helper `catchError` é código de teste a manter, com seu próprio teste.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| A resposta ou o log expõem detalhe interno ou dado de outro usuário (mensagem, `cause`, erro do Prisma, `details`) | Revela a estrutura do banco ou dados alheios | O filtro responde só com `code`, `details` no formato declarado para cada código e `requestId`; mensagens de erro esperado são frases fixas com no máximo IDs; teste do filtro com um erro de biblioteca |
| Na transação: um erro capturado dentro do callback deixa gravação parcial; um efeito externo (e-mail, notificação) já saiu antes do rollback; o registro de uma tentativa negada é apagado | Dado inconsistente, aviso de ação que não aconteceu, tentativa de acesso que some | Nenhuma captura de erro esperado dentro do callback; efeitos externos só depois do *commit* (**fato:** o rollback desfaz só o banco, [Prisma](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)); falhas vão para o log canônico, fora do banco (ADR-0007); teste de integração do rollback |
| Defeito mapeado por engano para um código esperado | Bug escondido como regra de negócio | Só as classes de erro esperado têm `code`; qualquer outro erro vira 500 e log com a pilha |

Riscos de erro que este ADR não muda e que já têm mitigação: contexto de organização no *pool* de conexões ([ADR-0003](0003-postgresql-prisma-e-rls.md)), enumeração entre organizações ([ADR-0006](0006-autorizacao-por-organizacao.md)), dados pessoais no log ([ADR-0007](0007-observabilidade-log-canonico-e-tracing.md)) e promessas sem `await` (`no-floating-promises`, [code-style.md](../architecture/code-style.md)).

## Conformidade

- Lint: `only-throw-error` e `useUnknownInCatchVariables`, já previstos no guia.
- Tipo: a tabela `code` → status cobre a união de todos os códigos (`satisfies Record<ErrorCode, number>`); um código sem status não compila.
- Testes: do filtro (cada código, erro sem `code`, erro de biblioteca sem vazamento); de integração da transação (rollback após erro esperado); do motor (teto ultrapassado lança `SIMULATION_LIMIT_EXCEEDED`); da casca do Worker (envia `code` à página, que mostra o texto traduzido); do próprio `catchError` (devolve o erro; falha se nada for lançado).
- Revisão: nenhum `try/catch` de erro esperado em caso de uso, controlador ou callback de transação, salvo nas duas fronteiras de tradução; nenhum efeito externo dentro de transação.

## Relacionados

[ADR-0002](0002-arquitetura-hexagonal-por-contexto.md) (este ADR resolve o item em aberto sobre `Result` × exceções; o `Result` previsto em `shared/kernel/` não é criado), [ADR-0003](0003-postgresql-prisma-e-rls.md), [ADR-0006](0006-autorizacao-por-organizacao.md), [ADR-0007](0007-observabilidade-log-canonico-e-tracing.md), [ADR-0009](0009-estrategia-de-testes.md), [ADR-0011](0011-motor-de-simulacao-e-esquema.md); [RN-I18-004](../product/rules/i18n.md); [tabela de códigos de erro](../product/rules/README.md#códigos-de-erro).

## Em aberto

- Se a execução interrompida por um teto deve mostrar os resultados até ali: decisão do caso de uso do marco 1. Se sim, o erro os leva em `details`, ou este ADR é revisto.
- Conferir, quando o Vitest estiver instalado, que `toMatchObject` e `rejects.toMatchObject` verificam o `code` de uma subclasse de `Error` como descrito.
- O mecanismo de transação e RLS (D1) precisa preservar "lançar desfaz".
