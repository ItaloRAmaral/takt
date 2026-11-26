# Modelo da planta

> **Resumo.** A planta é um documento JSON versionado e portátil: descreve zonas, elementos, conexões, regras de roteamento e cenários, sem dados de organização. Organização, dono, tipo e origem ficam no registro do servidor. O esquema acerta já o que é caro de migrar e deixa para migrações o que é barato.

Atualizado em 25/11/2026 · Decisões: [PDR-0005](../pdr/0005-modulos-de-engenharia.md), [PDR-0006](../pdr/0006-escopo-do-mvp.md), [PDR-0012](../pdr/0012-tipo-de-planta-e-copia.md), [PDR-0014](../pdr/0014-roteamento-definido-pelo-usuario.md), [PDR-0022](../pdr/0022-modelo-de-fluxo-da-planta.md).

## Documento × registro

| Documento (JSON portátil) | Registro (servidor) |
| --- | --- |
| Versão do esquema, nome, zonas, elementos, conexões, cenários | Organização, dono, tipo (didática ou real), grupos em que está publicada, origem ("copiada de"), datas |
| Vai junto na exportação | Nunca sai na exportação |

## Critério de "base sólida"

| Caro de migrar: entra já | Barato de migrar: fica para depois |
| --- | --- |
| IDs estáveis | Produtos e roteiros (v1 → v2: tudo vira o "produto padrão") |
| Zonas | Turnos e calendários |
| Tipo de conexão | Custos |
| Módulo no tipo do elemento | |
| Variabilidade como objeto | |
| Regras de roteamento na saída | |

## Forma do documento

Exemplo válido pela versão 1 do esquema ([plano](../plans/2026-11-25-esquema-da-planta-v1.md); a referência completa fica em `docs/architecture/plant-schema.md`). Nomes em inglês porque são código. Todo tempo de elemento em segundos. O retrabalho volta ao fluxo depois da estação (rw1 → b1): um retrabalho que volta para a própria estação de origem pode travar a linha com bloqueio ([RN-SIM-017](rules/simulation.md)).

```json
{
  "schemaVersion": 1,
  "id": "plant_01",
  "name": "Linha exemplo",
  "grid": { "cols": 20, "rows": 12 },
  "zones": [{ "id": "z1", "name": "Linha 1" }],
  "elements": [
    { "id": "src1", "type": "production.source", "zoneId": "z1", "pos": [1, 5], "rotDeg": 0, "size": [1, 1],
      "params": { "interarrival": { "dist": "exponential", "meanSec": 30 }, "queueCapacity": 20 },
      "routing": null },
    { "id": "m1", "type": "production.station", "zoneId": "z1", "pos": [5, 5], "rotDeg": 0, "size": [1, 1],
      "params": {
        "cycle": { "dist": "triangular", "minSec": 20, "modeSec": 25, "maxSec": 35 },
        "idealCycleSec": 25,
        "defectRate": 0.02,
        "failure": {
          "timeToFailure": { "dist": "exponential", "meanSec": 14400 },
          "repairTime": { "dist": "exponential", "meanSec": 900 }
        }
      },
      "routing": { "rule": "byQuality", "good": "b1", "rework": "rw1", "scrap": "scr1" } },
    { "id": "rw1", "type": "production.station", "zoneId": "z1", "pos": [5, 8], "rotDeg": 90, "size": [1, 1],
      "params": { "cycle": { "dist": "fixed", "valueSec": 40 }, "idealCycleSec": 40, "defectRate": 0, "failure": null },
      "routing": null },
    { "id": "b1", "type": "production.buffer", "zoneId": "z1", "pos": [9, 5], "rotDeg": 0, "size": [1, 1],
      "params": { "capacity": 10 }, "routing": null },
    { "id": "snk1", "type": "production.sink", "zoneId": "z1", "pos": [13, 5], "rotDeg": 0, "size": [1, 1], "params": {} },
    { "id": "scr1", "type": "production.scrap", "zoneId": "z1", "pos": [9, 8], "rotDeg": 0, "size": [1, 1], "params": {} }
  ],
  "connections": [
    { "id": "c1", "from": "src1", "to": "m1", "kind": "direct" },
    { "id": "c2", "from": "m1", "to": "b1", "kind": "direct" },
    { "id": "c3", "from": "m1", "to": "rw1", "kind": "direct" },
    { "id": "c4", "from": "m1", "to": "scr1", "kind": "direct" },
    { "id": "c5", "from": "rw1", "to": "b1", "kind": "direct" },
    { "id": "c6", "from": "b1", "to": "snk1", "kind": "direct" }
  ],
  "settings": { "reworkLimit": 2 },
  "scenarios": [
    { "id": "base", "name": "Atual", "mode": "shift", "durationH": 8, "replicationCount": 30, "seed": 42,
      "warmupMin": null, "overrides": [] },
    { "id": "faster", "name": "M1 mais rápida", "mode": "shift", "durationH": 8, "replicationCount": 30, "seed": 42,
      "warmupMin": null,
      "overrides": [{ "elementId": "m1", "param": "cycle", "value": { "dist": "fixed", "valueSec": 22 } }] }
  ]
}
```

## Regras de projeto

- **Versão e migrações:** `schemaVersion` com migrações automáticas, para plantas antigas continuarem abrindo ([RN-JSN-005](rules/json.md)).
- **Unidade no nome do campo:** `meanSec`, `mtbfMin`.
- **Variabilidade como objeto:** `{ "dist": ..., parâmetros }`, com as distribuições fixa, exponencial, normal truncada e triangular, também no tempo até a falha e no reparo.
- **Todo valor escrito:** o documento não depende de padrões implícitos; os padrões só servem ao editor ([RN-EDT-003](rules/editor.md)).
- **Regra de roteamento na saída do elemento** (`routing`), só para destinos ligados por conexão ([PDR-0022](../pdr/0022-modelo-de-fluxo-da-planta.md)).
- **Tipo com módulo:** `production.station`, depois `inventory.warehouse`, `maintenance.crew`.
- **Cenário como sobreposição:** `overrides` troca valores sobre a planta base, sem duplicá-la.
- **Posição separada do comportamento:** `pos` e `rotDeg` servem ao 3D; o motor usa elementos, conexões, parâmetros e regras.
- **Independente de idioma:** ponto decimal, unidades fixas ([RN-I18-003](rules/i18n.md)).
- **Validação na entrada** de todo arquivo importado.

**Decidido em 25/11/2026:** a regra de roteamento fica no elemento, e o formato da versão 1 é o do exemplo acima ([plano do esquema v1](../plans/2026-11-25-esquema-da-planta-v1.md)).
