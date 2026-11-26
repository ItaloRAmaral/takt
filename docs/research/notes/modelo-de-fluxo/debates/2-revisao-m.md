# Revisão M: metodologia de simulação (proposta v2)

**Veredito.** O modelo conceitual é padrão e defensável. Os problemas estão em três pontos: casos de validação sem condições escritas, critério de aceitação estatisticamente fraco e regras de borda que mudam números (ordem dos eventos simultâneos, impasse, censura do lead time) adiadas ou soltas.

## 1. Decidido pelo dono

- **1–2 (capacidade 1, BAS, buffers explícitos): sólido.** Tem precedente [Fato, relatório, Escolha 2].
- **3 (fila finita na fonte): sólido, com um ganho que ninguém citou.** Com toda capacidade finita, toda planta tem regime estável, mesmo com ρ ≥ 1 [Estimativa: cadeia de estados finita]. O risco é outro: com capacidade 10 000 e ρ ≈ 1, o aquecimento fica enorme e a RN-SIM-009 vai falhar. A interface precisa dizer por quê.
- **4 e 11 (calendário; nada entra nem sai durante o reparo): aceitável, mas é simplificação, não fato.** A regra 11 é mais pessimista que os modelos analíticos de falha dependente da operação, que já subestimam a vazão quando trocados pelo calendário [Fato secundário, relatório, Escolha 3]. Precisa estar escrita como simplificação, com o sentido do efeito.
- **Caso dos 94,1%: mal condicionado.** No modo turno, com a máquina começando em operação, a disponibilidade esperada em 480 min é **94,29%**, não 94,12% [Estimativa: cadeia de dois estados, A + (1−A)(1−e^{−sT})/(sT) com s = 1/240 + 1/15]. O viés é pequeno, mas o caso precisa dizer que roda em regime estável.
- **10 (cenário só troca valores): correto** para os números aleatórios comuns.

## 2. Adotado pelo coordenador

- **Reparo como objeto de distribuição: correto, mas a normal truncada engana.** No ADR-0011, os parâmetros são da normal antes do corte, e a média realizada é outra. Exemplo: reparo normal com média 15, desvio 15 e mínimo 0 tem média real de 19,3 min, e a disponibilidade cai de 94,1% para **92,6%** [Estimativa, calculado]. A interface que mostrar MTBF/(MTBF+MTTR) com o parâmetro estará errada. Alternativas: calcular a média truncada e mostrá-la, ou recusar a truncada em falhas no v1.
- **Sequências por propósito.** `docs/architecture/sim-engine.md` usa `m1:failure` como chave de exemplo. O tempo até a falha e o reparo precisam de propósitos separados. A distribuição fixa não sorteia, então trocar o reparo de fixo para triangular deslocaria todas as falhas seguintes e quebraria o exemplo da RN-SIM-010 [Estimativa]. Também **o sorteio de defeito deve consumir um uniforme por passagem mesmo com p = 0**. Assim, passar p de 0 para 0,05 num cenário fica pareado de forma monótona [Estimativa].
- **Fila da fonte no WIP, lead time desde a criação: certo para o M/M/1.** O nome do indicador é que está errado. Esse número é o "tempo no sistema"; o lead time da linha (desde a saída da fila) deve aparecer à parte, senão o aluno compara grandezas diferentes com Factory Physics.
- **Lead time no turno: falta regra.** A média só das peças concluídas é censurada para baixo: as peças mais demoradas ainda estão na linha às 8 h [Estimativa]. O ADR-0011 fala em "lead time das peças que entraram", o que é ambíguo. É preciso definir e rotular.
- **Fórmula do retrabalho com limite n: confere** [Estimativa, derivação refeita]. Só vale em laço na mesma estação, com p constante e buffer grande o bastante para não travar. Como conta peças e não tempo, independe do bloqueio.
- **Casos novos: certos, mas faltam as condições.**
  - **p_K:** exige Q1(b) e K = fila da fonte + 1, com a estação puxando direto da fonte.
  - **A/c:** a estação nunca pode ficar faminta nem bloqueada (λ ≥ 2/c e saída direta para a expedição).
  - **Esteira:** precisa de comprimento ÷ (capacidade × velocidade) ≤ maior ciclo.

## 3. Os casos de validação como conjunto

