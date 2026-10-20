# PDR-0011: Grupos no lugar de turmas

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O relatório inicial usava "turmas" para três coisas: distribuir plantas aos alunos de um professor, acompanhar o que cada um fez e separar o material de professores diferentes na mesma universidade. "Turma" não serve para empresas, e sem algo no lugar todos os alunos veriam todas as plantas da organização.

## Decisão

1. **Grupo** é o conceito genérico: turma na escola, equipe na empresa.
2. O instrutor publica plantas para um grupo; o aprendiz entra por **código do grupo**.
3. O **acompanhamento do aluno** pelo professor fica **fora do MVP** e entra junto com as missões. Para dar nota, o aluno exporta a própria cópia em JSON ([PDR-0013](0013-importar-exportar-json.md)).

## Alternativas consideradas

- **Compartilhar por código da planta, sem grupos:** mais simples, mas não resolve a separação.
- **Acompanhamento no MVP:** custa armazenar execuções por aluno e um painel. **Palpite:** quem paga por acompanhamento é a empresa (comprovação de treinamento).

## Consequências

- Um mesmo conceito atende escola e empresa.

## Regras derivadas

- `RN-GRP-001`: um grupo pertence a uma organização.
- `RN-GRP-002`: o aprendiz só vê as plantas publicadas nos grupos de que participa.
- `RN-GRP-003`: o aprendiz entra num grupo pelo código.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "O MVP em uma tela".
- `product/access.md` (a criar).
