# Regras de simulação

> **Resumo.** O motor é determinístico com semente fixa, e a cena 3D só reproduz o que ele calculou. Os indicadores vêm de replicações, com média e intervalo de confiança. O roteamento entre elementos segue regras definidas pelo usuário.

Atualizado em 03/11/2026 · Origem: [PDR-0008](../../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../../pdr/0014-roteamento-definido-pelo-usuario.md), [PDR-0020](../../pdr/0020-modos-de-simulacao-e-aquecimento.md).

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

## Modos de execução e aquecimento

Origem: [PDR-0020](../../pdr/0020-modos-de-simulacao-e-aquecimento.md). Base: [pesquisa sobre aquecimento](../../research/aquecimento-em-simulacao-didatica.md).

### RN-SIM-007: Três modos de execução

- **Enunciado:** o usuário escolhe o modo de cada execução: **turno** (começa vazio, sem aquecimento; padrão), **continuar do turno anterior** (começa com o estado final salvo de uma execução anterior da mesma planta) ou **regime estável** (começa vazio e descarta o aquecimento). A interface explica cada modo antes da escolha.
- **Origem:** PDR-0020.
- **Exemplo:** o professor roda o turno e depois o regime estável para mostrar a diferença entre os dois números.
- **Quando violada:** `INVALID_PLANT` se "continuar do turno anterior" for escolhido sem estado salvo compatível, ou se o regime estável for escolhido sem aquecimento informado (aceito do assistente ou editado, RN-SIM-009).
- **Em aberto:** quando um estado salvo deixa de ser compatível (por exemplo, se a planta mudou).

### RN-SIM-008: Fim do aquecimento

- **Enunciado:** no modo regime estável, ao fim do aquecimento, todas as estatísticas são zeradas e o estado da fábrica (peças, filas, máquinas) é mantido. Os gráficos marcam o instante do corte e dizem o que foi zerado.
- **Origem:** PDR-0020.
- **Exemplo:** o gráfico de WIP mostra uma linha vertical em t = 300 com o rótulo "fim do aquecimento".
- **Quando violada:** é um invariante do motor.

### RN-SIM-009: Assistente de aquecimento

- **Enunciado:** no modo regime estável, o assistente roda replicações piloto, calcula o aquecimento por MSER-5 para cada indicador (vazão, WIP, lead time) sobre a média entre replicações e sugere o **maior** deles. Mostra o gráfico com o corte e o valor de cada indicador. O usuário aceita ou edita.
- **Origem:** PDR-0020.
- **Exemplo:** "Sugestão: 320 min (maior entre vazão 210, WIP 320, lead time 280)."
- **Quando violada:** se o corte cair na segunda metade da série, o resultado é inválido; o assistente estende a corrida e tenta de novo e, depois de algumas tentativas, pede a decisão do usuário.
- **Em aberto:** número de replicações piloto e de tentativas.

### RN-SIM-010: Comparação justa de cenários

- **Enunciado:** dois cenários só são comparados se usarem o mesmo modo, a mesma semente, o mesmo aquecimento e a mesma duração. Cada fonte e cada estação tem a própria sequência de números aleatórios (números aleatórios comuns), para que a diferença venha do que mudou e não do sorteio.
- **Origem:** PDR-0020; números aleatórios comuns aprovados na discussão do motor.
- **Exemplo:** ao reduzir o tempo de M3, as falhas de M1 acontecem nos mesmos instantes nos dois cenários.
- **Quando violada:** a comparação é bloqueada, com o motivo.

### RN-SIM-011: Aviso de utilização do gargalo

- **Enunciado:** no modo turno, se a utilização do gargalo passar do limite, o resultado avisa que o turno mede sobretudo o enchimento da linha e sugere o modo regime estável.
- **Origem:** PDR-0020.
- **Exemplo:** "Utilização do gargalo: 0,91. Neste turno, a linha mal saiu do enchimento; para a capacidade de longo prazo, use o regime estável."
- **Quando violada:** não se aplica (aviso).
- **Em aberto:** o limite (proposta: 0,85).

### RN-SIM-012: Resultado diz a que pergunta responde

- **Enunciado:** todo resultado exibe o modo em que foi gerado e a pergunta que ele responde.
- **Origem:** PDR-0020.
- **Exemplo:** "Modo turno: desempenho deste turno, incluindo o enchimento da linha."
- **Quando violada:** não se aplica (apresentação).
