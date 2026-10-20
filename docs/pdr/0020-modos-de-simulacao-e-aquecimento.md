# PDR-0020: Modos de simulação, assistente de aquecimento e aviso de utilização

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

A decisão inicial era "começar vazio com uma opção de aquecimento". A [pesquisa sobre aquecimento](../research/aquecimento-em-simulacao-didatica.md) mostrou que:
- **começar vazio** responde a uma pergunta (o turno, incluindo o enchimento da linha), e **regime estável** responde a outra (a capacidade de longo prazo); comparar uma com a outra é o erro mais comum (**fato:** Law; Banks et al.);
- **mais replicações não corrigem o viés de começar vazio**;
- **MSER-5** foi o único método considerado robusto para sugerir o aquecimento automaticamente (**fato:** Hoad, Robinson e Davies, 2010), e nenhuma ferramenta comercial pesquisada oferece isso;
- **estimativa:** acima de ρ ≈ 0,85 no gargalo, um turno de 8 h com variabilidade alta mede quase só o enchimento da linha.

O fundador quer um MVP que permita **analisar de verdade** e que **ensine** o que mostra.

## Decisão

1. **Três modos de execução, escolhidos pelo usuário**, com o turno como padrão:

| Modo | Começa | Responde a |
| --- | --- | --- |
| **Turno** (padrão) | Vazio, sem aquecimento | "Como foi este turno, incluindo o enchimento da linha?" |
| **Continuar do turno anterior** | Com o WIP final de uma execução anterior da mesma planta | "Como é um turno típico, que já começa com peças na linha?" |
| **Regime estável** | Vazio, com aquecimento descartado | "Qual é a capacidade de longo prazo da linha?" (comparável com a literatura) |

2. **Cada modo é explicado na interface:** o que é, quando usar e a que pergunta o número responde. Todo resultado mostra o modo em que foi gerado.
3. **Assistente de aquecimento (MSER-5) no MVP:** no modo regime estável, ele sugere o aquecimento, mostra o gráfico com o corte e deixa o usuário aceitar ou editar.
4. **Aviso de utilização do gargalo:** no modo turno, quando a utilização do gargalo passa do limite (proposta: 0,85), o resultado avisa que o turno mede sobretudo o enchimento da linha e sugere o modo regime estável.
5. **Princípio:** mesmo no MVP, a área Capacitar deve permitir **análise** com rigor. A profundidade analítica vale mais que a quantidade de recursos.

## Alternativas consideradas

- **Só turno vazio + campo de aquecimento manual** (como as ferramentas comerciais): deixa o usuário sem saber que valor usar e sem entender a diferença entre as perguntas.
- **Só regime estável:** não representa uma linha que realmente esvazia a cada turno.
- **Assistente fora do MVP:** descartado por decisão do fundador; é um diferencial e ensina o conceito.

## Consequências

- O motor precisa registrar **séries desagregadas por intervalo** desde o início (requisito do MSER-5) e salvar o **estado final** de uma execução.
- A validação do motor ganha alvos por modo: turno vazio contra a média transiente (3,79 no M/M/1 com ρ = 0,8, T = 480); regime estável contra L = 4 e W = 5.
- **Risco:** o princípio "quanto mais completo, melhor" alonga os marcos e reforça o risco de o projeto nunca ficar apresentável ([risks.md](../product/risks.md)). Mitigação: cada acréscimo entra num marco, nunca "por fora".
- **Em aberto:** o que acontece com o estado salvo se a planta mudar depois da execução anterior.

## Regras derivadas

- `RN-SIM-007`: três modos de execução, escolhidos pelo usuário; turno é o padrão.
- `RN-SIM-008`: no fim do aquecimento, as estatísticas são zeradas e o estado da fábrica é mantido.
- `RN-SIM-009`: o assistente de aquecimento sugere o valor por MSER-5; o usuário confirma ou edita.
- `RN-SIM-010`: cenários comparados usam o mesmo modo, a mesma semente, o mesmo aquecimento e números aleatórios comuns.
- `RN-SIM-011`: aviso quando a utilização do gargalo passa do limite no modo turno.
- `RN-SIM-012`: todo resultado identifica o modo e a pergunta que ele responde.

## Reflete em

- [product/simulation.md](../product/simulation.md), [product/mvp-scope.md](../product/mvp-scope.md).
- [Pesquisa sobre aquecimento](../research/aquecimento-em-simulacao-didatica.md).
