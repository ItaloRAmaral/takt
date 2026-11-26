# Regras do editor 3D

> **Resumo.** A montagem acontece numa grade em 3D, com encaixe e rotação em passos de 90°. Toda edição pode ser desfeita, todo elemento nasce funcionando e uma planta inválida não roda.

Atualizado em 25/11/2026 · Origem: [PDR-0007](../../pdr/0007-montagem-3d-em-grade.md); padrões e validações: [PDR-0022](../../pdr/0022-modelo-de-fluxo-da-planta.md).

### RN-EDT-001: Grade e rotação

- **Enunciado:** todo elemento ocupa células inteiras da grade, gira em passos de 90° e não se sobrepõe a outro.
- **Origem:** PDR-0007.
- **Exemplo:** soltar uma estação entre duas células a encaixa na mais próxima.
- **Quando violada:** a interface não permite soltar; a validação da planta recusa sobreposições.

### RN-EDT-002: Tudo pode ser desfeito

- **Enunciado:** toda ação de edição (adicionar, mover, girar, conectar, alterar parâmetro, remover) pode ser desfeita e refeita.
- **Origem:** PDR-0007.
- **Exemplo:** apagar uma estação por engano e desfazer devolve a estação e as conexões dela.
- **Quando violada:** não se aplica (comportamento da interface).
- **Histórico:** 100 ações por sessão de edição, guardadas no navegador. Não confundir com a auditoria, que fica no servidor.

### RN-EDT-003: Elemento nasce funcionando

- **Enunciado:** um elemento novo nasce com parâmetros padrão válidos, de modo que uma linha montada sem ajustes já roda.
- **Origem:** PDR-0007.
- **Exemplo:** fonte → estação → expedição, sem mexer em nada, roda.
- **Quando violada:** não se aplica.
- **Padrões** (decisão do fundador em 24/11/2026; sem fonte, escolhas de produto). O documento salvo guarda todos os valores; os padrões só servem ao criar o elemento:

| Elemento | Padrão |
| --- | --- |
| Fonte | chegada exponencial com média de 60 s; fila de 20 |
| Estação | ciclo fixo de 50 s; ritmo ideal igual à média do ciclo; defeito 0; sem falhas (ao ligar: 240 min e 15 min, RN-SIM-015) |
| Buffer | capacidade 10 |
| Esteira | 5 m a 10 m/min; capacidade 5 |
| Planta | limite de retrabalho 2 (RN-SIM-006) |
| Cenário | turno de 8 h, 30 replicações, semente 42 (RN-SIM-003 e 007) |

### RN-EDT-004: Planta inválida não roda

- **Enunciado:** antes de rodar, a planta é validada. Se houver erro, a simulação não começa, e cada erro aparece no elemento afetado.
- **Origem:** PDR-0007.
- **Exemplo:** uma estação sem entrada fica marcada com "sem conexão de entrada".
- **Quando violada:** `INVALID_PLANT`, com a lista de erros por elemento.
- **Validações mínimas:** ao menos uma fonte e uma saída (expedição ou refugo); nenhum elemento solto (todo elemento alcançável a partir de uma fonte e com caminho até uma saída); nenhuma conexão para o próprio elemento, repetida, chegando a uma fonte ou saindo de uma saída; parâmetros dentro dos limites; regras de roteamento completas ([RN-SIM-004](simulation.md), [RN-SIM-005](simulation.md), [RN-SIM-006](simulation.md)); cada cenário válido com as suas sobreposições aplicadas. A lista de códigos de problema está em [README.md](README.md#códigos-de-problema-da-planta).
