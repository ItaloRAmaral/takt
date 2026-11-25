# Revisão A: rigor de simulação

## Itens decididos

1. **Estação, BAS, bloqueado ≠ faminto: concordo com ressalva.** A recursão Dₙ da linha em série só vale com BAS [Fato, `docs/research/literatura-do-motor.md`, linha em série]. Falta dizer o que acontece se a estação **falha enquanto bloqueada**: a peça terminada sai durante o reparo? E qual estado prevalece (falha > bloqueado)? Sem isso, o tempo por estado e o OEE ficam ambíguos [Estimativa].
2. **Espera só em buffers: concordo com ressalva.** O M/M/1 roda com fonte → estação → expedição, e a fila de saída da fonte é a fila do M/M/1. Então **a fila da fonte precisa contar no WIP, e o lead time começa na criação da peça**. Se começar na saída da fila, o teste mede W ≈ 1 em vez de 5, e L fica abaixo de 4 [Estimativa]. A proposta não fixa essa fronteira.
3. **Fonte com fila finita: concordo.** Com capacidade até 10 000, p_K é desprezível (≈2·10⁻⁹⁸ com K = 1000) [Fato, relatório, Escolha 1].
4. **Falhas no calendário, desde o reparo: concordo.** É a condição do 94,1% e do teste de números aleatórios comuns "falhas nos mesmos instantes" [Fato, `literatura-do-motor.md`; RN-SIM-010].
5. **Esteira: concordo com ressalva** (ver T2).
6. **Defeitos e contador: concordo com ressalva.** Dois problemas:
   - O caso "retrabalho sem limite → 1/(1−p)" de `simulation.md` não é representável, porque todo limite é finito (RN-SIM-006). Proponho reescrever o caso com a fórmula exata do limite n, E[N] = (1−p^{n+1})/(1−p) e P(refugo) = p^{n+1} [Estimativa, relatório Escolha 5]. Com n = 10 e p = 0,1, o erro em relação a 1/(1−p) é ~10⁻¹¹.
   - **Impasse (deadlock) em laço de retrabalho.** Considere a estação S, que manda a peça defeituosa ao buffer B, e B, que alimenta S. Se B está cheio, S fica bloqueada segurando a peça. A cabeça de B espera S esvaziar, e nada mais se move [Estimativa: segue do BAS com capacidade finita; o material não traz fonte]. A fila de eventos não esvazia, porque a fonte e as falhas continuam gerando eventos, então o motor não para sozinho. É preciso uma regra: detectar o ciclo de bloqueios e encerrar com um código de erro, ou avisar no editor sobre ciclos.
7. **Roteamento: concordo com ressalva.** Para o caso "k estações paralelas = k/c", a peça **não pode se comprometer com um destino ocupado**. Se o destino for sorteado ou escolhido enquanto todas as estações estão ocupadas e a peça esperar por ele, uma estação pode ficar ociosa com peça esperando, e a capacidade cai abaixo de k/c [Fato, `literatura-do-motor.md`, k paralelas]. Isso é semântica do esquema, não só desempate do sub-plano 5.
8. **Padrões: concordo.** ρ = 50/60 ≈ 0,83 fica logo abaixo do limite de 0,85 da RN-SIM-011 [Estimativa].
9. **Limites: concordo com ressalva.** Falta um **piso**: tempo entre chegadas fixo igual a 0 (ou quase 0) gera infinitas chegadas no mesmo instante. Com Q1(b), viram infinitas perdas [Estimativa]. O teto de eventos do ADR-0011 apanha o caso, mas tarde. Exigir tempos > 0 e velocidade > 0 na validação.
10. **Cenários: concordo.** Isso preserva o pareamento elemento a elemento [Fato, relatório, Escolha 9].

## Em aberto

