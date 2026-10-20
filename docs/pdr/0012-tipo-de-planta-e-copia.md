# PDR-0012: Tipo de planta e cópia real → Capacitar

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

Uma planta fictícia é material de aula, que pode ser publicado e copiado. Uma planta real é dado confidencial da empresa (**fato:** layout e capacidade costumam ser segredo industrial). A empresa quer treinar a equipe usando a própria fábrica.

## Decisão

1. Toda planta tem um **tipo**: **didática** ou **real**. O tipo fica no registro do servidor, não no JSON.
2. Uma planta real **nunca** é publicada em grupo nem usada em missão.
3. Uma planta real pode ser **copiada para Capacitar**, com um **aviso** de que a cópia ficará visível para os grupos de treinamento.
4. A cópia vira **didática**, perde o vínculo com os dados reais e com a calibração, e é de mão única.
5. Só **administrador ou analista** copia, e a cópia fica registrada (quem e quando).

## Alternativas consideradas

- **Aviso de "público":** termo errado; a cópia é visível dentro da organização, não na internet.
- **Só o aviso, sem restrição de papel:** **fato:** um aviso sozinho não protege.

## Consequências

- No MVP não existem plantas reais (Analisar está "em breve"), mas o tipo já existe no modelo.

## Regras derivadas

- `RN-PLT-001`: toda planta tem tipo didática ou real.
- `RN-PLT-002`: uma planta real nunca é publicada em grupo.
- `RN-PLT-003`: só administrador ou analista copia uma planta real para Capacitar; a cópia é didática e registrada em auditoria.
- `RN-PLT-004`: a cópia exige confirmação após o aviso.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "Como o produto se organiza".
- `product/vision.md` e `product/access.md` (a criar).
