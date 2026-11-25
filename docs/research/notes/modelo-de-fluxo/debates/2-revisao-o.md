# Revisão O (orientador de mestrado): proposta v2 do modelo de fluxo

## 1. Onde está (e onde não está) a contribuição

- **Não é contribuição:** cena que só reproduz um log. [Fato] O Proof Animation já fazia animação "postprocessing" a partir de um *trace file* ordenado no tempo (Henriksen, WSC 1996/1998: https://www.informs-sim.org/wsc96papers/064.pdf, https://www.informs-sim.org/wsc98papers/032.PDF). Simulador de eventos discretos no navegador para ensino também já existe: Sim4edu (Wagner, WSC 2017, https://www.informs-sim.org/wsc17papers/includes/files/360.pdf) e Tao (Adduri e Schruben, WSC 2017, https://www.informs-sim.org/wsc17papers/includes/files/045.pdf). [Fato secundário, só trecho de busca] Os dois exigem escrever JavaScript. Diferença real do Takt: o usuário não programa. Isso é produto, não ciência.
- **Contribuição técnica possível:** reprodutibilidade bit a bit entre motores JavaScript. Pesquisei "cross-browser reproducibility simulation", "Math.exp differ across browsers simulation" e "portable reproducible RNG". Só achei relatos de bugs e o Randompack (Jónasson, arXiv 2605.05099, maio de 2026), uma biblioteca em C que "gives compatible results across programming languages", sem JavaScript. [Palpite] O nicho (DES no navegador) parece vazio, mas a ideia geral não é nova, e isso não basta para uma dissertação. Ponto fraco: o efeito na trajetória ainda é **[Palpite] no próprio ADR-0014** ("a trajetória inteira diverge"). Ninguém mediu.
- **Contribuição mais forte:** educacional. [Fato] Torres Júnior et al. (2022, *Production* 32, https://scielo.br/j/prod/a/4h9JD83GZtyFkTCtmFptvsN/abstract/?lang=en), com 178 alunos brasileiros de engenharia de produção num desenho fatorial 2×2×2: "the students did not correctly identify the effects of increasing resource utilization and the variability". [Fato] A revisão de Despeisse (WSC 2018, https://research.chalmers.se/en/publication/509691) organiza os jogos de engenharia industrial por resultado cognitivo e afetivo. Sobre Littlefield, Snider e Balakrishnan (INFORMS ITE 2013) relatam pesquisa de satisfação, não ganho de aprendizagem [Fato secundário]. Não achei pré e pós-teste com controle para gargalo, WIP e lead time (buscas: "pre-test post-test bottleneck WIP simulation", "JaamSim teaching evaluation"). [Palpite] Essa lacuna é a dissertação.

## 2. Posição em Q1 e Q2

**Q1: voto (b), perder a chegada e contá-la.** As razões, pela ordem de peso para a pesquisa:
1. **Números aleatórios comuns.** [Estimativa, supondo a regra D1 do relatório] Em (a), a fonte sorteia em ritmo que depende do estado da linha. Depois do primeiro bloqueio, o k-ésimo uniforme cai em instantes diferentes em cada cenário, e o pareamento se perde justamente onde a comparação interessa (linha saturada). Em (b), as chegadas são um processo exógeno, idêntico entre cenários.
2. **Validação.** (b) é o M/M/1/K, com p_K em forma fechada para qualquer K. Em (a), com chegada fixa ou triangular, o resultado depende de uma regra que nenhuma fonte documenta (relatório, D1).
3. **Validade externa.** A demanda não some no mundo real. O "invalid model" do tutorial do Plant Simulation (Twente) vale contra (a).
4. **Variável mensurável.** "Pedidos não atendidos" vira um indicador de nível de serviço que o aluno pode prever, o que é útil para a PQ-B.

[Palpite] Se o dono quiser (a) para a "matéria-prima limitada", que entre depois, como modo explícito. Gravar já `onQueueFull: "lose"` (um enum de um valor só) evita migrar o esquema.

**Q2: voto (a), mas a especificação ainda não está pronta.** Seguir com a linha parada contamina a estatística: misturar réplicas travadas com réplicas normais dá uma saída bimodal, e o IC t de 95% deixa de significar alguma coisa [Estimativa]. Descartar as réplicas travadas e calcular o IC só com as outras é viés de sobrevivência. Exijo três coisas:
- **Detecção definida:** em (b), a fonte nunca esvazia a lista de eventos, então "sem eventos" não detecta nada. É preciso um ciclo no grafo "bloqueado esperando por", checado a cada bloqueio, de forma determinística.
- **Saída por réplica:** status `completed | deadlocked | limitExceeded`, instante do travamento e IDs do ciclo. A execução é inválida se qualquer réplica travar, e o resultado diz quantas travaram.
- **Reprodução:** a réplica travada pode ser reaberta pela semente e pela subsequência, para mostrar o ciclo na cena.

## 3. O que na v2 fortalece ou enfraquece uma dissertação

**Fortalece:**
- Valores explícitos no documento, versão do motor e semente. Isso cobre boa parte do checklist STRESS-DES (Monks et al., *J. Simulation* 13(1), 2019, doi 10.1080/17477778.2018.1442155) [Fato secundário, conteúdo do checklist não conferido item a item].
- Cenários que só trocam valores (comparação pareada limpa).
- Sequências por chave (a edição de um elemento não desloca as outras).
- Casos novos com forma fechada (M/M/1/K, geométrica truncada).

**Enfraquece:**
- **Critério "passa dentro do IC" com semente fixa.** É um teste determinístico de regressão, não uma validação. Num capítulo de validação, quero a **cobertura** do IC de 95% em muitas macro-réplicas (algo como 1.000 sementes) para cada caso, com a taxa de cobertura e o erro.
- **Regras de borda sem fonte** (relógio da fonte, espaçamento da esteira, "nada entra nem sai no reparo", tempo restante após a falha). São legítimas, mas cada uma precisa estar escrita no modelo conceitual. Uma banca vai perguntar.
- **Reparo exponencial** por imposição do ADR-0011. Defensável, mas é uma simplificação declarada, não "o padrão".
- **Validação de uso** com "uma pessoa de fora, 5 minutos" (PRODUCT.md). Para mestrado, isso é teste de usabilidade, não avaliação.

## 4. Perguntas de pesquisa candidatas

**PQ-A (reprodutibilidade):** com as funções nativas, que fração das conclusões didáticas de uma rodada muda de um navegador para outro? São elas: qual é o gargalo, qual cenário vence e se o IC dos dois cenários se sobrepõe.
- Avaliação: plantas de referência × os seis grupos nativos medidos × N sementes; distância entre as trajetórias e taxa de conclusões invertidas.
- A infraestrutura já existe (workflow D4).
- [Palpite] Dá um artigo de WSC, não uma dissertação.

**PQ-B (aprendizagem, a principal):** montar e "quebrar" a linha no Takt melhora a previsão dos efeitos de utilização, variabilidade e capacidade de buffer sobre o lead time e a fila, em comparação com uma aula analítica?
- Avaliação: quase-experimento com grupo controle ou cruzado, usando como pré e pós-teste o instrumento de Torres Júnior et al.
- Exige aprovação de comitê de ética e consentimento. [Palpite, de memória] Pelo sistema CEP/CONEP; verificar.
- Também exige telemetria com dados pessoais, conforme o ADR-0007 e a LGPD.

**PQ-C (método no modo didático):** em linhas com buffers finitos, bloqueio e falhas, o MSER-5 dá cortes cujos IC cobrem a média de regime? E quanto o modo "turno" engana o aluno em relação ao regime?
- Avaliação: cobertura contra execuções muito longas de referência.
- Novidade não pesquisada [Palpite]; o revisor M deve opinar.

## 5. O que o esquema v1 (e a saída do motor) precisa guardar já, sem excesso

1. **Manifesto da execução:** `schemaVersion`, `engineVersion`, semente, modo, corte do aquecimento, número de réplicas e **hash do documento canônico** [Palpite: barato, liga cada resultado a uma planta exata].
2. **Indicadores por réplica**, não só a média e o IC. Sem eles, as PQ-A e PQ-C não se fazem depois.
3. **Status de término por réplica** (Q2) e `lostArrivalCount` por fonte (Q1).
4. **Avisos emitidos** na execução (ρ > 0,85 no turno, travamento), porque são intervenções didáticas que a PQ-B mede.
5. **Fora do esquema:** a identidade do aluno e o histórico de edições. Isso é telemetria da aplicação, com consentimento, e nunca vai dentro do documento da planta.