- **[Fato]** Sargent classifica o que está na tabela como "simple cases of a simulation model are compared to known results of analytic models" ([WSC 2010](https://www.informs-sim.org/wsc10papers/016.pdf)). Na prática, é **verificação**: confere que o código implementa o modelo conceitual. Não valida as regras próprias do Takt. Nenhum caso combina bloqueio, falha, buffer finito e parada da esteira, que é justamente onde estão as regras sem precedente (11, congelamento da esteira).
- **"Passa dentro do IC" com semente fixa é um único sorteio.** Um motor correto reprova com 5% de chance, e um motor com viés passa se o IC for largo [Estimativa]. A alternativa é declarar, em cada caso, uma tolerância δ e dimensionar a corrida para que a meia-largura fique em δ/2 ou menos.
- **Faltam testes degenerados e de extremo** (Sargent: "Degenerate Tests", "Extreme Condition Tests", mesma fonte). Exemplos: p → 1 manda tudo para o refugo; MTTR → 0 reproduz a linha sem falhas; buffer 1 em toda a linha.

## 4. Q1: (b), perder a chegada

- Com (b), a entrada que o usuário escreveu ("exponencial 60 s") é a que o motor simula. Com (a), o processo de chegada vira endógeno: o λ que a interface mostra deixa de ser o realizado, e a regra D1 (o relógio da fonte bloqueada) passa a mudar resultados com chegadas não exponenciais [Fato, relatório, D1].
- O argumento dos números aleatórios comuns está exagerado. Em (a), o k-ésimo intervalo continua usando o k-ésimo uniforme; o que se perde são os instantes exógenos, e o pareamento só enfraquece [Estimativa].
- (a) não é um modelo inválido. Ele descreve outro sistema: a liberação limitada pela linha, ou a primeira máquina que nunca fica faminta, dos modelos analíticos. Se o dono quiser esse sistema, que entre depois como um tipo explícito de liberação, e não como o comportamento da fila cheia.
- Com (b), as chegadas perdidas viram indicador com IC, e o λ da Lei de Little é o das chegadas aceitas.

## 5. Q2: (a), parar, e com motivo mais forte

- **[Fato]** Palmer, Harper e Knight definem impasse como "some customers may be unable to ever leave a server due to mutual blocking" e calculam o tempo esperado até ele por cadeias de Markov ([EJOR 266, 2018](https://vknight.org/posts/modelling-deadlock-in-open-restricted-queueing-networks/)).
- **[Estimativa]** Num laço com BAS, capacidade finita e p > 0, o estado de impasse é alcançável e absorvente. Logo, acontece com probabilidade 1 numa corrida longa o bastante. Com (b), o "regime estável" de uma planta com laço é a linha parada, e o MSER mede isso. No turno, a média mistura replicações travadas com replicações sem trava.
- **Especificação proposta:**
  - **Detecção:** um ciclo no grafo de "espera por", contando só elementos no estado bloqueado. O reparo fica de fora, porque é transitório.
  - **Interrupção:** abortar a execução inteira, com a replicação, o instante e o ciclo. **Nunca descartar as replicações travadas e tirar a média das outras**: isso é viés de seleção.
  - **Editor:** um aviso estrutural sobre ciclos com BAS. Ele não garante que não haverá impasse.
  - **Teste de regressão:** o exemplo de `plant-model.md` trava.

## 6. Adiados que não podem esperar

- **Ordem dos eventos simultâneos.**
  - **[Fato secundário, trecho de busca]** Schriber e Brunner: o software trata em série os eventos de um mesmo instante, o que "raises questions about the order" ([WSC 1998](https://www.informs-sim.org/wsc98papers/011.PDF)).
  - Os casos determinísticos (linha em série, A/c, esteira) dependem dessa ordem nos tempos por estado. Com TDD, a ordem é parte do modelo conceitual: a regra semântica entra agora em `rules/`, e o sub-plano 4 cuida só da implementação.
- **Ciclo 0:** com ciclo ideal 0, o desempenho do OEE dá 0 ou fica indefinido. É preciso decidir agora.
- **Comparação de cenários:** o resultado deve mostrar o IC da **diferença pareada**, e não dois IC lado a lado. Sem isso, o ganho dos números aleatórios comuns se perde, e o aluno aprende que "IC sobrepostos = sem diferença" [Palpite: Law trata do t pareado; não conferi a página].

## 7. Três acréscimos

1. **Oráculo por cadeia de Markov** para plantas pequenas, só com exponenciais: duas estações, buffer até 5, falhas no calendário com a regra 11, perda na fonte e retrabalho.
   - **O que faz:** resolve o regime estável exatamente e compara vazão, WIP, P(bloqueado) e fração perdida. Valida as interações **segundo as convenções do próprio Takt**, como fazem Palmer et al.
   - **Custo:** médio [Estimativa]. Cerca de 300 a 500 linhas de teste (enumeração de estados e eliminação de Gauss, só com + − × ÷), conferidas antes contra o M/M/1/K fechado.
2. **Experimento de cobertura do procedimento de saída.**
   - **O que faz:** roda de 500 a 1000 sementes do procedimento completo (30 replicações e IC t; MSER-5 e média truncada) no M/M/1 com ρ = 0,8, contra 3,79 no turno e 4 em regime. Mede a cobertura empírica contra os 95% nominais.
   - **Por que importa:** valida a análise de saída, não só o motor, e dá material de dissertação.
   - **Custo:** baixo no turno, da ordem de 10⁷ eventos [Estimativa]; maior em regime. Roda à noite, fora do CI.
3. **Modelo conceitual explícito e comparação com outra implementação.**
   - **O que faz:** um documento no formato de Robinson ("objectives, inputs, outputs, content, assumptions and simplifications", [Fato secundário, citação em SCS 2010](https://scs.org/wp-content/uploads/2016/12/2010-04-Issue02-5.pdf)), com o sentido do efeito de cada simplificação. Mais uma comparação com um modelo independente em SimPy de três plantas, incluindo a de exemplo. É o "compared to other simulation models" de Sargent.
   - **Custo:** um dia para o documento e de dois a três para os modelos [Estimativa]. As diferenças de desempate exigem reproduzir a regra de ordem do item 6.
