# Regras de simulação

> **Resumo.** O motor é determinístico com semente fixa, e a cena 3D só reproduz o que ele calculou. Os indicadores vêm de replicações, com média e intervalo de confiança. O roteamento entre elementos segue regras definidas pelo usuário.

Atualizado em 25/11/2026 · Origem: [PDR-0008](../../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../../pdr/0014-roteamento-definido-pelo-usuario.md), [PDR-0020](../../pdr/0020-modos-de-simulacao-e-aquecimento.md), [PDR-0022](../../pdr/0022-modelo-de-fluxo-da-planta.md).

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

- **Enunciado:** uma saída de elemento ligada a mais de um destino precisa de uma regra de roteamento: por qualidade, por percentual ou fila mais curta. A regra cobre exatamente as conexões de saída do elemento, cada destino uma vez. Uma estação com taxa de defeito acima de 0 precisa da regra por qualidade, também quando a taxa sobe só num cenário.
- **Origem:** PDR-0014; regra por qualidade obrigatória com defeitos: PDR-0022.
- **Exemplo:** uma estação ligada a "inspeção" e a "refugo" sem regra não deixa a planta rodar.
- **Quando violada:** `INVALID_PLANT` ([RN-EDT-004](editor.md)).

### RN-SIM-005: Percentuais somam 100%

- **Enunciado:** na regra por percentual, cada destino tem um percentual inteiro de 1 a 100, e os percentuais somam exatamente 100%. Cada peça sorteia o destino de forma independente.
- **Origem:** PDR-0014.
- **Exemplo:** 70% para a linha A e 30% para a B.
- **Quando violada:** `INVALID_PLANT`.

### RN-SIM-006: Limite de retrabalho

- **Enunciado:** cada peça tem um único contador de retrabalhos, somado em todas as estações por onde passa. O limite é o número de retrabalhos permitidos: uma peça que sai defeituosa depois de já ter usado todos eles vai para o refugo. A regra por qualidade tem três saídas: boa, retrabalho (opcional) e refugo, esta sempre um elemento de refugo. Enquanto o contador estiver abaixo do limite, a peça defeituosa vai para o retrabalho, e o contador sobe nesse envio; sem saída de retrabalho, ela vai direto para o refugo. Em cada passagem vale a taxa de defeito da estação onde a peça é processada.
- **Origem:** PDR-0014; saídas da regra por qualidade e teto: PDR-0022.
- **Exemplo:** com limite 2, uma peça defeituosa pela terceira vez vira refugo, mesmo que os defeitos tenham sido em estações diferentes (1 na M1 e 2 na M2). Com probabilidade de defeito p, a chance de refugo é p³ e a peça é processada no máximo 3 vezes.
- **Quando violada:** é um invariante do motor.
- **Padrão:** 2 retrabalhos (até 3 passagens), definido por planta e editável de 0 a 10 (o teto é uma estimativa contra plantas que travam o motor, PDR-0022). Decisão do fundador em 04/11/2026: conta retrabalhos, não passagens, com contador por peça. **Fonte:** a literatura não traz convenção para o limite; as fórmulas estão na [pesquisa da literatura do motor](../../research/literatura-do-motor.md).

## Modos de execução e aquecimento

Origem: [PDR-0020](../../pdr/0020-modos-de-simulacao-e-aquecimento.md). Base: [pesquisa sobre aquecimento](../../research/aquecimento-em-simulacao-didatica.md).

### RN-SIM-007: Três modos de execução

- **Enunciado:** o usuário escolhe o modo de cada execução: **turno** (começa vazio, sem aquecimento; padrão), **continuar do turno anterior** (começa com o estado final salvo de uma execução anterior da mesma planta) ou **regime estável** (começa vazio e descarta o aquecimento). A interface explica cada modo antes da escolha.
- **Origem:** PDR-0020.
- **Exemplo:** o professor roda o turno e depois o regime estável para mostrar a diferença entre os dois números.
- **Quando violada:** `INVALID_PLANT` se "continuar do turno anterior" for escolhido sem estado salvo compatível, ou se o regime estável for escolhido sem aquecimento informado (aceito do assistente ou editado, RN-SIM-009). As duas verificações acontecem ao executar, não na validação da planta, que aceita um regime estável ainda sem aquecimento (decisão do fundador em 04/11/2026).
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

