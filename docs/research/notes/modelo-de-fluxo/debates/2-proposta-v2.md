# Proposta do modelo de fluxo do esquema da planta v1 (Takt), versão 2

Contexto: Takt é um simulador didático de fábrica por eventos discretos, no navegador, com cena 3D que só reproduz o log do motor (PDR-0008). Projeto de portfólio primeiro, produto depois; **pode virar uma dissertação de mestrado**. Público: professor e aluno de engenharia de produção. Elementos do MVP: fonte, estação, buffer, esteira, expedição, refugo. Motor: eventos discretos, MRG32k3a com uma sequência por chave `<id>:<propósito>` (números aleatórios comuns, RN-SIM-010), uma subsequência por replicação, amostras só por inversão com um único uniforme (ADR-0011 item 6), `log`/`exp` próprios para dar os mesmos bits em todo navegador (ADR-0014), três modos (turno, continuar, regime estável com MSER-5), replicações com IC 95%.

Versão 1 desta proposta, a pesquisa e um debate de dois revisores (rigor × didática) estão em `../debate/` e no relatório citado abaixo. Esta versão incorpora o resultado.

## Decidido pelo dono do produto

1. Estação: capacidade 1; bloqueio depois do serviço; "bloqueado" distinto de "faminto".
2. Espera entre estações só em buffers explícitos, capacidade editável.
3. Fonte com fila de saída visível e capacidade finita editável (o dono recusou fila ilimitada).
4. Falhas no relógio de calendário, contadas desde o fim do reparo; MTBF = tempo de funcionamento; disponibilidade = MTBF/(MTBF+MTTR).
5. Esteira: `lengthM`, `speedMPerMin`, `capacity`; não acumuladora (para inteira); pode quebrar; nunca cria defeito.
6. Defeitos: `defectRate` na estação; contador de retrabalhos por peça somado entre estações, limite padrão 2 (RN-SIM-006).
7. Roteamento por qualidade, percentual e fila mais curta, na saída do elemento, só para destinos conectados.
8. Padrões de elemento novo (RN-EDT-003): fonte exponencial 60 s, fila 20; estação fixa 50 s, defeito 0, sem falhas; buffer 10; esteira 5 m a 10 m/min, capacidade 5; limite de retrabalho 2; cenário turno 8 h, 30 replicações, semente 42. Documento salvo com todos os valores explícitos; padrões só no editor.
9. Limites: 500 elementos, 2000 conexões, capacidades até 10 000, duração do cenário até 720 h; teto de 1 ano por campo de tempo (só contra valores absurdos).
10. Cenários só trocam o valor inteiro de parâmetros de elementos existentes e o limite de retrabalho; não criam nem removem elementos ou conexões.
11. **Durante o reparo, nada entra nem sai da máquina** (inclusive a peça pronta de uma máquina que quebrou bloqueada). Decidido em 25/11/2026.

## Adotado depois do primeiro debate (coordenador; dono ainda pode vetar)

- Regra por qualidade com três saídas: `good`, `rework` (opcional) e `scrap`, todas conectadas; a peça vai para `rework` enquanto houver retrabalhos e para `scrap` depois do limite; o contador sobe ao mandar para retrabalho.
- Tempo até a falha e reparo como objetos de variabilidade (as mesmas 4 distribuições do ciclo), padrão exponencial; o usuário pode escolher triangular para o reparo (moda positiva) sem ADR novo. Padrão ao ligar falhas: MTBF 240 min, MTTR 15 min (o par do caso de validação de 94,1%).
- A fila da fonte conta no WIP; o lead time começa na criação da peça.
- `defectRate > 0` sem regra por qualidade com `scrap` conectado → planta inválida; a validação roda também em cada cenário depois de aplicar as sobreposições.
- Piso acima de 0 no intervalo da fonte, no MTBF e no comprimento e velocidade da esteira; ciclo da estação pode ser 0.
- Comprimento da esteira é parâmetro livre (posição é só do 3D); intervalo mínimo de entrada medido em deslocamento da correia (comprimento ÷ capacidade); quebrada, congela posições e retoma.
- Falha no meio do processamento: a peça termina o tempo restante depois do reparo (Law: "usually assumed").
- Percentuais inteiros somando exatamente 100; sorteio independente por peça.
- No retrabalho vale o `defectRate` da estação da passagem.
- Planta de exemplo (cinco estações, com buffers) como documento validado neste sub-plano; o teste da história do demo nos sub-planos 5 e 6.
- O caso de validação "retrabalho sem limite, passagens = 1/(1−p)" vira "com limite n: E[passagens] = (1 − p^{n+1})/(1 − p), P(refugo) = p^{n+1}".
- Novos casos de validação candidatos: fração de chegadas perdidas = p_K do M/M/1/K; vazão A/c de estação saturada com ciclo fixo; esteira determinística soma o trânsito ao lead time sem mudar a vazão.

## Ainda com o dono do produto (opinem)

- **Q1. Fonte com a fila cheia:** (a) parar de gerar até abrir vaga (escolha inicial do dono) ou (b) perder a chegada e contá-la em "pedidos não atendidos" (padrão do Simul8; recomendação dos dois revisores e do coordenador, porque mantém as chegadas iguais entre cenários — números aleatórios comuns — e porque o tutorial do Plant Simulation chama a fonte bloqueada de risco de "modelo inválido").
- **Q2. Linha travada (deadlock)** em laços de retrabalho com bloqueio e buffers finitos (o próprio exemplo de `plant-model.md` trava): (a) parar a execução com um código próprio e mostrar o ciclo travado na cena (recomendação), ou (b) seguir até o fim com a linha parada.

## Para sub-planos posteriores

- Ordem dos eventos no mesmo instante (evitar "bloqueado" por 0 s) — sub-plano 4.
- Fila mais curta: desempate, o que conta como fila, não se comprometer com destino ocupado — sub-plano 5.
- Peça retrabalhada como perda na qualidade do OEE (OEE.com: "first pass yield") — sub-plano 5.

## Material

- Relatório da pesquisa: `docs/research/modelo-de-fluxo-da-planta.md`; notas em `docs/research/notes/modelo-de-fluxo/`.
- Primeiro debate: `1-revisao-a.md`, `1-revisao-b.md`, `1-replica-a.md` e `1-replica-b.md`, nesta pasta.
- Repositório: `docs/PRODUCT.md`, `docs/product/simulation.md` (casos de validação), `docs/product/mvp-scope.md`, `docs/product/plant-model.md`, `docs/product/rules/simulation.md`, `docs/product/rules/editor.md`, `docs/adr/0008-*.md`, `docs/adr/0011-*.md`, `docs/adr/0014-*.md`, `docs/research/literatura-do-motor.md`, `docs/research/aquecimento-em-simulacao-didatica.md`, `docs/research/precisao-de-log-e-exp.md`, `docs/plans/2026-11-04-roteiro-motor.md`.
