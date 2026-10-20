# ADR-0007: Observabilidade com log canônico, passos e tracing

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api` (`shared/observability`) |

## Contexto

O fundador quer, em cada endpoint, um log iniciado no começo da requisição (hora de início, módulo, parâmetros) com um array de passos preenchido ao longo do controller e do caso de uso, e gravado no final junto com a resposta.

Esse padrão é conhecido como ***canonical log line*** (Stripe) ou ***wide event*** (Honeycomb): **uma linha rica por requisição**. Uma busca traz a história inteira, em vez de dezenas de linhas soltas. O padrão de mercado para tracing distribuído é o **OpenTelemetry**, que não prende a um fornecedor.

## Decisão

1. **Contexto por requisição com `AsyncLocalStorage`** (no NestJS, `nestjs-cls`): guarda `requestId`, hora de início, rota, módulo, usuário, organização, papel, parâmetros já limpos e o array `steps`, sem passar nada de mão em mão.
2. **Interceptor global** abre o contexto no início e, no fim (com sucesso ou com erro), grava **uma linha** em JSON com status, código de erro, duração e passos:

```json
{
  "requestId": "01JB...", "route": "POST /orgs/:orgId/plants/:id/publish",
  "module": "plants", "userId": "u_12", "orgId": "o_7", "role": "learner",
  "status": 403, "errorCode": "FORBIDDEN", "durationMs": 38,
  "steps": [
    { "name": "auth.session",     "ms": 2, "ok": true },
    { "name": "org.membership",   "ms": 3, "ok": true },
    { "name": "authz.permission", "ms": 0, "ok": false, "permission": "plant:publish" }
  ]
}
```

3. **Registro de passos por uma função que mede sozinha:**

```ts
const plant = await this.steps.run('plant.load', () => this.plants.findById(id));
```

   Ela anota nome, duração, sucesso ou erro e atributos opcionais.
4. **O mesmo `steps.run` abre um *span* do OpenTelemetry.** Uma chamada gera a linha de log e o *trace*.
5. **O domínio continua limpo:** os casos de uso recebem a porta `StepRecorder`. A implementação com `AsyncLocalStorage` e OpenTelemetry fica em `shared/observability`; nos testes, uma versão que não faz nada.
6. **Passos automáticos** no guard de autorização (autenticação, organização, permissão, plano) e nos repositórios. **Passos manuais** só nas decisões de negócio.
7. **Logs em JSON com pino, escritos no console (stdout).** Quem coleta e para onde vão depende da hospedagem. Se ela for o GCP (observação do fundador, não decidida), o Cloud Run já lê JSON do stdout como log estruturado; basta usar os campos `severity` e de *trace* do Cloud Logging para ligar cada log ao seu *trace*.
8. **Em desenvolvimento:** Jaeger (ou Grafana) local no `docker-compose` para visualizar os *traces*.

### Cuidados obrigatórios

- **Parâmetros por lista de permitidos:** só campos declarados entram no log. Nunca senha, token, cookie nem e-mail (LGPD).
- **Conteúdo grande não entra:** o JSON da planta vira `id` e tamanho em bytes.
- **Limite de 50 passos por requisição**, com a marca `stepsTruncated`.
- **O erro registra o código** (`PLAN_LIMIT`), o mesmo que a API devolve, e a mensagem interna; a pilha de chamadas só para erros inesperados.

## Alternativas consideradas

- **Logs soltos (`logger.info` em cada ponto):** difícil reconstruir uma requisição.
- **Só OpenTelemetry, sem log canônico:** exige ferramenta visual para qualquer investigação.
- **Só log canônico, sem tracing:** perde a cascata de tempos e a propagação para serviços futuros (`takt-sim-worker`).
- **Ferramenta proprietária de APM:** prende a um fornecedor.

## Consequências

**Positivas:**
- Uma linha conta a história completa de cada requisição, incluindo por que uma autorização falhou.
- Pronto para vários serviços: o `requestId` e o *trace* atravessam as fronteiras.

**Negativas e custos:**
- O `AsyncLocalStorage` tem um pequeno custo por requisição. **Estimativa:** desprezível no MVP.
- Disciplina para manter a lista de campos permitidos.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Dados pessoais ou segredos no log** (senha, token, cookie, e-mail) | Vazamento e problema com a LGPD | Lista de campos permitidos; cabeçalhos `Cookie` e `Authorization` nunca registrados; teste que procura esses valores no log |
| **Injeção de log** (texto do usuário forjando linhas) | Logs enganosos | Log estruturado em JSON, que escapa os valores |
| **Volume de log como ataque** | Custo e perda de logs | Limite de 50 passos; nenhum corpo de requisição inteiro no log |
| **Cabeçalho de *trace* vindo de fora** | Manipulação de amostragem e correlação | Aceitar o contexto de *trace* só de origens confiáveis (o próprio proxy) |
| **Acesso indevido aos logs** | Exposição de IDs e comportamento de usuários | Acesso restrito na hospedagem e retenção definida (em aberto) |

## Conformidade

- Teste: toda requisição gera exatamente uma linha canônica, com sucesso ou erro.
- Teste: uma requisição de login com senha não grava a senha nem o e-mail no log.
- Teste: um erro de autorização aparece como passo com `ok: false` e com o código.

## Relacionados

- [ADR-0002](0002-arquitetura-hexagonal-por-contexto.md), [ADR-0006](0006-autorizacao-por-organizacao.md).
- Regra: `RN-I18-004` (erros como códigos).

## Em aberto

- Coleta de logs e destino dos *traces* em produção (tema de hospedagem).
- Taxa de amostragem de *traces* em produção.
- Observabilidade do `takt-web-app`.
