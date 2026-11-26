# Glossário

> **Resumo.** Termos do Takt em português, o equivalente em inglês (interface) e o nome usado no código. O código é sempre em inglês; esta tabela é a ponte e a fonte para a internacionalização.

Atualizado em 26/11/2026.

## Produto e acesso

| Português | Inglês (interface) | Código |
| --- | --- | --- |
| Organização | Organization | `organization` |
| Organização pessoal | Personal workspace | `personalOrganization` |
| Associação | Membership | `membership` |
| Papel | Role | `role` |
| Administrador | Admin | `admin` |
| Instrutor | Instructor | `instructor` |
| Aprendiz | Learner | `learner` |
| Analista | Analyst | `analyst` |
| Permissão | Permission | `permission` (`resource:action`) |
| Plano | Plan | `plan` |
| Assinatura | Subscription | `subscription` |
| Grupo | Group | `group` |
| Código do grupo | Join code | `joinCode` |
| Auditoria | Audit log | `auditLog` |
| Capacitar | Train | `training` |
| Analisar | Analyze | `analysis` |
| Missão | Mission | `mission` |

## Planta e simulação

| Português | Inglês (interface) | Código |
| --- | --- | --- |
| Planta | Plant | `plant` |
| Planta didática | Training plant | `kind: "didactic"` |
| Planta real | Real plant | `kind: "real"` |
| Zona (linha) | Zone (line) | `zone` |
| Elemento | Element | `element` |
| Fonte | Source | `production.source` |
| Estação | Station | `production.station` |
| Esteira | Conveyor | `production.conveyor` |
| Buffer (estoque intermediário) | Buffer | `production.buffer` |
| Expedição | Sink | `production.sink` |
| Refugo | Scrap | `production.scrap` |
| Conexão | Connection | `connection` |
| Regra de roteamento | Routing rule | `routing` |
| Por qualidade · por percentual · fila mais curta | By quality · by percentage · shortest queue | `byQuality` · `byPercentage` · `shortestQueue` |
| Retrabalho | Rework | `rework` |
| Ocupada · bloqueada · faminta (estado da estação) | Busy · blocked · starved | `busy` · `blocked` · `starved` (`StationStatus`) |
| Linha travada | Deadlock | `PLANT_DEADLOCK` (código) |
| Fila da fonte | Source queue | `queueCapacity` (capacidade) |
| Cenário | Scenario | `scenario` |
| Replicação | Replication | `replication` |
| Semente | Seed | `seed` |
| Sequência de números aleatórios | Random stream | `RandomStream` (estado); número da sequência: `streamIndex` |
| Início da sequência | Stream start | `StreamStart` |
| Subsequência (uma por replicação) | Substream | *substream* (só em comentários e docs; no código é a replicação) |
| Chave da sequência | Stream key | `key`, no formato `<id do elemento>:<propósito>` |
| Variabilidade (tempo fixo ou distribuição) | Variability | `Variability` (tipo interno do motor; `kind`) |
| Log de eventos | Event log | `eventLog`; no motor, `log` do resultado da replicação (`LogEvent`) |
| Série por intervalo (fatia de 1 minuto) | Time series (slice) | `series` (`SeriesSlice`) |
| Estado final | Final state | `finalState` |
| Módulo | Module | `module` (`production`, `inventory`, `planning`, `maintenance`, `quality`) |

## Indicadores

| Português | Inglês | Código |
| --- | --- | --- |
| Vazão | Throughput | `throughput` |
| Estoque em processo | WIP | `wip` |
| Lead time | Lead time | `leadTime` |
| Utilização | Utilization | `utilization` |
| OEE (disponibilidade, desempenho, qualidade) | OEE (availability, performance, quality) | `oee` |
| Gargalo | Bottleneck | `bottleneck` |
| Tempo até a falha (média: MTBF, tempo de funcionamento) | Time to failure (MTBF) | `timeToFailure` |
| Tempo de reparo (média: MTTR) | Repair time (MTTR) | `repairTime` |
| Pedidos não atendidos | Lost arrivals | `lostArrivalCount` |
| Ritmo ideal (tempo de ciclo ideal) | Ideal cycle time | `idealCycleSec` |
| Taxa de defeitos | Defect rate | `defectRate` |
| Intervalo de confiança | Confidence interval | `confidenceInterval` |
