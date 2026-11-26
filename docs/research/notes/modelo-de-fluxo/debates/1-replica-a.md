# Réplica A ao revisor B

## Onde B tem razão e eu não vi

- **Estado de duração zero (B, item 1).** É verdade. Quando dois eventos caem no mesmo instante, a ordem dos tipos de evento decide se M1 aparece "bloqueada" por 0 s. Na média temporal, esse estado não pesa, mas conta como episódio e pisca na cena [Estimativa]. Proposta conjunta: fixar a ordem no plano e testar como propriedade que qualquer ordem dá o mesmo Dₙ.
- **Sequências por propósito.** A chave `<id>:<propósito>` já existe [Fato, `docs/architecture/sim-engine.md`, Índice da sequência]. Minha T3 se reduz a uma ação: o sub-plano 3 deve listar os propósitos (tempo de serviço, defeito, roteamento, tempo até a falha, reparo), para que defeito e serviço nunca dividam uma sequência.
- **Lacuna A (destino da peça que estoura o limite).** Eu não vi. Ela pesa no rigor, porque sem `scrap` conectado a fórmula P(refugo) = p^{n+1} não tem como ser medida.

## Onde B erra ou engana

- **"Migração barata" do reparo (Q2).** O critério de base sólida põe "Variabilidade como objeto" entre o que é caro de migrar e entra já [Fato, `docs/product/plant-model.md`]. O exemplo grava `failure: { mtbfMin, mttrMin }` como escalares, o que contradiz esse critério. Mantenho: `repair: { dist: "exponential", meanMin }`.
- **Lacuna B ("o efeito some no IC").** Não com o par do caso de validação.
  - Sem falhas, A = 100% sem variância. Com 240 e 15, a média é 94,1% e a meia-largura é ±2,2 p.p. em 30 turnos [Fato, `literatura-do-motor.md`], então o IC exclui o 100%.
  - O risco real é a **replicação animada**. P(nenhuma falha em 480 min) ≈ e^{−480/240} ≈ 13,5% [Estimativa: tempo até a falha exponencial, máquina começando em operação]. Com a semente 42 fixa, isso se verifica uma vez.
- **Item 2 de B (buffer antes de cada estação):** concordo. O motivo de rigor é que a confirmação do gargalo "pela fila acumulada" falha com buffers finitos [Fato, Roser et al. em `literatura-do-motor.md`]. Por isso, a planta de exemplo precisa de um gargalo com folga, não de um empate.

## Posições pedidas

- **`byQuality { good, rework?, scrap }`: concordo.**
  - A regra precisa dizer que o contador sobe **ao enviar para `rework`**.
  - Sem `rework`, P(refugo) = p.
  - Isso cria um caso de validação exato com dois destinos.
  - O exemplo do `plant-model.md` mostra também o **impasse** que apontei. Em m1 → rw1 → m1, as conexões são diretas e não há buffer. m1 fica bloqueada com a peça defeituosa porque rw1 está ocupada. rw1 termina e espera m1, que segura a peça. Nada mais se move [Estimativa]. O exemplo atual travaria o motor, e isso precisa de uma regra de detecção.
- **Padrão de falha ao ligar: concordo com ressalva.** Prefiro **240 e 15**:
  - coincide com o caso dos 94,1%, então o professor confere o número no regime estável;
  - o MTTR de 15 min equivale a 18 ciclos de 50 s, o que basta para bloquear a montante e deixar faminto a jusante com buffer 10 [Estimativa].
  - Com 60 e 10, a queda fica maior (A ≈ 85,7%), sem caso que a valide. Nenhum dos dois pares tem fonte [Palpite].
  - O que resolve: rodar a planta de exemplo com a semente 42 e conferir que a replicação animada tem ao menos uma falha.
- **`defectRate > 0` sem regra por qualidade: concordo em recusar.** Sumir com o defeito em silêncio mostra qualidade de 100% contra um parâmetro que diz outra coisa. Isso engana o aluno. Ressalva: a validação tem de rodar **em cada cenário já aplicado**, porque um cenário pode subir `defectRate` de 0 numa estação sem `byQuality` [Estimativa; o item 10 deixa trocar valores, mas não regras].
- **`lengthM` derivado da grade: discordo.** O modelo fixa que "`pos` e `rot` servem ao 3D; o motor usa elementos, conexões, parâmetros e regras" [Fato, `plant-model.md`]. Derivar o comprimento das células faria mover um elemento mudar o resultado, e criaria uma constante de metros por célula sem fonte. Os cenários também não mudam o layout. Alternativa: `lengthM` livre, trânsito calculado no painel (ponto de B que eu adoto) e, no máximo, um aviso sem bloqueio quando a esteira for visualmente incoerente.
- **Planta de exemplo no sub-plano 3: concordo com ressalva.** O documento da planta e o teste de validação do esquema cabem no 3. O teste que **roda** a história do demo depende de falhas e replicações, que são o "mostrável" dos sub-planos 5 e 6 [Fato, `literatura-do-motor.md`, conclusão]. Esse teste fica lá e verifica: sem impasse, gargalo fora do empate, uma falha na replicação animada e IC do OEE que exclui o valor base.

## Posição conjunta

- Q1 é (b), pelos números aleatórios comuns, e a T6 fica sem efeito.
- A fila da fonte entra no WIP e no lead time.
- Q3: teto de um ano por unidade, com aviso quando o MTBF passar da duração.
- Rótulo "pedidos não atendidos".

## Ainda em disputa

- **Forma do reparo.** Para mim é objeto já; para B, escalar. Resolve: ler o critério de base sólida, que já me parece decidir.
- **Par padrão de falhas.** Resolve: medição na planta de exemplo.
- **Lacunas que B não tratou:** destino sem compromisso (o caso k/c), piso nos tempos e o caso de retrabalho reescrito com limite.
