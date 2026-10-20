# Regras de simulação

> **Resumo.** O motor é determinístico com semente fixa, e a cena 3D só reproduz o que ele calculou. Os indicadores vêm de replicações, com média e intervalo de confiança. O roteamento entre elementos segue regras definidas pelo usuário.

Atualizado em 20/10/2026 · Origem: [PDR-0008](../../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../../pdr/0014-roteamento-definido-pelo-usuario.md).

### RN-SIM-001: Determinismo

- **Enunciado:** a mesma planta, com o mesmo cenário, a mesma semente e a mesma versão do motor, produz exatamente os mesmos resultados.
- **Origem:** PDR-0008.
- **Exemplo:** o professor e o aluno rodam a mesma planta com a semente 42 e veem os mesmos números.
- **Quando violada:** é um invariante; um teste compara duas execuções.

### RN-SIM-002: A cena 3D só reproduz

- **Enunciado:** a cena 3D reproduz o log de eventos do motor e nunca calcula resultado algum.
- **Origem:** PDR-0008.
- **Exemplo:** mudar a velocidade da reprodução não altera nenhum indicador.
- **Quando violada:** é um invariante de arquitetura.

### RN-SIM-003: Indicadores com intervalo de confiança

- **Enunciado:** os indicadores mostram a média das replicações e o intervalo de confiança de 95%.
- **Origem:** PDR-0008.
- **Exemplo:** "Vazão: 118 peças/h (IC 95%: 114 a 122)".
- **Quando violada:** não se aplica (formato de apresentação).
- **Padrões:** 30 replicações, ajustáveis de 5 a 100; semente 42, editável. **Estimativa:** 30 é um ponto de partida comum; ajustar pela precisão desejada (Law) fica para depois.

### RN-SIM-004: Saída com vários destinos exige regra

- **Enunciado:** uma saída de elemento ligada a mais de um destino precisa de uma regra de roteamento: por qualidade, por percentual ou fila mais curta.
- **Origem:** PDR-0014.
- **Exemplo:** uma estação ligada a "inspeção" e a "refugo" sem regra não deixa a planta rodar.
- **Quando violada:** `INVALID_PLANT` ([RN-EDT-004](editor.md)).

### RN-SIM-005: Percentuais somam 100%

- **Enunciado:** na regra por percentual, os percentuais dos destinos somam exatamente 100%.
- **Origem:** PDR-0014.
- **Exemplo:** 70% para a linha A e 30% para a B.
- **Quando violada:** `INVALID_PLANT`.

### RN-SIM-006: Limite de retrabalho

- **Enunciado:** cada peça conta quantas vezes passou por retrabalho; ao atingir o limite, ela vai para o refugo.
- **Origem:** PDR-0014.
- **Exemplo:** com limite 2, uma peça defeituosa pela terceira vez vira refugo.
- **Quando violada:** é um invariante do motor.
- **Padrão:** 3 passagens, definido por planta.
