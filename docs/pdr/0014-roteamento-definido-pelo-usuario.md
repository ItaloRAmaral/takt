# PDR-0014: Roteamento definido pelo usuário

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O relatório inicial dava taxa de defeitos às estações, mas não dizia para onde vai a peça defeituosa. O fundador decidiu que o usuário define o destino e a regra.

## Decisão

1. Cada saída de elemento com mais de um destino tem uma **regra de roteamento** escolhida pelo usuário.
2. **Regras do MVP:**
   - **por qualidade** (boa ou defeituosa);
   - **por percentual**;
   - **fila mais curta**.
3. O MVP inclui o elemento **refugo** e um **limite de retrabalho**.

## Alternativas consideradas

- **Defeito sempre vira refugo:** simples, mas tira do aluno o efeito do retrabalho sobre WIP e lead time.
- **Regras por prioridade, por produto ou por condição:** exigem produtos ou lógica; ficam para depois.

## Consequências

- Retrabalho aumenta a superfície de erro do motor. Mitigação: testes contra a literatura (passagens esperadas = 1 / (1 − p)).

## Regras derivadas

- `RN-SIM-004`: uma saída com mais de um destino exige uma regra de roteamento.
- `RN-SIM-005`: na regra por percentual, os percentuais somam 100%.
- `RN-SIM-006`: ao atingir o limite de retrabalho, a peça vira refugo.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "O MVP em uma tela".
- `product/simulation.md` e `product/plant-model.md` (a criar).
