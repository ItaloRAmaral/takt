# PDR-0007: Montagem do zero em 3D, em grade

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O usuário precisa montar a linha do zero e tudo precisa ser em 3D. **Estimativa:** arrastar objetos livremente em 3D é difícil de usar e de construir; o editor é o maior item do projeto.

## Decisão

1. A montagem é **toda em 3D**, numa **grade com encaixe automático**, no estilo dos jogos de construção (The Sims).
2. Câmera orbital, com **vista de cima opcional** para editar.
3. Rotação em passos de 90°. Desfazer e refazer sempre disponíveis.

## Alternativas consideradas

- **Editor 2D com visualização 3D separada:** descartado; tudo deve ser em 3D.
- **Posicionamento livre, sem grade:** difícil de usar e de construir.

## Consequências

- Formas simples primeiro; a arte vem depois que a interação funcionar.
- A grade simplifica o modelo de dados (posição inteira).

## Regras derivadas

- `RN-EDT-001`: elementos encaixam na grade e giram em passos de 90°.
- `RN-EDT-002`: toda ação de edição pode ser desfeita.
- `RN-EDT-003`: um elemento novo nasce com parâmetros padrão válidos.
- `RN-EDT-004`: uma planta inválida não roda e mostra o erro no elemento.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "O MVP em uma tela".
- `product/mvp-scope.md` e `product/ux-visual.md` (a criar).
