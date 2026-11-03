# UC-SIM-004: Avançar a simulação até um instante

> **Resumo.** A aplicação executa uma replicação aos poucos: pede ao motor que avance até um instante, recebe os eventos desse trecho e o estado da fábrica naquele momento, e repete. É a base da reprodução controlável da cena 3D (marco 2) e, no futuro, da interação em tempo real.

Atualizado em 03/11/2026 · Marco 1 · Decisões: [PDR-0008](../../pdr/0008-simulacao-com-reproducao.md), [ADR-0011](../../adr/0011-motor-de-simulacao-e-esquema.md), item 9.

| Campo | Valor |
| --- | --- |
| Ator principal | Aplicação que chama o motor (casca do Worker no `takt-web-app`; nos testes, a suíte) |
| Escopo | `@takt/sim-engine`, caixa-preta |
| Nível | Objetivo do usuário |
| Interessados | **Aluno:** ver a fábrica "viva" sem a tela travar. **Professor:** pausar num instante e explicar o que acontece. **Futuro (missões):** mudar parâmetros durante a execução sem reescrever o motor (PDR-0008). |
| Pré-condições | Planta aceita pelo [UC-SIM-001](uc-sim-001-validar-planta.md). Um cenário, como no [UC-SIM-002](uc-sim-002-executar-simulacao.md). |
| Garantia mínima | O relógio do motor nunca volta, e nenhum evento é pulado ou repetido entre duas chamadas. |
| Garantia de sucesso | Ao fim, os eventos devolvidos trecho a trecho são exatamente os do log da mesma replicação executada de uma vez pelo UC-SIM-002, com a mesma entrada (deriva de RN-SIM-001). |
| Gatilho | A aplicação inicia uma execução passo a passo de uma replicação. |
| Regras e decisões | [RN-SIM-001](../rules/simulation.md), [RN-SIM-002](../rules/simulation.md) (a cena só reproduz o que o motor devolve); ADR-0011, itens 3 e 9; ADR-0013 |

## Cenário principal

1. A aplicação inicia a execução passo a passo, com a planta e o cenário. O motor compila a planta como no UC-SIM-002, passo 2, e prepara o estado inicial do modo.
2. A aplicação pede que o motor avance até um instante t (ou até o próximo evento).
3. O motor consome, em ordem e com o desempate determinístico, todos os eventos até t.
4. O motor devolve os eventos desse trecho e o estado da fábrica em t: relógio, peças em cada fila, estado de cada estação.
5. A aplicação repete os passos 2 a 4 até a duração do cenário.
6. Na duração do cenário, o motor devolve também os indicadores da replicação, como no UC-SIM-002, passo 6.

## Extensões

- **2a.** O instante pedido é anterior ao relógio atual: é um defeito de quem chama, e o motor lança um erro sem código (ADR-0013). Voltar no tempo é papel da cena, que já tem os eventos recebidos e os reproduz de novo, sem pedir nada ao motor (RN-SIM-002).
- **2b.** O instante pedido passa da duração do cenário: o motor avança só até a duração e encerra a replicação.
- **3a.** A execução passa de um teto de segurança: o motor para e lança `SIMULATION_LIMIT_EXCEEDED` (ADR-0011, ADR-0013).

## Em aberto

Nenhuma decisão de produto.
