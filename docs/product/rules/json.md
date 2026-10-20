# Regras de importar e exportar JSON

> **Resumo.** Quem pode levar plantas para dentro e para fora do sistema. Planta real: só o administrador. Planta didática: o instrutor exporta, e o aprendiz importa e exporta só o que criou. Todo arquivo importado é validado.

Atualizado em 20/10/2026 · Origem: [PDR-0013](../../pdr/0013-importar-exportar-json.md).

**Fato:** restringir a exportação não é segurança, porque o que aparece no navegador pode ser extraído. A proteção da planta real é quem consegue abri-la; estas regras são política e auditoria.

### RN-JSN-001: Planta real só pelo administrador

- **Enunciado:** só o administrador da organização importa ou exporta uma planta real.
- **Origem:** PDR-0013.
- **Exemplo:** um analista abre a planta real, mas não vê "exportar".
- **Quando violada:** `FORBIDDEN`.

### RN-JSN-002: Instrutor exporta plantas didáticas

- **Enunciado:** o instrutor exporta qualquer planta didática da organização.
- **Origem:** PDR-0013.
- **Exemplo:** o professor exporta a "Linha exemplo" para enviar a um colega.
- **Quando violada:** `FORBIDDEN`.

### RN-JSN-003: Aprendiz exporta só o que criou

- **Enunciado:** o aprendiz exporta apenas as plantas que ele mesmo criou, do zero ou como cópia.
- **Origem:** PDR-0013.
- **Exemplo:** o aluno exporta a cópia que fez da planta do professor para entregar o trabalho, mas não exporta a original.
- **Quando violada:** `FORBIDDEN`.

### RN-JSN-004: Aprendiz importa plantas didáticas

- **Enunciado:** o aprendiz pode importar um JSON; a planta criada pertence a ele.
- **Origem:** PDR-0013.
- **Exemplo:** o aluno importa o arquivo enviado por um colega.
- **Quando violada:** `FORBIDDEN` se o papel não permitir; `PLAN_LIMIT` se o limite for atingido.

### RN-JSN-005: Validação na importação

- **Enunciado:** todo arquivo importado é validado (formato, tamanho e versão do esquema). Um arquivo de versão antiga é migrado; um arquivo inválido é recusado com a lista de erros.
- **Origem:** PDR-0013.
- **Exemplo:** um arquivo com `cycle` negativo é recusado, e a mensagem aponta o elemento.
- **Quando violada:** `INVALID_PLANT_FILE`, `UNSUPPORTED_SCHEMA_VERSION` ou `FILE_TOO_LARGE`.
- **Tamanho máximo:** 1 MB. **Estimativa:** uma planta com centenas de elementos ocupa dezenas de KB.

### RN-JSN-006: Importação cria planta didática

- **Enunciado:** uma importação cria sempre uma planta didática, exceto quando o administrador escolhe importar como real.
- **Origem:** PDR-0013.
- **Exemplo:** um JSON exportado de uma planta real e importado por um instrutor vira didático.
- **Quando violada:** é um invariante.

### RN-JSN-007: Exportação de planta real é auditada

- **Enunciado:** toda exportação de planta real fica registrada (quem, quando, qual planta).
- **Origem:** PDR-0013.
- **Exemplo:** o registro mostra "admin@empresa exportou Linha 2 em 19/10/2026 14:02".
- **Quando violada:** é um invariante.
