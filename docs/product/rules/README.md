# Regras de negócio

> **Resumo.** Regras exatas e testáveis do Takt, com ID estável (`RN-<DOMÍNIO>-NNN`). Cada regra nasce de um PDR e aparece no nome dos testes que a verificam. Os casos de uso citam as regras; não as reescrevem.

Atualizado em 25/11/2026.

## Formato

```markdown
### RN-XXX-000: Título curto

- **Enunciado:** a regra, exata e testável.
- **Origem:** PDR que a gerou.
- **Exemplo:** um caso concreto.
- **Quando violada:** o que o sistema faz e o código de erro.
- **Em aberto:** (opcional) detalhe ainda não decidido.
```

## Convenções

- **ID estável.** Um ID nunca é reutilizado. Uma regra removida fica marcada como *revogada*, com o motivo.
- **Rastreabilidade.** PDR → regra → caso de uso → teste. O nome do teste começa pelo ID: `RN-JSN-003: learner cannot export another user's plant`.
- **Uma regra muda, o PDR não.** Uma mudança de intenção pede um PDR novo; um ajuste de detalhe atualiza só a regra e a data do arquivo.

## Códigos de erro

A API devolve códigos, nunca frases ([RN-I18-004](i18n.md)). Os nomes ficam em inglês porque são código.

| Código | Quando | HTTP |
| --- | --- | --- |
| `NOT_FOUND` | O recurso não existe **ou** o usuário não tem associação com a organização | 404 |
| `FORBIDDEN` | O papel não permite a ação | 403 |
| `PLAN_LIMIT` | A ação ultrapassaria um limite do plano | 403 |
| `PLAN_FEATURE_UNAVAILABLE` | A área ou o módulo não está no plano | 403 |
| `AGE_REQUIREMENT_NOT_MET` | Cadastro sem a declaração de maioridade | 422 |
| `CONFIRMATION_REQUIRED` | Ação sensível enviada sem confirmação explícita | 422 |
| `INVALID_PLANT_FILE` | JSON importado fora do formato; acompanha a lista de erros | 422 |
| `UNSUPPORTED_SCHEMA_VERSION` | JSON de uma versão mais nova que a do sistema | 422 |
| `FILE_TOO_LARGE` | Arquivo importado acima do limite | 413 |
| `INVALID_PLANT` | A planta não pode rodar; acompanha os erros por elemento | 422 |
| `VALIDATION_ERROR` | Corpo, parâmetros ou *query* fora do formato; acompanha a lista `{ path, code }` | 422 |
| `INVALID_GROUP_CODE` | Código de grupo inexistente ou desativado | 404 |
| `SIMULATION_LIMIT_EXCEEDED` | A execução passou de um teto de segurança (elementos, duração ou eventos) | 422 |
| `PLANT_DEADLOCK` | A linha travou numa replicação: peças bloqueadas esperam umas pelas outras em ciclo ([RN-SIM-017](simulation.md)); acompanha o ciclo, o instante e quantas replicações travaram | 422 |

## Códigos de problema da planta

Cada problema de uma planta inválida é `{ elementId?, path, code }` ([ADR-0008](../../adr/0008-validacao-de-dados.md), item 12), devolvido dentro de `INVALID_PLANT` ou `INVALID_PLANT_FILE`. A semântica só é verificada quando a forma passa ([UC-SIM-001](../use-cases/uc-sim-001-validar-planta.md)).

| Código | Quando | Nível |
| --- | --- | --- |
| `REQUIRED` | Campo obrigatório ausente | Forma |
| `INVALID_TYPE` | Tipo errado (texto onde se espera número, número não finito) | Forma |
| `INVALID_VALUE` | Valor fora dos aceitos (tipo de elemento, distribuição, rotação, modo, versão) | Forma |
| `INVALID_FORMAT` | ID fora do padrão (1 a 64 letras ASCII, dígitos, `_` ou `-`) | Forma |
| `OUT_OF_RANGE` | Número abaixo do piso ou acima do teto, ou fracionário onde se espera inteiro | Forma |
| `TOO_MANY_ITEMS` | Lista acima do limite ou texto acima do comprimento | Forma |
| `TOO_FEW_ITEMS` | Lista abaixo do mínimo ou texto vazio | Forma |
| `UNKNOWN_FIELD` | Campo desconhecido | Forma |
| `UNSUPPORTED_SCHEMA_VERSION` | Versão mais nova que a do sistema | Versão |
| `DUPLICATE_ID` | ID repetido no documento | Planta |
| `UNKNOWN_REFERENCE` | Referência a ID que não existe | Planta |
| `INVALID_RANGE` | Distribuição incoerente (mínimo, moda e máximo) | Planta |
| `NO_SOURCE`, `NO_EXIT` | Sem fonte, ou sem expedição nem refugo ([RN-EDT-004](editor.md)) | Planta |
| `INVALID_CONNECTION` | Conexão para o próprio elemento, repetida, chegando a uma fonte ou saindo de uma saída | Planta |
| `UNREACHABLE_ELEMENT` | Elemento solto ([RN-EDT-004](editor.md)) | Planta |
| `OUT_OF_GRID`, `OVERLAP` | Fora da grade ou sobreposto ([RN-EDT-001](editor.md)) | Planta |
| `ROUTING_REQUIRED` | Vários destinos sem regra ([RN-SIM-004](simulation.md)) | Planta |
| `ROUTING_MISMATCH` | Regra que não cobre exatamente as conexões de saída | Planta |
| `PERCENTAGES_NOT_100` | Percentuais que não somam 100 ([RN-SIM-005](simulation.md)) | Planta |
| `QUALITY_ROUTING_REQUIRED` | Estação com defeitos sem regra por qualidade ([RN-SIM-004](simulation.md)) | Planta |
| `INVALID_ROUTING_RULE` | Regra que o elemento não pode ter, ou destino de tipo errado ([RN-SIM-006](simulation.md)) | Planta |
| `OVERRIDE_NOT_APPLICABLE`, `DUPLICATE_OVERRIDE` | Sobreposição para elemento ou parâmetro que não existe, ou repetida | Cenário |
| `INVALID_WARMUP` | Aquecimento fora do regime estável, ou maior ou igual à duração | Cenário |

## Índice

| Arquivo | Domínio | Regras |
| --- | --- | --- |
| [access.md](access.md) | Acesso | `RN-ACE-001` a `006` |
| [plans.md](plans.md) | Planos | `RN-PLA-001` a `006` |
| [groups.md](groups.md) | Grupos | `RN-GRP-001` a `004` |
| [plants.md](plants.md) | Plantas | `RN-PLT-001` a `004` |
| [json.md](json.md) | Importar e exportar JSON | `RN-JSN-001` a `007` |
| [simulation.md](simulation.md) | Simulação | `RN-SIM-001` a `018` |
| [editor.md](editor.md) | Editor 3D | `RN-EDT-001` a `004` |
| [i18n.md](i18n.md) | Idiomas | `RN-I18-001` a `004` |
| [help.md](help.md) | Explicação e ajuda | `RN-HLP-001` a `010` |
