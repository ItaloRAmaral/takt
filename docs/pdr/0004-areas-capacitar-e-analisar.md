# PDR-0004: Duas áreas: Capacitar e Analisar

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O relatório inicial tinha três modos de uso: ensinar, treinar e analisar. Ensinar e treinar têm a mesma mecânica (mexer, rodar, ver o efeito) e mudam só no objetivo, na forma de avaliação e em quem compra.

## Decisão

1. O produto tem **duas áreas no menu lateral**:
   - **Capacitar**, que junta aprender e treinar;
   - **Analisar**, para a fábrica real.
2. **Missões** (desafios com meta e nota) são um recurso de Capacitar, úteis em aula e em empresa.
3. No MVP, Missões e Analisar aparecem como **"em breve"**.

## Alternativas consideradas

- **Três áreas separadas:** duplicaria telas e navegação para a mesma mecânica.
- **Esconder o que não existe:** descartado; mostrar "em breve" comunica a visão no LinkedIn.

## Consequências

- Universidade e empresa se diferenciam por plano e conteúdo, não por área.
- Testar alternativas na fábrica real é Analisar; ensinar a equipe com a própria fábrica é uma cópia para Capacitar ([PDR-0012](0012-tipo-de-planta-e-copia.md)).

## Regras derivadas

- `RN-PLA-005`: o plano libera áreas; área não contratada aparece bloqueada ou "em breve".

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "Como o produto se organiza".
- `product/vision.md` (a criar).
