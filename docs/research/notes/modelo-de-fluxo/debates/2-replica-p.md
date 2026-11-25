# Réplica P

## Onde eles têm razão e eu não vi

- **Média da normal truncada (M).** Vale também para o ciclo: "normal 50 s, desvio 30, mínimo 0" tem média acima de 50. Quem lê o parâmetro erra o gargalo [Estimativa].
- **IC da diferença pareada (M).** É o achado didático mais importante: a interface reforçaria o equívoco "IC sobrepostos = sem diferença" [Palpite].
- **Ordem dos eventos agora (M).** Errei ao aceitar o adiamento.
- **Lead time censurado e 94,1% (M).** Conferi: dá 0,9412 + 0,0588/34 ≈ 0,9429 [Estimativa].
- **Números aleatórios comuns na Q1 (M).** Exagerei: em (a), o pareamento enfraquece, mas não some.

## Pontos de M

| Ponto | Posição |
| --- | --- |
| Média truncada | **Mostrar a média real**: ciclo, reparo, fonte. A disponibilidade usa essa média. Não proibir a normal truncada, que o professor reconhece. |
| Sequências separadas para falha e reparo | **Sim.** É invisível ao usuário e necessária à RN-SIM-010. |
| Um uniforme por defeito mesmo com p = 0 | **Sim.** Estender ao percentual. |
| Lead time só das concluídas | **Sim**, com o rótulo "das peças concluídas" ao lado do WIP final. |
| 94,1% em regime estável | **Sim.** A versão em turno vira exercício sobre os modos. |
| Ordem dos eventos | **Sim**: a regra semântica entra em `rules/` no sub-plano 3. |
| Oráculo de Markov | **Sim, mínimo** (duas estações, buffer ≤ 3, regra 11), no sub-plano 4. É onde estão as regras sem precedente. |
| SimPy | **Não agora.** Traz Python e duplica o desempate. Serve à banca, não ao aluno. |
| Modelo conceitual no formato de Robinson | **Versão barata**: a seção "O que o Takt simplifica", com o sentido de cada efeito, em `simulation.md`. |

## Pontos de O

- **Manifesto:** sim, como contrato de saída (sub-planos 4 e 6), fora do documento da planta. O ganho de produto é que o professor reproduz o JSON entregue pelo aluno e confere o hash.
- **`onQueueFull: "lose"`:** contra. Migrar depois é barato (`plant-model.md`). E a alternativa útil é uma *liberação* limitada pelo WIP da linha (CONWIP), com outra forma (`release: { mode, wipCap }`). O enum agora já escolheria a abstração errada [Palpite].
- **Travamento invalida a execução: sim.** Corrijo a primeira rodada: as replicações rodam até o fim, e o resultado mostra "7 de 30 travaram", **sem indicadores**. A replicação travada abre na cena. O travamento vira a lição.
- **Indicadores por replicação: sim.** A dispersão ensina que "uma rodada só engana".
- **Cobertura com 1.000 sementes por caso: excesso.** Uma vez, no M/M/1, como propõe M.

## Em disputa

1. **Nome do indicador.** M quer "tempo no sistema". Eu mantenho "lead time" desde a criação como manchete, com "tempo na linha" decomposto, porque é o termo do aluno. O que decide: o glossário e um professor.
2. **Oráculo × exercícios.** Eu os faria em paralelo. O que decide: o custo medido do oráculo depois de conferi-lo contra o M/M/1/K.

## As 5 mudanças para o sub-plano 3

1. **Planta de exemplo refeita** (esquema):
   - linha sobrecarregada, porque com ρ < 1 o passo 4 do demo é falso;
   - um gargalo claro, com o segundo fora do empate;
   - nenhum laço que trave.
2. **Q1 (b) e Q2 (a) escritas em `rules/`**, sem campo novo no esquema. O exemplo de `plant-model.md` é corrigido. A detecção e o status por replicação ficam no sub-plano 4.
3. **Regra semântica da ordem dos eventos** em `rules/`. A implementação fica no sub-plano 4.
4. **`idealCycleSec`** (esquema), com padrão igual à média real. Ciclo 0 fica sem OEE ("—"). O OEE no gargalo fica para o sub-plano 5.
5. **Casos de validação com condições** em `simulation.md`:
   - os 94,1% em regime estável;
   - as condições de p_K, A/c e esteira;
   - a vazão boa (1 − p)/c;
   - a tolerância δ;
   - as simplificações.

**Depois:**
- **Sub-plano 4:** sequências por propósito, uniforme por defeito.
- **Sub-planos 4 e 5:** gargalo pela fração ativa, tempos por estado.
- **Interface:** média real, IC pareado.
- **Sub-planos 4 e 6:** manifesto, indicadores por replicação.
