# UC-SIM-002: Executar uma simulação

> **Resumo.** A aplicação entrega uma planta válida e um cenário e recebe os indicadores com intervalo de confiança, as séries por intervalo, o log de eventos da replicação animada e o estado final. Com a mesma entrada, o resultado é sempre o mesmo. Este é o caso que os testes contra a literatura verificam.

Atualizado em 03/11/2026 · Marco 1 · Decisões: [PDR-0008](../../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../../pdr/0014-roteamento-definido-pelo-usuario.md), [PDR-0020](../../pdr/0020-modos-de-simulacao-e-aquecimento.md), [ADR-0011](../../adr/0011-motor-de-simulacao-e-esquema.md), [ADR-0013](../../adr/0013-erros-esperados.md).

| Campo | Valor |
| --- | --- |
| Ator principal | Aplicação que chama o motor (casca do Worker no `takt-web-app`; nos testes, a suíte) |
| Escopo | `@takt/sim-engine`, caixa-preta |
| Nível | Objetivo do usuário |
| Interessados | **Professor:** números confiáveis, que batem com a literatura e que o aluno reproduz. **Aluno:** os mesmos números do professor com a mesma semente (RN-SIM-001), e saber a que pergunta o número responde (RN-SIM-012). **Portfólio:** o post "o motor reproduz Factory Physics e M/M/1". |
| Pré-condições | Planta aceita pelo [UC-SIM-001](uc-sim-001-validar-planta.md). Um cenário com modo, duração, número de replicações e semente (padrões: modo turno, 30 replicações, semente 42; RN-SIM-003, RN-SIM-007). No modo regime estável, um aquecimento informado (sugerido pelo [UC-SIM-003](uc-sim-003-sugerir-aquecimento.md) ou editado). No modo continuar, o estado final de uma execução anterior da mesma planta. |
| Garantia mínima | O motor nunca trava: ao passar de um teto de segurança, a execução para com `SIMULATION_LIMIT_EXCEEDED` (ADR-0011). Nenhum resultado parcial é apresentado como completo. |
| Garantia de sucesso | O resultado traz os indicadores, as séries, o log da replicação animada, o estado final, a versão do motor, a semente e o modo. A mesma planta, cenário, semente e versão do motor produzem exatamente o mesmo resultado (RN-SIM-001). |
| Gatilho | A aplicação pede a execução de um cenário. |
| Regras e decisões | RN-SIM-001, 003, 006, 007, 008, 010, 011, 012 ([rules/simulation.md](../rules/simulation.md)); [RN-EDT-004](../rules/editor.md); ADR-0011, itens 2 a 10; ADR-0013 (erros); testes contra a literatura em [simulation.md](../simulation.md#validação-contra-a-literatura). Pendentes nesses docs: valores dos tetos (ADR-0011), limite do aviso (RN-SIM-011), compatibilidade do estado salvo (RN-SIM-007), resultados parciais ao passar de um teto (ADR-0013) |

## Cenário principal

1. A aplicação entrega a planta e o cenário.
2. O motor compila a planta: aplica as sobreposições do cenário, converte as unidades para segundos, monta o grafo de elementos e atribui uma sequência de números aleatórios a cada elemento aleatório, com uma subsequência por replicação (ADR-0011; números aleatórios comuns, RN-SIM-010).
3. Para cada replicação, o motor parte do estado inicial do modo: vazio no turno e no regime estável; o estado salvo no continuar (RN-SIM-007).
4. O motor consome os eventos em ordem de tempo, com desempate determinístico (ADR-0011, item 3): chegadas, processamento, falhas, reparos, roteamento pelas regras da planta e retrabalho até o limite, depois do qual a peça vai para o refugo (RN-SIM-006).
5. No regime estável, ao fim do aquecimento, o motor zera todas as estatísticas e mantém o estado da fábrica (RN-SIM-008), e registra o instante do corte.
6. Na duração do cenário, a replicação termina. O motor guarda seus indicadores (vazão, WIP, lead time, utilização por estação, OEE e gargalo; [simulation.md](../simulation.md#indicadores-do-mvp)), as séries por intervalo (padrão: 1 minuto simulado) e o estado final. Só a replicação animada, a **primeira**, guarda o log completo de eventos.
7. Depois da última replicação, o motor calcula a média e o intervalo de confiança de 95% de cada indicador, pela distribuição t (RN-SIM-003).
8. O motor devolve o resultado, com a versão do motor, a semente e o modo (RN-SIM-001, RN-SIM-012).

## Extensões

- **1a.** A planta não foi aceita pelo UC-SIM-001: a execução não começa (RN-EDT-004), e quem chama mostra os problemas.
- **1b.** Modo regime estável sem aquecimento informado: a validação do UC-SIM-001 recusa a planta, com `INVALID_PLANT` (RN-SIM-007); a interface roda o [UC-SIM-003](uc-sim-003-sugerir-aquecimento.md) antes.
- **2a.** A planta passa do teto de número de elementos: a execução não começa, com `SIMULATION_LIMIT_EXCEEDED` (ADR-0011, ADR-0013).
- **3a.** Modo continuar sem estado salvo compatível com a planta: a execução não começa, com `INVALID_PLANT` (RN-SIM-007).
- **4a.** A execução passa do teto de duração simulada ou de número de eventos: o motor para e lança `SIMULATION_LIMIT_EXCEEDED` (ADR-0011, ADR-0013).
- **7a.** Modo turno e utilização do gargalo acima do limite: o resultado leva o aviso de que o turno mede sobretudo o enchimento da linha e sugere o regime estável (RN-SIM-011).
- **\*a.** Um defeito (bug) em qualquer passo: o motor lança um erro sem `code`, e quem chama o trata como erro inesperado (ADR-0013).

## Em aberto

Nenhuma decisão de produto.
