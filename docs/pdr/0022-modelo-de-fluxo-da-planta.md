# PDR-0022: Modelo de fluxo da planta

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 25/11/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O esquema da planta v1 ([plano](../plans/2026-11-25-esquema-da-planta-v1.md)) precisa de campos que digam como as peças andam: onde esperam, o que acontece quando o destino está cheio, quando uma máquina quebra, como a esteira se comporta e para onde vai a peça defeituosa. Nenhuma regra nem o [modelo da planta](../product/plant-model.md) dizia isso, e cada escolha muda os números de toda planta salva e os casos de validação do [motor](../product/simulation.md). A [pesquisa do modelo de fluxo](../research/modelo-de-fluxo-da-planta.md) e dois debates de revisores mostraram que:

- **fato:** as ferramentas se dividem sobre a fila na frente da máquina. No Plant Simulation, a Station guarda uma peça e bloqueia; no Arena e no Simio, o servidor tem fila embutida. Só a estação que bloqueia deixa a capacidade do buffer mudar alguma coisa;
- **fato:** com o destino cheio, a chegada do Simul8 se perde; a fonte do Plant Simulation para de criar peças, e o tutorial da U. Twente chama isso de risco de "modelo inválido";
- **fato:** o padrão do Simul8 e do Arena é a falha no relógio de calendário, contado desde o fim do reparo, e só ela reproduz a disponibilidade MTBF/(MTBF + MTTR) do caso de validação de 94,1%. Law prefere o tempo ocupado, "more natural", e desaconselha o reparo exponencial (moda em zero);
- **fato:** as ferramentas definem a esteira por comprimento e velocidade. A não acumuladora para inteira quando a saída bloqueia, e nenhuma fonte lida descreve o que acontece com as peças numa esteira quebrada;
- **fato:** nenhuma ferramenta tem taxa de defeito na estação nem limite de retrabalho embutido; o modelador cria com atributos;
- **estimativa (revisores):** com bloqueio e buffers finitos, um laço de retrabalho pode travar a linha para sempre. O exemplo atual do modelo da planta (m1 → rw1 → m1) trava;
- **fato:** a OEE.com mede a qualidade como *first pass yield* e o desempenho contra um ritmo ideal, que o esquema não tinha.

Valem as decisões aceitas: regras de roteamento escolhidas pelo usuário e limite de retrabalho ([PDR-0014](0014-roteamento-definido-pelo-usuario.md)); os três modos e os números aleatórios comuns ([PDR-0020](0020-modos-de-simulacao-e-aquecimento.md)); amostras só por inversão com um único número uniforme ([ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md), item 6).

## Decisão

1. **Estação de uma peça, bloqueio depois do serviço.** A estação processa uma peça por vez. Se o destino está cheio, a peça terminada fica nela, no estado **bloqueado**, distinto de **faminto**. A espera entre estações só acontece em buffers explícitos, de capacidade editável.
2. **Fonte com fila limitada que perde a chegada.** A fonte tem uma fila visível de capacidade editável. Uma chegada que encontra a fila cheia se perde e entra na conta de **pedidos não atendidos**. As chegadas seguem o sorteio, independentes do que acontece na linha.
3. **De onde a estação puxa.** Com mais de uma entrada, a estação puxa a peça que espera há mais tempo; no empate, a retrabalhada vem primeiro.
4. **Falhas no relógio de calendário.** O tempo até a falha é contado desde o fim do reparo anterior, e a máquina pode falhar parada. O MTBF é o tempo de funcionamento, e a disponibilidade esperada é MTBF/(MTBF + MTTR). Tempo até a falha e tempo de reparo são distribuições, como o ciclo; ao ligar as falhas, o padrão é exponencial com 240 min e 15 min. A peça em processo termina o tempo que faltava depois do reparo, e durante o reparo nada entra nem sai da máquina.
5. **Esteira por comprimento e velocidade.** O trânsito é o comprimento dividido pela velocidade; a esteira leva no máximo `capacity` peças, com espaçamento mínimo de comprimento ÷ capacidade. Ela não acumula: se a saída bloqueia, para inteira, como uma correia. Não quebra no v1 e nunca cria defeito.
6. **Defeito, retrabalho e refugo.** A estação tem uma taxa de defeito. A peça defeituosa segue a regra por qualidade, que tem três saídas: boa, retrabalho (opcional) e refugo. Cada peça tem um contador único de retrabalhos ([PDR-0014](0014-roteamento-definido-pelo-usuario.md)); enquanto houver retrabalho disponível, a defeituosa vai para o retrabalho, depois para o refugo.
7. **Linha travada.** Se as peças passam a esperar umas pelas outras em ciclo, sem saída possível, a execução para com um código próprio e mostra os elementos do ciclo. Uma replicação travada invalida a execução inteira, que informa quantas travaram; nunca se faz a média só das que não travaram.
8. **Ritmo ideal.** Cada estação tem um tempo de ciclo ideal, a base do fator desempenho do OEE; o editor o preenche com a média do ciclo.
9. **O que o Takt simplifica, dito na interface:** fila só em buffers, falha no calendário, reparo exponencial por padrão, esteira sem falha, sem turnos.

