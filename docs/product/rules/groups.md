# Regras de grupos

> **Resumo.** Um grupo é a turma (escola) ou a equipe (empresa). Ele pertence a uma organização, recebe plantas publicadas pelo instrutor e define o que cada aprendiz vê.

Atualizado em 20/10/2026 · Origem: [PDR-0011](../../pdr/0011-grupos.md).

### RN-GRP-001: Grupo pertence a uma organização

- **Enunciado:** um grupo pertence a exatamente uma organização, e só recebe plantas dessa organização.
- **Origem:** PDR-0011.
- **Exemplo:** um instrutor não publica uma planta da organização A num grupo da B.
- **Quando violada:** `NOT_FOUND`.

### RN-GRP-002: Aprendiz vê só o que foi publicado para ele

- **Enunciado:** o aprendiz vê apenas as plantas publicadas nos grupos de que participa e as plantas que ele mesmo criou.
- **Origem:** PDR-0011.
- **Exemplo:** na mesma universidade, um aluno do grupo "PCP 2026/1" não vê o material do grupo "Logística 2026/1".
- **Quando violada:** `NOT_FOUND`.

### RN-GRP-003: Entrada por código do grupo

- **Enunciado:** um usuário entra num grupo informando o código dele. Se ainda não for membro da organização do grupo, passa a ser, com o papel de aprendiz.
- **Origem:** PDR-0011.
- **Exemplo:** Carla digita `PCP-7K2Q` e passa a ver as plantas do grupo.
- **Quando violada:** `INVALID_GROUP_CODE`.

### RN-GRP-004: Validade do código do grupo

- **Enunciado:** o instrutor escolhe, por grupo, se o código **não expira** (padrão) ou **expira numa data**. Em qualquer caso, ele pode **gerar um código novo**, o que invalida o anterior, e **desativar a entrada** no grupo.
- **Origem:** PDR-0011.
- **Exemplo:** o código da turma vazou num grupo público; o professor gera outro, e o antigo para de funcionar.
- **Quando violada:** `INVALID_GROUP_CODE`.
