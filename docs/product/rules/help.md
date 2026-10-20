# Regras de explicação e ajuda

> **Resumo.** Dica curta e painel "Saiba mais" para todo termo, indicador e campo; explicação do resultado revelada em degraus, terminando numa hipótese, nunca numa ordem. A ajuda é sob demanda e pode ser desligada; a informação correta sobre o número e os alertas de estado da fábrica nunca se desligam.

Atualizado em 20/10/2026 · Origem: [PDR-0021](../../pdr/0021-explicacao-em-camadas.md). Base: [pesquisa sobre explicação em camadas](../../research/explicacao-em-camadas-na-interface.md).

### RN-HLP-001: Cobertura de explicações

- **Enunciado:** todo termo técnico, indicador e campo da interface tem uma dica (uma frase) e um painel "Saiba mais", nos dois idiomas.
- **Origem:** PDR-0021.
- **Exemplo:** "OEE" tem a dica "Quanto do tempo planejado virou peça boa" e um painel com a fórmula e os valores da planta aberta.
- **Quando violada:** um teste lista os termos e indicadores do glossário sem dica ou painel e falha.

### RN-HLP-002: Dica acessível

- **Enunciado:** a dica abre ao passar o mouse, ao receber foco do teclado e ao toque; fecha com Esc sem mover o ponteiro; aceita o ponteiro por cima sem sumir; permanece enquanto o gatilho estiver ativo (WCAG 2.2, 1.4.13). Não contém nada clicável. O "Saiba mais" é um controle próprio ao lado do termo. O atributo `title` não é usado como dica.
- **Origem:** PDR-0021.
- **Exemplo:** em tela de toque, tocar no ícone "i" ao lado de "WIP" abre o painel.
- **Quando violada:** teste de acessibilidade automatizado e teste de teclado no Playwright.

### RN-HLP-003: Essencial sempre visível

- **Enunciado:** unidade, faixa válida e obrigatoriedade de um campo aparecem sempre junto do campo, nunca só na dica.
- **Origem:** PDR-0021.
- **Exemplo:** "Taxa de defeitos (0 a 1)", com "obrigatório" visível.
- **Quando violada:** revisão de interface.

### RN-HLP-004: Ajuda sob demanda, desligável

- **Enunciado:** nenhuma explicação aparece sem o usuário pedir, exceto as da RN-HLP-008. O usuário pode desligar as dicas e as ajudas e religá-las; a preferência fica salva no perfil.
- **Origem:** PDR-0021.
- **Exemplo:** com as dicas desligadas, passar o mouse sobre "OEE" não mostra nada; o ícone de "Saiba mais" continua disponível.
- **Quando violada:** não se aplica (comportamento da interface).
- **Em aberto:** convite discreto de ajuda quando houver sinal de dificuldade.

### RN-HLP-005: Painel "Saiba mais"

- **Enunciado:** o painel abre ao lado da tela, sem bloqueá-la, e segue a ordem: o que acontece na sua fábrica → os números → a fórmula com os valores da planta aberta → a regra geral. Para valores fora do domínio da fórmula (por exemplo, utilização ≥ 1), mostra um texto próprio explicando o caso.
- **Origem:** PDR-0021.
- **Exemplo:** "Na sua linha, M3 ficou ocupada 96% do tempo. Utilização = tempo processando ÷ tempo disponível = 7,7 h ÷ 8 h. Regra geral: a estação mais utilizada limita a vazão."
- **Quando violada:** revisão de conteúdo.

### RN-HLP-006: Explicação do resultado em degraus

- **Enunciado:** a explicação de um resultado é revelada em degraus, cada um sob demanda: (1) meta do cenário; (2) dica de processo; (3) diagnóstico, depois de o usuário registrar uma previsão ou pedir para pular; (4) sugestão escrita como hipótese para testar, nunca como ordem.
- **Origem:** PDR-0021.
- **Exemplo:** "Qual estação você acha que é o gargalo?" → o usuário escolhe M2 → "O gargalo é M3 (utilização 0,96). Hipótese para testar: reduzir o tempo de ciclo de M3 aumenta a vazão; observe se o gargalo muda de lugar."
- **Quando violada:** revisão de conteúdo.

### RN-HLP-007: Explicações coerentes com o motor

- **Enunciado:** dicas, painéis e explicações de resultado são gerados por modelos de texto fixos a partir das mesmas definições de indicador que o motor usa. Não se usa IA generativa.
- **Origem:** PDR-0021.
- **Exemplo:** se a definição de OEE mudar no motor, a fórmula no painel muda junto.
- **Quando violada:** teste que compara as fórmulas exibidas com as definições do motor.

### RN-HLP-008: Informação correta sobre o número

- **Enunciado:** o modo da execução, o aviso de utilização do gargalo, o intervalo de confiança e a indicação de empate (diferença dentro da variação) aparecem sempre, mesmo com as ajudas desligadas.
- **Origem:** PDR-0021, [PDR-0020](../../pdr/0020-modos-de-simulacao-e-aquecimento.md).
- **Exemplo:** "M3 e M2 empatados como gargalo (0,96 e 0,95 ± 0,02)."
- **Quando violada:** teste de interface com as ajudas desligadas.

### RN-HLP-009: Planejamento de experimentos

- **Enunciado:** sob demanda, o Takt sugere como planejar o próximo experimento: mudar uma variável por vez e comparar com o cenário base.
- **Origem:** PDR-0021.
- **Exemplo:** ao duplicar um cenário com três parâmetros alterados: "Mudar uma coisa por vez deixa claro o efeito de cada uma. Quer separar em três cenários?"
- **Quando violada:** não se aplica (sugestão).

### RN-HLP-010: Alertas de estado da fábrica

- **Enunciado:** situações que pedem atenção ficam sempre visíveis, na cena 3D (sobre o elemento) e no painel de resultados, com cor **e** ícone, mesmo com as ajudas desligadas: gargalo; fila crescendo; buffer cheio; estação bloqueada (sem espaço à frente) ou sem material (nada chegando); máquina parada por falha; aviso de utilização do gargalo ([RN-SIM-011](simulation.md)).
- **Origem:** PDR-0021.
- **Exemplo:** durante a reprodução, M2 fica com contorno vermelho e o ícone de chave inglesa enquanto está em reparo; o buffer B1 mostra "cheio" e M1, à frente dele, aparece como bloqueada.
- **Quando violada:** teste de interface com as ajudas desligadas.
- **Critério de "fila crescendo", escolhido pelo usuário por buffer:**
  - **tamanho fixo:** a fila passou de N peças;
  - **porcentagem da capacidade:** a fila passou de X% da capacidade do buffer;
  - **tendência:** a fila aumentou de forma contínua nos últimos M minutos simulados.
- **Padrão, se o usuário não escolher:** porcentagem da capacidade (80%) nos buffers com capacidade definida; tendência nas filas sem limite. **Estimativa:** valores sem base em literatura, a revisar com o uso.
- **Em aberto:** os valores padrão de M e a forma de medir a tendência.
