# Réplica B

## Onde A tem razão e eu não vi

- **Impasse em laço de retrabalho.** A minha própria proposta, `byQuality { good, rework, scrap }` com um buffer de retrabalho que volta para a estação, cria exatamente o ciclo que A descreve. Um navegador que trava sem explicar é o pior resultado didático possível [Estimativa].
- **Falha durante o bloqueio.** Eu não tratei esse caso.
- **Repor o retrabalho como objeto de distribuição.** A tem mais razão do que diz (ver abaixo).
- **Reescrever o caso "retrabalho sem limite".** Esse caso é irrepresentável com o limite finito da RN-SIM-006 [Fato: simulation.md].

## Posições sobre os pontos pedidos

1. **Fila da fonte no WIP e lead time desde a criação: posição conjunta.** Para o aluno, lead time é "da chegada à expedição". Medir a partir da saída da fila esconderia justamente a espera que ele vê na cena.
2. **Impasse: concordo que é preciso tratar, mas na execução e não no editor.**
   - Um aviso estático dispararia em todo laço de retrabalho, porque todo buffer é finito. Isso vira ruído que ensina a ignorar avisos [Estimativa].
   - Proposta: quando um elemento bloqueia, o motor segue a cadeia "espera por". Se ela fechar um ciclo, a replicação termina com um código próprio, por exemplo `DEADLOCK` [Palpite no nome], com o instante e os elementos envolvidos. A cena destaca o ciclo.
   - Bem mostrado, isso é uma lição real de chão de fábrica, não um erro técnico.
   - O que decide: o dono, sobre o que acontece com os resultados até ali (pendência do sub-plano 6).
3. **Não se comprometer com destino ocupado: concordo só para a fila mais curta.**
   - Na fila mais curta, a peça escolhe na hora de sair, entre os destinos com vaga. Se não houver vaga, espera e vai para o primeiro que liberar. É o que o aluno espera de "a próxima máquina livre pega a próxima peça".
   - Por percentual e por qualidade, o compromisso é o próprio significado da regra. Desviar mudaria os 70/30, e a capacidade abaixo de k/c com percentual é uma lição a mostrar.
   - O que decide: rodar o caso k/c com a fila mais curta [Fato: literatura-do-motor.md, k paralelas].
4. **Piso acima de 0: concordo com ressalva.** Exigir > 0 só onde zero gera eventos infinitos: o intervalo da fonte (o valor fixo e o máximo de cada distribuição), `mtbfMin`, e o comprimento e a velocidade da esteira.
   - Manter ≥ 0 no ciclo da estação, que o sub-plano 1 já decidiu [Fato: roteiro, pendências]. Uma "inspeção instantânea" é um uso didático legítimo.
   - Um ciclo de 0 s num laço de retrabalho termina, porque o limite é finito [Estimativa].
5. **Reparo como objeto de distribuição: mudo de posição, concordo.**
   - O formato já existe ("variabilidade como objeto", plant-model.md), e reusá-lo é mais simples do que um escalar especial.
   - Isso também resolve a Q2 sem ADR novo: a triangular, que já está na lista do ADR-0011, dá moda positiva [Fato: relatório, terceiro caminho]. O padrão continua exponencial.
   - Aplicar o mesmo à falha. A interface mostra a média calculada como "MTBF" e "MTTR", e as dicas são as mesmas do ciclo.
   - Rejeito a lognormal com ADR no v1: é custo sem ganho visível ao aluno [Palpite].
6. **Sequências separadas por propósito: posição conjunta, e já decidido.** A chave é `<id do elemento>:<propósito>` [Fato: sim-engine.md, decisão de 04/11/2026], então o "sem separar propósitos" de A está desatualizado. Falta só listar os propósitos no plano: chegada, ciclo, defeito, roteamento, falha e reparo, inclusive os da esteira.
7. **Falha durante o bloqueio: "em falha" prevalece sobre "bloqueado".**
   - No tempo por estado, conta como falha, e a chave inglesa é o que a cena mostra.
   - Durante o reparo, nada entra nem sai da máquina. É uma regra só, fácil de explicar e de ver [Palpite].
   - O que decide: o dono, ou ler na página como o Simul8 e o Plant Simulation fazem. O material não traz isso.
8. **Intervalo da esteira em distância percorrida: concordo.** É também a versão visualmente correta: depois de uma parada, as peças não se sobrepõem na cena, coerente com "gaps do not get squashed" [Fato: relatório, Simul8]. Custa um acumulador de tempo em movimento [Estimativa].

## Onde A pesa demais

- **Coeficiente de variação ao quadrado na interface.** O aluno não sabe o que é. Dizer "a exponencial gera reparos muito variados, o que aumenta as filas" cabe no "Saiba mais", não na tela principal.
- **Casos novos de validação.** Aceito o M/M/1/K, porque valida o indicador de pedidos não atendidos que o aluno vê. Aceito também a vazão A/c e a esteira determinística, que são baratos. Não acrescentaria outros no v1.

## O que A não cobre e continua de pé (da minha revisão)

- O destino do refugo quando o limite de retrabalho estoura.
- O padrão de falha ao ligar as falhas, de que depende o passo 5 do demo.
- `defectRate > 0` sem regra por qualidade.
- A fábrica de exemplo, com buffers e o par de falhas, testada pela história do demo.
- O estado de duração zero com tempos fixos.
