# Revisão P: engenharia de produção e ensino

**Veredito:** o modelo de fluxo é sólido. O que ensinaria algo falso está fora dele: a **definição de gargalo**, o **OEE**, que depende de estados decididos agora, e uma **história do demo** que tem um passo falso e não ensina variabilidade.

## 1. Decididos

- **BAS e espera só em buffers: sólidos.** [Fato] Roser et al. (2001) tratam "blocked" e "waiting for part" como estados inativos. Na cena, porém, "bloqueada" aparece *antes* do gargalo, e o aluno tende a culpar quem está parado [Palpite]. **Alternativa:** bloqueado e faminto com cor de sintoma (âmbar); o destaque forte fica para o gargalo e a falha.
- **Calendário, e nada entra nem sai no reparo: aceitáveis.** Uma máquina faminta que quebra perde disponibilidade sem perder vazão, e o OEE dela culparia a falha [Estimativa]. Ver a seção 3.
- **Esteira que quebra: excesso no v1.** Exige regras de congelamento sem fonte [Fato: relatório, D7], e nenhum passo do demo a usa. **Alternativa:** sem falha por padrão, com o campo em "avançado".

## 2. Adotados

- **`good`/`rework`/`scrap`, FPY e os casos novos: concordo.** Acrescento um caso que também ensina: numa estação saturada com laço de retrabalho para ela mesma, a vazão boa é **(1 − p)/c, qualquer que seja o limite** [Estimativa: cada passagem dura c e sai boa com probabilidade 1 − p]. O defeito no gargalo consome capacidade.
- **Fila da fonte no WIP: concordo.** [Palpite, memória não conferida] Hopp e Spearman medem o ciclo desde a liberação e chamam a fila anterior de *backlog*. **Alternativa:** o "Saiba mais" separa "espera na fonte" de "tempo na linha".

## 3. O que ensina o falso

- **Gargalo = maior utilização de processamento** [Fato: simulation.md]. Com falhas (o passo 5), isso erra. Exemplo [Estimativa]: M2 fixa em 52 s, sem falhas; M3 em 50 s com A = 240/255, ou seja, 53,1 s efetivos. M3 limita a vazão, mas a utilização dá 0,98 para M2 e 0,94 para M3, e o Takt destacaria **M2**. [Fato] Roser conta como ativos "Working, in repair, changing tools, serviced". Avisa também que, pela carga, "it often cannot be said with confidence which entity is the bottleneck". **Alternativa (sub-plano 4):** gargalo pela fração **ativa**, processando mais em reparo.
- **OEE por estação.** [Fato] A OEE.com diz que ele "should always be measured at the constraint step", e que "External Losses are Starved … and Blocked". **Alternativa:** OEE da linha medido no gargalo; nas outras estações, faminto e bloqueado aparecem como perdas externas, fora da disponibilidade. Sem isso, o aluno aprende a subir o OEE de quem não é gargalo.
- **Desempenho sem referência.** [Fato] Para a OEE.com, "Ideal Cycle Time is the theoretical maximum throughput". O esquema não tem ciclo ideal. Se o ideal for a média do ciclo, P pode passar de 100% numa replicação [Estimativa]. Ver a adição 2.

## 4. Demo e professor

- **O passo 4 ("a vazão sobe") é falso numa linha subcarregada.** Com ρ < 1, a vazão é a taxa de chegada nos dois cenários. Melhorar o gargalo reduz o WIP e o lead time, não a vazão [Estimativa: conservação de fluxo]. Para a vazão subir, a linha precisa estar sobrecarregada. Aí a fila da fonte enche e o aviso da RN-SIM-011 dispara, e o demo deve explicar o aviso. **Alternativa:** a planta de exemplo tem números testados no sub-plano 3. Um ponto de partida [Palpite]: fonte exponencial de 45 s e estações de 40, 44, 56, 50 e 42 s. Com M3 em 44 s, o gargalo vai para M4, e a vazão sobe de cerca de 1/56 para 1/50 peça por segundo.
- **Falta o "aha" da variabilidade, o equívoco mais documentado.** [Fato] Mullen (ASEE 2013) relata alunos que insistem que "if λ is less than μ, it is not possible for a waiting line to form". Um deles disse que "there must be something wrong with the simulation". [Fato] Torres Júnior et al. (2022) concluem que alunos de engenharia de produção "did not correctly identify the effects of increasing resource utilization and the variability". As lições do demo (gargalo, melhoria, falha) o raciocínio determinístico já acerta.
- **O professor precisa de pares de cenários**, só com troca de valores (item 10):
  - melhorar um não-gargalo, e nada muda;
  - mesma disponibilidade com MTTR maior;
  - ciclo fixo contra exponencial de mesma média;
  - linha subcarregada, em que o ganho aparece no lead time.

## 5. Q1 e Q2

- **Q1: (b), perder a chegada.**
  - Em (a), a sobrecarga fica muda: a vazão encosta na capacidade e nada mostra que a demanda passou dela.
  - Em (b), "demanda não atendida" é o sintoma visível, e "taxa de atendimento" é um indicador que o professor usa.
  - O "Saiba mais" deve dizer que, numa fábrica, a demanda costuma virar atraso, não venda perdida [Palpite].
  - A liberação limitada pelo WIP da linha (CONWIP), que é a boa intuição por trás de (a), fica para depois, como modo explícito da fonte.
- **Q2: (a), parar e mostrar o ciclo**, desde que a replicação travada **não entre na média calada**.
  - O resultado diz "7 de 30 travaram", e a comparação fica bloqueada, como na RN-SIM-010.
  - Em (b), a média mistura replicações com vazão zero e normais, e o IC perde o sentido [Estimativa].
  - A planta de exemplo não tem laço capaz de travar.

## 6. Três adições

1. **Tempo por estado de cada estação** (processando, reparo, faminta, bloqueada), em barra empilhada, e o gargalo pela fração ativa.
   - Esquema v1: custo zero.
   - Motor (sub-plano 4): contadores, custo baixo.
   - Gráfico: marco 5.
   - É o gráfico que mais ensina bloqueio e fome.
2. **`idealCycleSec` na estação**, com padrão igual à média do ciclo e validação ideal ≤ média.
   - Esquema v1: entra agora, porque o documento grava todos os valores.
   - Dá sentido ao P do OEE e permite o exercício "máquina abaixo da velocidade de placa".
3. **Pacote de exercícios**, sem mudar o esquema:
   - a planta "jogo dos dados" (linha balanceada com variabilidade, com vazão abaixo da capacidade média);
   - os pares da seção 4;
   - a previsão de Kingman (VUT) ao lado do valor simulado.
   - Marcos 5 e 6, com custo de conteúdo e testes. A comparação analítico × simulado serve também à dissertação.

## Fontes

- Roser, Nakano e Tanaka (2001): https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf
- OEE.com FAQ: https://www.oee.com/faq/
- Mullen (2013), ASEE: https://peer.asee.org/22640.pdf
- Torres Júnior et al. (2022), Production 32: https://scielo.br/j/prod/a/4h9JD83GZtyFkTCtmFptvsN/abstract/?lang=en
- [Fato secundário, resumo de busca] A fórmula de Hopp e Spearman, c_e² = c_0² + (1 + c_r²)·A(1 − A)·m_r/t_0, sustenta o par "mesma A, MTTR maior". É preciso conferi-la no cap. 8 antes de citar.
