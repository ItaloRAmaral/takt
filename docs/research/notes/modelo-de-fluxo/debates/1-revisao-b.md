# Revisão B: produto didático

Lente: o que aluno e professor entendem na cena e no resultado, a linha de 3 estações rodando em 5 minutos sem ajuda, a história do demo de 2 minutos, e um esquema e um motor simples.

## Itens decididos

1. **Estação cap. 1, BAS, bloqueado ≠ faminto: concordo com ressalva.** A RN-HLP-010 já exige "bloqueada" e "sem material" na cena [Fato: rules/help.md]. Ressalva: com tempos fixos iguais (o padrão de 50 s), o fim de M1 e a saída de M2 caem no mesmo instante. O desempate é "tempo, tipo de evento, inserção" [Fato: ADR-0011 item 3]. Se a ordem dos tipos de evento estiver errada, M1 aparece "bloqueada" por 0 s e pisca na cena [Estimativa]. Alternativa: fixar no plano que a liberação de vaga vem antes da tentativa de passar a peça, e que a reprodução não mostra estado de duração zero.
2. **Espera só em buffers: concordo.** O WIP fica visível. Falta uma consequência: o passo 2 do demo é "ver a fila crescer na estação mais lenta" [Fato: mvp-scope.md], e sem buffer à frente dela só se veem estações bloqueadas e a fila da fonte. Por isso, a fábrica de exemplo precisa ter buffer antes de cada estação [Estimativa].
3. **Fila da fonte: concordo com ressalva.** O caso M/M/1 espera "4 itens no sistema" [Fato: simulation.md], ou seja, a fila conta. A fila da fonte precisa entrar no WIP e no lead time, e a cena deve desenhá-la como a fila à frente do primeiro elemento. Do contrário, o aluno vê uma pilha que não aparece nos números [Estimativa].
4. **Falhas no calendário: concordo.** O "Saiba mais" deve dizer que a máquina pode quebrar parada (D6 do relatório).
5. **Esteira: concordo com ressalva.** Se `lengthM` for livre, uma esteira de 2 células pode dizer 50 m, e a cena mente [Estimativa]. Alternativa: derivar `lengthM` das células ocupadas, com tamanho de célula fixo [Palpite], ou recusar a incoerência na validação. O relatório deixa isso em aberto (D7).
6. **Defeitos e retrabalho: concordo com ressalva grave (ver "Lacunas", item A).**
7. **Roteamento: concordo.**
8. **Padrões: concordo com ressalva.** Três estações de 50 s fixos não têm gargalo, só um "empate" (RN-HLP-008). Isso é aceitável para "roda", mas a explicação precisa cobrir esse caso. Falta o padrão de quando o usuário **liga** as falhas (ver "Lacunas", item B).
9. **Limites: concordo.**
10. **Cenários só com valores: concordo.**

## Em aberto

- **Q1: concordo com (b), por um motivo mais forte que o do coordenador.** Com (b), as chegadas são uma função só da semente: os dois cenários recebem exatamente a mesma demanda, e a comparação do passo 4 do demo fica limpa [Estimativa]. Com (a) mais T6, os instantes de chegada dependem do bloqueio, e cada cenário recebe uma demanda diferente. (b) também elimina a T6 e o estado de "peça retida" na fonte, o que simplifica o motor [Estimativa]. Ressalva de rótulo: numa fábrica, "chegadas perdidas" soa estranho. Proponho "pedidos não atendidos (fila da fonte cheia)", com dica [Palpite].
- **Q2: concordo (exponencial).** A lição é A = MTBF/(MTBF+MTTR), que não depende da forma do reparo [Fato: relatório, Law]. Adicionar a distribuição do reparo depois é uma migração barata, porque plantas antigas ficam com "exponencial" (plant-model.md, critério de "base sólida"). A cena vai mostrar muitos reparos curtíssimos [Fato: moda em zero, relatório]. O "Saiba mais" deve chamar isso de simplificação.
- **Q3: concordo (1 ano para todo tempo).** Uma regra e um código de erro só. Ressalva: o teto deve ser expresso na unidade de cada campo (525 600 min, 31 536 000 s), com o ano definido como 365 dias. Proponho também um aviso, sem bloquear, quando `mtbfMin` passar da duração do cenário ("quase nunca vai falhar neste turno") [Palpite].

## Decisões técnicas

- **T1: concordo.** "A peça espera na máquina parada" se explica em uma frase.
- **T2: concordo.** O espaçamento comprimento ÷ capacidade também dá à cena onde desenhar cada peça.
- **T3: concordo.** O aluno digita 70/30 e, para terços, 33/33/34.
- **T4: concordo.** É a regra mais simples de explicar.
- **T5: concordo.** Ligar falhas no cenário é o próprio passo 5 do demo. Trocar o tipo de distribuição não quebra os números aleatórios comuns de outros propósitos, porque a chave é `<id>:<propósito>` [Fato: sim-engine.md]. O teste da RN-SIM-010 deve cobrir esse caso.
- **T6: moot se Q1 = (b).** Se ficar (a), concordo com a T6 em vez de pausar o relógio, porque não guarda tempo restante.

## Lacunas que a proposta não cobre

A. **Peça que estoura o limite de retrabalho vai para onde?** A RN-SIM-006 manda para o refugo, mas o item 7 só aceita destinos conectados, e `byQuality` tem só `good` e `defective` [Fato: plant-model.md]. No exemplo do plant-model, `scr1` nem está conectado, ou seja, ali é um "elemento solto" e a planta seria inválida (RN-EDT-004). Alternativa: `byQuality { good, rework?, scrap }`. A peça vai para `rework` enquanto o contador está abaixo do limite e para `scrap` depois; sem retrabalho, o defeito vai direto para `scrap`. Os três destinos precisam estar conectados.

B. **Padrão de falha ao ligar as falhas.** O passo 5 do demo ("ver o OEE cair") depende dele. Um MTBF alto num turno de 8 h faz muitas replicações não terem falha nenhuma, e o efeito some no IC [Estimativa]. É preciso fixar o par padrão de `mtbfMin` e `mttrMin`; o par 60 e 10 daria A ≈ 86%, mas isso é só um palpite, sem fonte.

C. **`defectRate > 0` sem regra por qualidade.** Ou a planta é recusada com `INVALID_PLANT`, ou o defeito some calado. Proponho recusar, com o erro marcado na estação [Estimativa].

D. **Fábrica de exemplo.** O demo é o principal argumento de portfólio, e nenhuma decisão de hoje garante que ele funcione: buffers à frente das estações (item 2), um gargalo claro e o par de falhas do item B. A fábrica de exemplo deveria ser um artefato do sub-plano 3, com um teste que rode a história do demo [Palpite].

E. **Fora do escopo, mas confunde:** a cena reproduz uma replicação, e o resultado mostra a média de 30. O aluno vai contar peças na cena e achar outro número. Isso deve ficar registrado para o sub-plano de reprodução.

## Sobre o excesso de engenharia

Nada da proposta é supérfluo. O que mais pesa é o trio `lengthM`, `speedMPerMin` e `capacity` da esteira: o painel deve mostrar o trânsito calculado ("30 s") ao lado, para o aluno não ter que fazer a conta.
