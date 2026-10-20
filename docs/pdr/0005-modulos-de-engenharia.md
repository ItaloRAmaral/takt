# PDR-0005: Módulos de engenharia e ordem

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O fundador queria ensinar gargalo, filas, OEE, estoque, PCP, qualidade e manutenção. Os três primeiros saem dos mesmos elementos; os outros são modelos diferentes. **Estimativa:** cada módulo novo soma de 2 a 4 semanas (motor, 3D, indicadores e conteúdo).

## Decisão

1. Os módulos de engenharia ficam **dentro da planta**: elementos na paleta e abas de indicadores. Não aparecem no menu.
2. **Ordem:** Produção (MVP) → Estoque + PCP → Manutenção → Qualidade.
3. O tipo de cada elemento carrega o módulo (`production.station`, `inventory.warehouse`).

## Alternativas consideradas

- **Todos os conceitos no MVP:** descartado pelo tamanho.
- **Módulos no menu lateral:** confundiria área (como usar) com módulo (o que simular).
- **Manutenção antes de Estoque:** descartado; Estoque e PCP andam juntos porque o PCP consome o estoque.

## Consequências

- Estoque + PCP vira um módulo grande. **Estimativa:** 4 a 6 semanas.
- O MVP já tem o básico de manutenção (MTBF e MTTR); o módulo acrescenta preventiva, equipe e peças.

## Regras derivadas

- `RN-PLA-006`: o plano libera módulos; elementos de módulos não contratados não aparecem na paleta.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "Como o produto se organiza".
- `product/vision.md` e `product/plant-model.md` (a criar).
