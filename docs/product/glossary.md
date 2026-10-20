# Glossário

> **Resumo.** Termos do Takt em português, o equivalente em inglês (interface) e o nome usado no código. O código é sempre em inglês; esta tabela é a ponte e a fonte para a internacionalização.

Atualizado em 20/10/2026.

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
| Cenário | Scenario | `scenario` |
| Replicação | Replication | `replication` |
| Semente | Seed | `seed` |
| Log de eventos | Event log | `eventLog` |
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
| Tempo médio entre falhas | MTBF | `mtbfMin` |
| Tempo médio de reparo | MTTR | `mttrMin` |
| Taxa de defeitos | Defect rate | `defectRate` |
| Intervalo de confiança | Confidence interval | `confidenceInterval` |