## Alternativas consideradas

- **Fila embutida em toda estação** (Arena): fila visível sem buffer, mas a capacidade do buffer deixa de mudar qualquer coisa, e o bloqueio, um conceito central de linhas, some.
- **Fonte com fila ilimitada:** mostraria a fila crescendo e daria o M/M/1 direto, mas o fundador a recusou: "nada no mundo real acontece sem limite".
- **Fonte que para de gerar com a fila cheia** (Plant Simulation), a primeira escolha do fundador: nada some, mas a sobrecarga fica escondida, as chegadas passam a depender da linha e o tutorial da U. Twente a trata como armadilha. Revista depois dos debates.
- **Falha no tempo ocupado** (Law, modelos analíticos de linha): mais realista para desgaste, mas não reproduz o caso de validação de 94,1%, e as falhas deixam de cair nos mesmos instantes entre cenários. Fica como extensão possível.
- **Reparo Erlang-2 ou gama** (Simul8, Plant Simulation, Law): mais fiel, mas sem inversa em fórmula fechada; caberia só com um ADR que mude o item 6 do ADR-0011. Com o reparo como distribuição, o usuário já pode escolher uma triangular, de moda positiva.
- **Esteira acumuladora, ou como atraso fixo:** a acumuladora junta as peças no fim; o atraso fixo ignora comprimento e velocidade, que o fundador pediu.
- **Esteira que quebra:** pedida primeiro, retirada porque nenhuma fonte descreve o comportamento e nenhum passo do demo a usa.
- **Linha travada seguindo até o fim:** a vazão cairia a zero, mas a média de replicações misturaria as travadas e as normais, e o número final enganaria.

## Consequências

- O aluno vê a fila crescer na fonte, a estação bloqueada e os pedidos não atendidos, e entende por que se põe um buffer. Os casos de validação ganham condições escritas e um caso fechado novo: a fração de chegadas perdidas igual à do M/M/1/K.
- **Custo:** o motor precisa detectar o ciclo de espera, guardar o estado de cada estação e um contador por peça (sub-planos 4 e 5). A planta de exemplo precisa ser sobrecarregada para o passo 4 do demo ("a vazão sobe") ser verdadeiro; os números são conferidos com o motor.
- **Custo:** o reparo exponencial padrão sorteia reparos curtos demais. Fica documentado como simplificação.
- **Em aberto:** a falha da esteira, a falha no tempo ocupado e a liberação limitada por WIP (CONWIP) como tipo de fonte, para depois do MVP; o desempate e a definição de fila na regra de fila mais curta (sub-plano 5).

## Regras derivadas

- `RN-SIM-013`: a fonte tem fila limitada; a chegada que não cabe se perde e é contada em pedidos não atendidos.
- `RN-SIM-014`: a estação processa uma peça, bloqueia depois do serviço e puxa a peça que espera há mais tempo, com o retrabalho na frente no empate.
- `RN-SIM-015`: falhas no relógio de calendário, desde o fim do reparo; a peça em processo termina depois do reparo; nada entra nem sai durante o reparo.
- `RN-SIM-016`: esteira por comprimento e velocidade, com capacidade e espaçamento; para inteira com a saída bloqueada.
- `RN-SIM-017`: a linha travada para a execução e a invalida.
- Ajustes de detalhe: `RN-SIM-004` (taxa de defeito acima de 0 exige regra por qualidade), `RN-SIM-005` (percentuais inteiros), `RN-SIM-006` (saídas boa, retrabalho e refugo; limite de 0 a 10), `RN-EDT-003` (padrões de cada elemento), `RN-EDT-004` (validações mínimas).

## Reflete em

- [product/plant-model.md](../product/plant-model.md), [product/simulation.md](../product/simulation.md), [product/glossary.md](../product/glossary.md), [use-cases/uc-sim-001-validar-planta.md](../product/use-cases/uc-sim-001-validar-planta.md).
- [Pesquisa do modelo de fluxo](../research/modelo-de-fluxo-da-planta.md).