## Modelo de fluxo

Origem: [PDR-0022](../../pdr/0022-modelo-de-fluxo-da-planta.md). Base: [pesquisa do modelo de fluxo](../../research/modelo-de-fluxo-da-planta.md). Uma revisão detalhada destas regras está prevista depois que o motor rodar as primeiras plantas (decisão do fundador em 25/11/2026).

### RN-SIM-013: Fila da fonte e pedidos não atendidos

- **Enunciado:** a fonte guarda as peças que chegam numa fila de capacidade definida pelo usuário, de 0 a 10 000. Uma chegada que encontra a fila cheia não entra na planta e é contada em "pedidos não atendidos". As chegadas seguem o sorteio da fonte, independentes do estado da linha. A fila da fonte conta no WIP, e o lead time de uma peça começa quando ela chega.
- **Origem:** PDR-0022.
- **Exemplo:** com fila de 20 e a estação mais lenta que as chegadas, a fila enche e, a partir daí, parte das chegadas vira pedido não atendido.
- **Quando violada:** é um invariante do motor.
- **Padrão:** fila de 20.

### RN-SIM-014: Bloqueio depois do serviço

- **Enunciado:** a estação processa uma peça por vez. Se o destino está cheio, a peça terminada fica na estação, que passa ao estado **bloqueado**, distinto de **faminto** (sem peça para processar). Com mais de uma entrada, a estação puxa a peça que espera há mais tempo; no empate, a peça retrabalhada vem primeiro.
- **Origem:** PDR-0022.
- **Exemplo:** M1 termina uma peça com o buffer B1 cheio e fica bloqueada até B1 abrir vaga.
- **Quando violada:** é um invariante do motor.

### RN-SIM-015: Falhas no relógio de calendário

- **Enunciado:** o tempo até a falha conta desde o fim do reparo anterior, com a máquina trabalhando ou parada. O MTBF é o tempo de funcionamento, e a disponibilidade esperada é MTBF/(MTBF + MTTR). Tempo até a falha e tempo de reparo são distribuições, como o ciclo. Se a falha acontece durante o processamento, a peça termina o tempo que faltava depois do reparo. Durante o reparo, nenhuma peça entra nem sai da máquina.
- **Origem:** PDR-0022.
- **Exemplo:** MTBF de 240 min e MTTR de 15 min dão disponibilidade de 94,1% em regime estável.
- **Quando violada:** é um invariante do motor.
- **Padrão ao ligar as falhas:** exponencial, com 240 min até a falha e 15 min de reparo.

### RN-SIM-016: Esteira

- **Enunciado:** a esteira leva cada peça da entrada à saída em comprimento ÷ velocidade, com no máximo `capacity` peças e espaçamento mínimo de comprimento ÷ capacidade, medido em deslocamento da correia. Se a saída está bloqueada, a esteira para inteira e retoma quando a saída libera, mantendo o espaçamento. A esteira não quebra (v1) e não cria defeitos.
- **Origem:** PDR-0022.
- **Exemplo:** 5 m a 10 m/min dão 30 s de trânsito; com capacidade 5, uma peça entra a cada 1 m de deslocamento (6 s com a correia andando).
- **Quando violada:** é um invariante do motor.
- **Padrão:** 5 m, 10 m/min, capacidade 5.

### RN-SIM-017: Linha travada

- **Enunciado:** se peças bloqueadas passam a esperar umas pelas outras em ciclo, sem saída possível, a execução para. O resultado mostra os elementos do ciclo e o instante, informa quantas replicações travaram e não mostra indicadores; nunca se faz a média só das replicações que não travaram.
- **Origem:** PDR-0022.
- **Exemplo:** "A linha travou em 2h13: M1 e RW esperam uma pela outra (7 de 30 replicações)."
- **Quando violada:** `PLANT_DEADLOCK`.
