# Motor de simulação

> **Resumo.** O motor é o principal ativo técnico: simulação de eventos discretos, determinística com semente fixa, com replicações e intervalo de confiança. A cena 3D só reproduz o log de eventos. Antes de aparecer em aula, o motor precisa reproduzir resultados conhecidos da literatura.

Atualizado em 26/11/2026 · Decisões: [PDR-0008](../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../pdr/0014-roteamento-definido-pelo-usuario.md), [PDR-0022](../pdr/0022-modelo-de-fluxo-da-planta.md) · Regras: [rules/simulation.md](rules/simulation.md).

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
- **Lead time:** tempo médio de uma peça da chegada à fonte até a expedição, contando a espera na fila da fonte (RN-SIM-013). Conta só as peças que saíram no turno: as que ainda estão na linha no fim ficam de fora (o turno corta o tempo delas), e o indicador é vazio quando nenhuma saiu. A interface diz isso no marco 2.
- **Utilização:** fração do tempo em que cada estação está processando.
- **OEE** = D × P × Q: disponibilidade (tempo produzindo / tempo planejado), desempenho (ritmo real / ritmo ideal) e qualidade (peças boas / total).
- **Gargalo:** a estação de maior fração ativa (processando ou em reparo), com a incerteza entre replicações; só a utilização (processando) aponta a estação errada quando há falhas (ver a [pesquisa do modelo de fluxo](../research/modelo-de-fluxo-da-planta.md)). Definição fechada no sub-plano 5 do motor.
- **Pedidos não atendidos:** chegadas perdidas com a fila da fonte cheia (RN-SIM-013).

Todos com média e intervalo de confiança de 95%.

**Séries por intervalo:** cada replicação devolve também os indicadores em fatias de 1 minuto simulado, a partir do instante 0; a última fatia é menor quando a duração não é múltipla de 1 minuto. Em cada fatia: saídas, WIP médio da fatia e lead time médio das peças que **saíram nela**, vazio quando nenhuma saiu ([ADR-0015](../adr/0015-cenario-aplicado-e-series-do-motor.md)).

## Validação contra a literatura

Testes automáticos escritos **antes** do motor. O motor está pronto para a sala de aula quando passa em todos, dentro do intervalo de confiança.

| Caso | Resultado esperado | Fonte |
| --- | --- | --- |
| Linha em série, tempos fixos, sem falhas, bloqueio depois do serviço | Vazão = 1 / maior tempo de ciclo; gargalo = estação mais lenta | Hopp e Spearman |
| Fila M/M/1, chegada 0,8 e atendimento 1,0, fila da fonte de 1000 (a chance de encher é da ordem de 10⁻⁹⁸) | Utilização 0,8; 4 itens no sistema, contando a fila da fonte; 5 unidades de tempo por item | Teoria de filas |
| Fila M/M/1/K (fonte com fila K − 1) | Fração de chegadas perdidas = p_K = ρ^K(1 − ρ)/(1 − ρ^(K+1)) | Teoria de filas |
| Qualquer rodada estável | WIP = vazão × lead time | Lei de Little |
| Falhas com MTBF 240 min e MTTR 15 min, em regime estável | Disponibilidade ≈ 94,1% (240 / 255); no turno de 480 min começando com a máquina ligada, ≈ 94,29% | Definição de disponibilidade |
| Estação saturada com ciclo fixo c e disponibilidade A | Vazão = A / c | Definição de disponibilidade |
| Retrabalho com probabilidade p e limite n | Passagens esperadas por peça = (1 − pⁿ⁺¹) / (1 − p); refugo com probabilidade pⁿ⁺¹ | Distribuição geométrica truncada |
| Esteira determinística entre duas estações | Soma o trânsito ao lead time sem mudar a vazão | RN-SIM-016 |
| Turno vazio, M/M/1 com ρ = 0,8, T = 480 | Média de L ≈ 3,79 (viés de começar vazio); separar de 4 exige cerca de 1.000 replicações | [Pesquisa sobre aquecimento](../research/aquecimento-em-simulacao-didatica.md) |
| Lei de Little em janela finita, contando o WIP inicial | Igualdade exata, sem estatística (teste unitário) | Little (2011), LL.1 e LL.2 |
| MSER-5 no M/M/1 com ρ = 0,8 | Corte válido, e o IC da média truncada cobre L = 4. O corte típico é pequeno (mediana de 10 a 15 unidades de tempo, em simulação própria da pesquisa), não "algumas centenas" | [Literatura do motor](../research/literatura-do-motor.md) |
| k estações paralelas idênticas, tempo c | Capacidade = k / c | Hopp e Spearman |

Os casos de regime estável (M/M/1, M/M/1/K, Little em regime, Hopp e Spearman, disponibilidade) rodam no modo regime estável. Comparar com modelos analíticos verifica o código; não valida as regras próprias do Takt ([Sargent, 2010](https://www.informs-sim.org/wsc10papers/016.pdf)). Cada caso só fecha com condições do modelo (fila ilimitada e fonte nunca bloqueada no M/M/1; bloqueio depois do serviço na linha em série; falhas no relógio de calendário e MTBF contado do fim do reparo na disponibilidade; LL.2, não LL.1, num turno que termina com peças), listadas na [pesquisa da literatura do motor](../research/literatura-do-motor.md). **Estimativa:** ±5% em L com ρ = 0,8 exige cerca de 1,7×10⁵ unidades de tempo somadas entre replicações; testes rápidos de regressão podem usar ρ = 0,5.

## O que o Takt simplifica

O modelo de fluxo ([PDR-0022](../pdr/0022-modelo-de-fluxo-da-planta.md)) troca detalhe por clareza, e a interface diz isso:

- **Fila só nos buffers e na fonte:** a estação guarda uma peça e bloqueia; não há fila embutida na máquina.
- **Falhas no relógio de calendário:** a máquina pode falhar parada; o desgaste ligado ao uso (tempo ocupado) fica de fora.
- **Reparo exponencial por padrão:** sorteia mais reparos curtos do que costuma acontecer; o usuário pode escolher uma triangular.
- **Esteira sem falha e sem tamanho de peça:** o espaçamento vem da capacidade.
- **Sem turnos, paradas planejadas nem operadores.**

Referências completas: [references.md](references.md).
