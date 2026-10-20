# Modelo da planta

> **Resumo.** A planta é um documento JSON versionado e portátil: descreve zonas, elementos, conexões, regras de roteamento e cenários, sem dados de organização. Organização, dono, tipo e origem ficam no registro do servidor. O esquema acerta já o que é caro de migrar e deixa para migrações o que é barato.

Atualizado em 20/10/2026 · Decisões: [PDR-0005](../pdr/0005-modulos-de-engenharia.md), [PDR-0006](../pdr/0006-escopo-do-mvp.md), [PDR-0012](../pdr/0012-tipo-de-planta-e-copia.md), [PDR-0014](../pdr/0014-roteamento-definido-pelo-usuario.md).

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

Exemplo ilustrativo, não um esquema final. Nomes em inglês porque são código.

```json
{
  "schemaVersion": 1,
  "id": "plant_01",
  "name": "Linha exemplo",
  "grid": { "cols": 20, "rows": 12 },
  "zones": [{ "id": "z1", "name": "Linha 1" }],
  "elements": [
    { "id": "src1", "type": "production.source", "zoneId": "z1", "pos": [1, 5], "rot": 0,
      "params": { "interarrival": { "dist": "exponential", "meanSec": 30 } } },
    { "id": "m1", "type": "production.station", "zoneId": "z1", "pos": [5, 5], "rot": 0,
      "params": {
        "cycle": { "dist": "triangular", "minSec": 20, "modeSec": 25, "maxSec": 35 },
        "defectRate": 0.02,
        "failure": { "mtbfMin": 240, "mttrMin": 15 }
      },
      "routing": { "rule": "byQuality", "good": "b1", "defective": "rw1" } },
    { "id": "rw1", "type": "production.station", "zoneId": "z1", "pos": [5, 8], "rot": 90,
      "params": { "cycle": { "dist": "fixed", "sec": 40 }, "defectRate": 0 } },
    { "id": "b1", "type": "production.buffer", "zoneId": "z1", "pos": [9, 5], "rot": 0,
      "params": { "capacity": 10 } },
    { "id": "snk1", "type": "production.sink", "zoneId": "z1", "pos": [13, 5], "rot": 0, "params": {} },
    { "id": "scr1", "type": "production.scrap", "zoneId": "z1", "pos": [9, 8], "rot": 0, "params": {} }
  ],
  "connections": [
    { "id": "c1", "from": "src1", "to": "m1", "kind": "direct" },
    { "id": "c2", "from": "m1", "to": "b1", "kind": "direct" },
    { "id": "c3", "from": "m1", "to": "rw1", "kind": "direct" },
    { "id": "c4", "from": "rw1", "to": "m1", "kind": "direct" },
    { "id": "c5", "from": "b1", "to": "snk1", "kind": "direct" }
  ],
  "settings": { "reworkLimit": 3 },
  "scenarios": [
    { "id": "base", "name": "Atual", "run": { "durationH": 8, "replications": 30, "seed": 42 }, "overrides": {} }
  ]
}
```

## Regras de projeto

- **Versão e migrações:** `schemaVersion` com migrações automáticas, para plantas antigas continuarem abrindo ([RN-JSN-005](rules/json.md)).
- **Unidade no nome do campo:** `meanSec`, `mtbfMin`.
- **Variabilidade como objeto:** `{ "dist": ..., parâmetros }`, com as distribuições fixa, exponencial, normal truncada e triangular.
- **Tipo com módulo:** `production.station`, depois `inventory.warehouse`, `maintenance.crew`.
- **Cenário como sobreposição:** `overrides` troca valores sobre a planta base, sem duplicá-la.
- **Posição separada do comportamento:** `pos` e `rot` servem ao 3D; o motor usa elementos, conexões, parâmetros e regras.
- **Independente de idioma:** ponto decimal, unidades fixas ([RN-I18-003](rules/i18n.md)).
- **Validação na entrada** de todo arquivo importado.

**Em aberto (arquitetura):** onde fica a regra de roteamento (no elemento, como acima, ou na conexão) e o formato final do esquema.
