# PDR-0010: Papel ≠ plano

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

A venda futura de assinaturas exige separar o que uma pessoa **pode fazer** (papel) do que a organização **comprou** (plano). Misturar os dois tornaria a cobrança uma reescrita.

## Decisão

1. **O papel diz quem pode; o plano diz o que a organização contratou.** Toda ação checa os dois.
2. O plano limita **áreas**, **módulos** e **número de plantas** (didáticas e reais).
3. No MVP existe **um único plano gratuito**, só para a estrutura existir.

## Alternativas consideradas

- **Só papéis no MVP, planos depois:** a cobrança viraria uma reescrita.

## Consequências

- A interface distingue "sem permissão" de "limite do plano", para mostrar "fazer upgrade".
- Preços e conteúdo de cada plano ficam para o futuro (modelo comercial em aberto).

## Regras derivadas

- `RN-PLA-001`: toda organização tem exatamente um plano ativo e nasce no gratuito.
- `RN-PLA-002`: toda ação exige papel e plano compatíveis.
- `RN-PLA-003`: o limite de plantas é checado ao criar, copiar e importar.
- `RN-PLA-004`: violar um limite do plano devolve um código próprio (`PLAN_LIMIT`).

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "Como o produto se organiza".
- `product/access.md` (a criar).
