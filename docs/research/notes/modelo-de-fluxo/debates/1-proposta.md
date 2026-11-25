# Proposta do modelo de fluxo do esquema da planta v1 (Takt)

Contexto: Takt é um simulador didático de fábrica por eventos discretos (portfólio primeiro, produto depois). Público: professor e aluno de engenharia de produção. Elementos do MVP: fonte, estação, buffer, esteira, expedição, refugo. Esta proposta fecha as pendências do sub-plano 3 do roteiro do motor (`docs/plans/2026-11-04-roteiro-motor.md`, seção "Riscos e decisões pendentes").

## Já decidido pelo dono do produto (25/11/2026)

1. **Estação:** capacidade 1; bloqueio depois do serviço (a peça terminada fica na máquina se o destino está cheio); estado "bloqueado" distinto de "faminto".
2. **Espera entre estações:** só em buffers explícitos, com capacidade editável.
3. **Fonte:** fila de saída visível, de capacidade editável (o dono recusou fila ilimitada: "nada no mundo real acontece sem limite"). O que acontece quando a fila enche está em aberto (abaixo).
4. **Falhas:** relógio de calendário, contado desde o fim do reparo (a máquina pode falhar ociosa); `mtbfMin` = tempo de funcionamento entre o fim de um reparo e a próxima falha; `mttrMin`.
5. **Esteira:** `lengthM` e `speedMPerMin` (trânsito = comprimento ÷ velocidade); `capacity` (máximo de peças); não acumuladora (para inteira como correia quando a saída está bloqueada); pode quebrar (MTBF/MTTR); nunca cria defeito.
6. **Defeitos:** `defectRate` na estação; peça defeituosa segue regra "por qualidade" para retrabalho ou refugo; um contador de retrabalhos por peça, somado entre estações, com limite (padrão 2) (RN-SIM-006).
7. **Roteamento:** regras por qualidade, por percentual e fila mais curta, na saída do elemento, apontando só para destinos conectados.
8. **Padrões de um elemento novo** (RN-EDT-003): fonte exponencial média 60 s, fila 20; estação fixa 50 s, defeito 0, sem falhas; buffer 10; esteira 5 m a 10 m/min (30 s), capacidade 5; limite de retrabalho 2; cenário turno 8 h, 30 replicações, semente 42. O documento salvo traz todos os valores explícitos; os padrões só servem ao editor ao criar o elemento.
9. **Limites:** até 500 elementos, 2000 conexões, capacidades até 10 000, tempos até 7 dias, duração do cenário até 720 h.
10. **Cenários:** só trocam o valor inteiro de parâmetros de elementos existentes e o limite de retrabalho; não criam nem removem elementos ou conexões; aplicação campo a campo, sem mesclagem profunda (ADR-0008).

## Em aberto, com a recomendação do coordenador

- **Q1. Fonte com a fila cheia:** (a) para de gerar (escolha inicial do dono) ou (b) perde a chegada e conta "chegadas perdidas" (padrão do Simul8). Recomendação: (b), porque ensina mais e evita o alerta do tutorial do Plant Simulation de que fonte bloqueada "leva a um modelo inválido"; custo: um indicador a mais.
- **Q2. Distribuição do reparo:** manter exponencial no v1 como simplificação didática (precedente: Rossetti/Arena, livro do Simio), apesar de Simul8 e Plant Simulation usarem Erlang-2 e Law recomendar gama(1,3). Motivo: o ADR-0011 item 6 (aceito) exige uma amostra = inversa aplicada a um único uniforme; Erlang-2 e gama não têm inversa fechada; trocar exige ADR novo e código numérico novo.
- **Q3. Teto de tempo:** um teto único de 1 ano para todo campo de tempo (só para evitar valores absurdos/Infinity), em vez de 7 dias, porque o MTBF de máquina confiável passa de 7 dias.

## Decisões técnicas que o coordenador pretende tomar no plano

- T1. Falha no meio do processamento: a peça termina o tempo restante depois do reparo (Law: "usually assumed").
- T2. Esteira: intervalo mínimo de entrada = trânsito ÷ capacidade; quebrada, congela posições e tempo restante e retoma depois do reparo.
- T3. Percentuais inteiros, soma exatamente 100 (sem tolerância de ponto flutuante); sorteio independente por peça com um uniforme.
- T4. No retrabalho vale o `defectRate` da estação onde a peça é processada em cada passagem.
- T5. Um cenário pode trocar o tipo de distribuição, ligar/desligar falhas e mudar percentuais, sempre substituindo o valor inteiro do parâmetro; destinos continuam validados contra as conexões.
- T6. Com a fonte bloqueada (se Q1 = a), a peça sorteada fica retida e o próximo intervalo só é sorteado quando ela sai.

## Ficam para sub-planos posteriores (roteiro)

- Se a peça retrabalhada conta como perda na qualidade do OEE (OEE.com: sim, "first pass yield") — sub-plano 5.
- Desempate da fila mais curta e o que conta como fila — sub-plano 5.

## Material

- Relatório da pesquisa: `docs/research/modelo-de-fluxo-da-planta.md`
- Notas: `docs/research/notes/modelo-de-fluxo/`
- Pesquisa anterior: `docs/research/literatura-do-motor.md`
- Regras e decisões: `docs/product/rules/simulation.md`, `docs/product/rules/editor.md`, `docs/product/simulation.md` (casos de validação), `docs/product/mvp-scope.md` (história do demo), `docs/adr/0011-motor-de-simulacao-e-esquema.md`, `docs/adr/0008-validacao-de-dados.md`, `docs/product/plant-model.md`.
