# Regras de planos

> **Resumo.** O papel diz quem pode; o plano diz o que a organização contratou. Toda ação checa os dois. O plano limita áreas, módulos e número de plantas. No MVP existe só o plano gratuito.

Atualizado em 20/10/2026 · Origem: [PDR-0010](../../pdr/0010-papel-diferente-de-plano.md), [PDR-0004](../../pdr/0004-areas-capacitar-e-analisar.md), [PDR-0005](../../pdr/0005-modulos-de-engenharia.md).

### RN-PLA-001: Um plano ativo por organização

- **Enunciado:** toda organização tem exatamente um plano ativo. Ao ser criada, recebe o plano gratuito.
- **Origem:** PDR-0010.
- **Exemplo:** a organização pessoal de Bruno nasce no gratuito.
- **Quando violada:** é um invariante; um teste garante que nenhuma organização fica sem plano ou com dois.

### RN-PLA-002: Ação exige papel e plano

- **Enunciado:** uma ação só acontece se o papel do usuário permitir **e** o plano da organização incluir o recurso. A permissão do papel é checada primeiro.
- **Origem:** PDR-0010.
- **Exemplo:** um aprendiz tenta publicar uma planta e recebe `FORBIDDEN`, mesmo que o plano inclua a publicação.
- **Quando violada:** `FORBIDDEN` (papel) ou `PLAN_FEATURE_UNAVAILABLE` / `PLAN_LIMIT` (plano).

### RN-PLA-003: Limite de plantas

- **Enunciado:** o limite de plantas do plano é checado ao **criar**, **copiar** e **importar** uma planta. Plantas didáticas e reais têm limites separados.
- **Origem:** PDR-0010.
- **Exemplo:** com o limite de 10 plantas didáticas atingido, importar um JSON é recusado.
- **Quando violada:** `PLAN_LIMIT`.
- **Plano gratuito (valores genéricos, em configuração, não fixos no código):**

  | Limite | Valor |
  | --- | --- |
  | Plantas didáticas por organização | 10 |
  | Plantas reais | 0 |
  | Grupos | 3 |
  | Membros por organização | 50 |
  | Plantas próprias por aprendiz | 5, fora do limite da organização |

### RN-PLA-004: Erro de limite informa qual limite

- **Enunciado:** a resposta `PLAN_LIMIT` informa qual limite foi atingido, o valor atual e o máximo, para a interface mostrar "fazer upgrade".
- **Origem:** PDR-0010.
- **Exemplo:** `{ "code": "PLAN_LIMIT", "limit": "didacticPlants", "current": 10, "max": 10 }`.
- **Quando violada:** não se aplica (formato de resposta).

### RN-PLA-005: Área não contratada

- **Enunciado:** uma área fora do plano aparece no menu como bloqueada ou "em breve" e não pode ser usada.
- **Origem:** PDR-0004.
- **Exemplo:** no MVP, Analisar e Missões aparecem como "em breve" para todos.
- **Quando violada:** `PLAN_FEATURE_UNAVAILABLE`.

### RN-PLA-006: Módulo não contratado

- **Enunciado:** os elementos de um módulo fora do plano não aparecem na paleta.
- **Origem:** PDR-0005.
- **Exemplo:** sem o módulo Estoque, o elemento almoxarifado não aparece.
- **Quando violada:** `PLAN_FEATURE_UNAVAILABLE`.
- **Importação:** uma planta com elementos de um módulo não contratado é recusada, e a resposta lista os módulos que faltam.
