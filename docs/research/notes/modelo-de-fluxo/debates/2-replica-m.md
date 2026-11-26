# Réplica M (metodologia) às revisões P e O

O dono pôs o produto em primeiro lugar. Por isso, rebaixo a cobertura do IC a teste noturno e deixo as perguntas de pesquisa de O fora desta decisão.

## Onde eles têm razão e eu não vi

- **P, gargalo pela utilização de processamento.** Erra quando há falhas. O exemplo dele (M2 com 52 s contra M3 com 53,1 s efetivos) está certo [Estimativa, conferida]. Eu não tinha visto.
- **P, `idealCycleSec`.** Resolve o ponto do OEE com ciclo 0 que deixei aberto.
- **P, passo 4 do demo.** Numa linha subcarregada, a vazão é a taxa de chegada; isso é conservação de fluxo. Concordo.
- **O, detecção do impasse.** Com Q1(b), a lista de eventos nunca esvazia, então "sem eventos" nunca detecta o travamento. Eu propus o ciclo, mas sem dizer por que o critério simples falha.

## Onde erram

- **P, "fração ativa" atribuída a Roser.** Não é o método de Roser.
  - **[Fato]** O critério dele é outro: "The machine with the longest average active period is considered to be the bottleneck".
  - **[Fato]** E ele critica justamente o método da porcentagem ativa: "it often cannot be said with confidence which entity is the bottleneck" ([preprint WSC 2001](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)).
  - **Minha posição:** a fração ativa (processando mais em reparo) basta no v1 e corrige o exemplo. Mas o gargalo deve sair com a sua incerteza: a fração de replicações em que cada estação ficou em primeiro, ou o IC pareado da diferença entre as duas primeiras. Os mesmos contadores servem depois para a duração média ativa. No esquema, o custo é zero.
- **P, caso "vazão boa = (1 − p)/c, qualquer que seja o limite".**
  - A fórmula está certa [Estimativa].
  - O caso, como escrito, trava: uma estação saturada com laço para ela mesma, com BAS e buffer finito, chega ao impasse com probabilidade 1 se puxar as peças novas antes das retrabalhadas.
  - Isso revela uma lacuna que **nenhum de nós** viu: **de qual entrada uma estação com dois antecessores puxa** quando os dois têm peça. Essa regra muda o resultado e a chance de travar.
- **O, "o pareamento se perde" em (a).** Ele enfraquece, não some: o k-ésimo intervalo continua usando o k-ésimo uniforme. O voto em (b) não depende disso.
  - **O que resolveria:** medir a variância da diferença pareada sob (a) e sob (b) numa planta saturada. É um experimento barato.

## Posições conjuntas

- **Q1:** (b).
- **Q2:** (a). A execução é inválida se qualquer replicação travar, e nunca se descartam as replicações travadas antes de calcular a média.
- Cada simplificação sem fonte fica escrita no modelo conceitual.

## Os pontos de P

- **Gargalo pela fração ativa: sim**, com incerteza (acima). É trabalho do sub-plano 4.
- **OEE no gargalo, com faminto e bloqueado como perdas externas: sim.** Cuidado: o gargalo pode mudar de uma replicação para outra. Defino o gargalo na execução e calculo o OEE dele em cada replicação.
- **`idealCycleSec` no v1: sim, > 0, mesmo em estação com ciclo 0.**
  - O padrão é a média **realizada** do ciclo. Na normal truncada, essa média difere do parâmetro.
  - A validação "ideal ≤ média" não garante P ≤ 100% numa replicação, então a interface precisa admitir P > 100% ou explicar.
- **Demo sobrecarregado (fonte de 45 s; estações de 40, 44, 56, 50 e 42 s): sim.**
  - A folga entre as duas primeiras estações é de 12% antes e 14% depois, o que torna o gargalo inequívoco [Estimativa].
  - Com Q1(b), cerca de 20% das chegadas são perdidas antes da melhoria (1 − 45/56) [Estimativa].
  - Ressalva: na sobrecarga, o WIP e o lead time medem as capacidades dos buffers; o "Saiba mais" deve dizer isso. Os números precisam ser fixados por um teste.
- **Falha da esteira: mais forte que P, fora do esquema v1.** "Avançado" ainda obriga a implementar e validar o congelamento, que não tem fonte. Acrescentar o campo depois é migração barata pelo critério de `plant-model.md`.
- **"Espera na fonte" separada do lead time: sim.** É o meu "tempo no sistema" contra "lead time da linha". A validação do M/M/1 usa o primeiro.

## Os pontos de O

- **`onQueueFull: "lose"` agora: sim.** Custa nada e segue a decisão 8 (documento autoexplicativo).
- **Manifesto por replicação: sim.** Ele é saída do motor, não esquema. Deve trazer a semente e a subsequência, os indicadores por replicação (necessários para o IC pareado) e o status `completed | deadlocked | limitExceeded`.
  - **Hash do documento:** sim, mas exige forma canônica (JCS, RFC 8785) [Palpite: não conferi o custo]. Fica para o sub-plano do motor.
- **Grafo de espera a cada bloqueio: sim, com a definição completa.**
  - Os nós incluem o buffer cheio, que espera pelo destino da peça da frente.
  - Um ciclo com elemento em reparo não é impasse: verificar de novo quando o reparo terminar.
  - O custo é proporcional ao comprimento da cadeia.

## As cinco mudanças mais importantes, por ordem

**Esquema (sub-plano 3):**

1. **Falhas:** `timeToFailure` e `repair` como objetos de distribuição, separados (cada um com o próprio propósito de sequência). Normal truncada recusada em falhas no v1, porque o parâmetro não é a média. Falha da esteira fora do v1.
2. **Entrada com vários antecessores:** uma regra fixa e escrita em `rules/`. Minha proposta é a peça que espera há mais tempo, com retrabalho na frente no empate [Estimativa: reduz o risco de impasse, sem eliminá-lo]. Sem campo novo no esquema.
3. **Fonte:** `onQueueFull: "lose"`, com a contagem das perdas definida.
4. **Estação:** `idealCycleSec` > 0, com a validação e o padrão acima.
5. **Planta de exemplo e `plant-model.md`:** o exemplo validado sem laço capaz de travar, e o exemplo de `plant-model.md` corrigido, porque hoje ele trava.

**Regras a escrever agora e codificar depois (sub-planos 4 e 5):**

- ordem dos eventos simultâneos;
- impasse pelo grafo de espera, com status por replicação;
- tempos por estado e gargalo com incerteza;
- OEE no gargalo;
- tempo no sistema separado do lead time da linha, com a censura no turno declarada;
- defeito que consome sempre um uniforme por passagem;
- IC da diferença pareada entre cenários;
- teste de cobertura noturno.