- **Q1: concordo com (b), por razão mais forte que a didática.** Com (b), os instantes de chegada são exógenos: iguais entre cenários com a mesma semente. Com (a) e T6, qualquer mudança a jusante desloca todas as chegadas seguintes, o que degrada os números aleatórios comuns da RN-SIM-010 [Estimativa]. Com (b), a fração perdida pode ser **validada**: com chegadas Poisson, ela é igual a p_K do M/M/1/K. Proponho um caso novo: M/M/1/K com K pequeno, chegadas perdidas / chegadas = ρ^K(1−ρ)/(1−ρ^{K+1}) [Fato secundário, fórmula KTH no relatório]. Com (a) e T6, as chegadas suprimidas nem são sorteadas, então não dá para contá-las. O λ de Little passa a ser o das chegadas aceitas, e a LL.2 não muda [Estimativa].
- **Q2: concordo com ressalva.** O 94,1% **não depende da distribuição do reparo**: pela teoria de renovação, a fração em operação é E[up]/(E[up]+E[down]) [Estimativa]. A exponencial, porém, tem coeficiente de variação ao quadrado 1, contra 0,5 da Erlang-2 com a mesma média [Estimativa, propriedade da distribuição], e isso infla filas e WIP. Isso precisa ser dito na interface. Ressalvas:
  - gravar o reparo como objeto de distribuição (`{type: "exponential", meanMin}`), e não como escalar `mttrMin`. Assim a troca futura não exige migração, e fica coerente com a T5, que deixa o cenário trocar o tipo;
  - a lognormal exp(μ+σ·Φ⁻¹(u)) **já é inversão com um uniforme** e reusa o AS 241 e o `exp` próprio. Ela respeita o princípio do item 6 e só falta na lista. Um ADR complementar é barato [Palpite: nenhuma fonte do material a recomenda para reparo].
- **Q3: concordo.** Um ano em segundos (3,15·10⁷) não tem problema de precisão em double [Estimativa]. Complementar com o piso do item 9.

## Técnicas

- **T1: concordo.** Com calendário e retomada, uma estação saturada com ciclo fixo c tem vazão = A/c no longo prazo [Estimativa]. Proponho esse caso de validação: liga a disponibilidade à vazão.
- **T2: concordo com ressalva.** O intervalo mínimo de entrada deve ser medido em **distância percorrida pela correia** (tempo em movimento), não em tempo de relógio. Senão, depois de uma parada, duas peças entram com menos de 1 m entre si [Estimativa]. Caso de validação: numa linha determinística, a esteira soma τ ao lead time, e a vazão não muda se C/τ ≥ 1/t_max [Estimativa].
- **T3: concordo com ressalva.** O sorteio de roteamento e o de defeito precisam de **sequências próprias, separadas da do tempo de serviço**. Se compartilharem a sequência, mudar `defectRate` de 0 para 0,1 desloca todos os tempos de serviço seguintes e quebra o pareamento [Estimativa; ADR-0011 item 5 prevê "uma sequência por elemento aleatório" sem separar propósitos]. A proposta não diz isso.
- **T4: concordo.** Com p diferente por estação, a validação usa o produto por passagem [Fato, relatório, Escolha 5].
- **T5: concordo.** A inversão é monótona, então trocar o tipo mantém o alinhamento dos uniformes [Fato, ADR-0011 item 6]. Desde que as sequências sejam ligadas a `id` e propósito, não à ordem [Fato, `literatura-do-motor.md`].
- **T6: discordo** (fica sem efeito com Q1(b)). Se o dono mantiver (a), o relatório mostra que T6 e "pausar o relógio" divergem com chegadas fixas, e nenhuma das duas permite contar a demanda suprimida [Fato, relatório D1].

## Lacunas que quebram validação ou enganam o aluno

1. A fila da fonte conta no WIP e no lead time (M/M/1).
2. Uma sequência por propósito (serviço, defeito, roteamento, falha, reparo).
3. Impasse em laço de retrabalho.
4. A peça não se compromete com um destino ocupado (k/c).
5. Falha durante o bloqueio.
6. Piso nos tempos.
7. Casos novos: perda no M/M/1/K, vazão A/c, esteira determinística; reescrever o caso do retrabalho com limite.
