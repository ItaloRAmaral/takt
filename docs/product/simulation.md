# Motor de simulação

> **Resumo.** O motor é o principal ativo técnico: simulação de eventos discretos, determinística com semente fixa, com replicações e intervalo de confiança. A cena 3D só reproduz o log de eventos. Antes de aparecer em aula, o motor precisa reproduzir resultados conhecidos da literatura.

Atualizado em 20/10/2026 · Decisões: [PDR-0008](../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../pdr/0014-roteamento-definido-pelo-usuario.md) · Regras: [rules/simulation.md](rules/simulation.md).

## Como funciona

Uma fila de eventos ordenada pelo tempo (chegada, início e fim de processo, falha, reparo) que o motor consome, avançando o relógio de evento em evento. O motor:
- é uma biblioteca pura, sem dependência de interface nem de 3D, testável sozinha;
- roda fora da linha principal da interface, para não travar a tela;
- sabe **avançar até um instante t**, o que permite a reprodução controlável agora e a interação em tempo real depois.

## Decisões que protegem a credibilidade

- **Determinismo:** mesma planta, cenário, semente e versão do motor = mesmos resultados.
- **Replicações:** falhas e defeitos são aleatórios, então uma rodada só engana. Padrão: 30 replicações (ajustáveis de 5 a 100), semente 42.
- **Log de eventos como saída:** a cena 3D só reproduz; nunca calcula.

## Modos de execução

O usuário escolhe; cada modo é explicado na interface ([PDR-0020](../pdr/0020-modos-de-simulacao-e-aquecimento.md), [regras](rules/simulation.md#modos-de-execução-e-aquecimento)).

| Modo | Começa | Responde a | Comparável com a literatura? |
| --- | --- | --- | --- |
| **Turno** (padrão) | Vazio, sem aquecimento | Como foi este turno, incluindo o enchimento | Só com a média transiente |
| **Continuar do turno anterior** | Estado final salvo de uma execução anterior | Como é um turno típico, já com peças na linha | Não diretamente |
| **Regime estável** | Vazio, com aquecimento descartado (sugerido por MSER-5) | Capacidade de longo prazo | Sim (M/M/1, Little, Hopp e Spearman) |

**Por que importa (fato, Law; Banks et al.):** começar vazio subestima filas e WIP, e mais replicações não corrigem esse viés. No M/M/1 com ρ = 0,8, a média de L num turno de 480 unidades de tempo é 3,79, não 4.

**Aviso:** no modo turno, acima de ρ ≈ 0,85 no gargalo, o resultado avisa que o turno mede sobretudo o enchimento da linha.

## Indicadores do MVP

- **Vazão:** peças boas por hora.
- **WIP:** peças no sistema, em média.
- **Lead time:** tempo médio de uma peça da entrada à saída.
- **Utilização:** fração do tempo em que cada estação está processando.
- **OEE** = D × P × Q: disponibilidade (tempo produzindo / tempo planejado), desempenho (ritmo real / ritmo ideal) e qualidade (peças boas / total).
- **Gargalo:** a estação de maior utilização, confirmada pela fila acumulada à frente dela.

Todos com média e intervalo de confiança de 95%.

## Validação contra a literatura

Testes automáticos escritos **antes** do motor. O motor está pronto para a sala de aula quando passa em todos, dentro do intervalo de confiança.

| Caso | Resultado esperado | Fonte |
| --- | --- | --- |
| Linha em série, tempos fixos, sem falhas | Vazão = 1 / maior tempo de ciclo; gargalo = estação mais lenta | Hopp e Spearman |
| Fila M/M/1, chegada 0,8 e atendimento 1,0 | Utilização 0,8; 4 itens no sistema; 5 unidades de tempo por item | Teoria de filas |
| Qualquer rodada estável | WIP = vazão × lead time | Lei de Little |
| Falhas com MTBF 240 min e MTTR 15 min | Disponibilidade ≈ 94,1% (240 / 255) | Definição de disponibilidade |
| Retrabalho com probabilidade p, sem limite | Passagens esperadas por peça = 1 / (1 − p) | Distribuição geométrica |
| Turno vazio, M/M/1 com ρ = 0,8, T = 480 | Média de L ≈ 3,79 (viés de começar vazio) | [Pesquisa sobre aquecimento](../research/aquecimento-em-simulacao-didatica.md) |
| Lei de Little em janela finita, contando o WIP inicial | Igualdade exata, sem estatística (teste unitário) | Little (2011), LL.1 e LL.2 |
| MSER-5 no M/M/1 com ρ = 0,8 | Corte da ordem de algumas centenas de unidades de tempo | Pesquisa sobre aquecimento |

Os casos de regime estável (M/M/1, Little em regime, Hopp e Spearman) rodam no modo regime estável. **Estimativa:** ±5% em L com ρ = 0,8 exige cerca de 1,7×10⁵ unidades de tempo somadas entre replicações; testes rápidos de regressão podem usar ρ = 0,5.
| k estações paralelas idênticas, tempo c | Capacidade = k / c | Hopp e Spearman |

Referências completas: [references.md](references.md).
