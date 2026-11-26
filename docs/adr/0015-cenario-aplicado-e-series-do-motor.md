# ADR-0015: Cenário aplicado e séries do núcleo do motor

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 26/11/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `@takt/sim-engine`, `@takt/plant-schema` |

## Contexto

O núcleo do motor ([plano do sub-plano 4](../plans/2026-11-26-motor-nucleo-e-linha-simples.md)) esbarra em dois pontos do [ADR-0011](0011-motor-de-simulacao-e-esquema.md) que o texto aceito não resolve sozinho.

**Item 2, o cenário aplicado.**
- **Fato:** o ADR-0011, item 2, diz que a planta é "compilada para o modelo interno" e que "o motor depende só dos tipos do esquema". O lint do motor impõe isso (`allowTypeImports` em `libs/sim-engine/eslint.config.mjs`).
- **Fato:** o [UC-SIM-002](../product/use-cases/uc-sim-002-executar-simulacao.md), passo 2, diz que o motor "aplica as sobreposições do cenário" ao compilar.
- **Fato:** a aplicação já existe no esquema como função pura, `applyScenario` (`libs/plant-schema/src/apply-scenario.ts`). Ela troca cada campo inteiro, sem mesclagem profunda, e nunca muda a planta base ([plant-schema.md](../architecture/plant-schema.md)). O próprio `validatePlant` usa a mesma aplicação para validar cada cenário.
- **Fato:** esse arquivo só importa tipos. Já o `index.ts` do pacote reexporta o `validatePlant` e os esquemas Zod, então importar um valor pela raiz do pacote carrega o Zod (`libs/plant-schema/src/index.ts`, `package.json` sem caminho próprio).

**Item 8, o lead time nas séries.**
- **Fato:** o item 8 pede séries por intervalo com "vazão, WIP médio e lead time das peças que entraram". O texto não diz em que fatia entra o lead time de uma peça que chegou numa fatia e saiu em outra.
- **Fato:** numa fatia sem saída, a média do lead time só das peças que saíram fica sem valor. O AutoSimOA chama de "logically incorrect" registrar zero nesse caso ([pesquisa da literatura do motor](../research/literatura-do-motor.md), seção das séries).
- **Estimativa (da pesquisa):** com cerca de uma peça por minuto, a série por minuto terá muitas fatias vazias.

## Decisão

1. **O código do motor pode importar `applyScenario` do esquema**, por um caminho próprio do pacote, `@takt/plant-schema/apply-scenario`, declarado em `exports` e apontando para `apply-scenario.ts`.
   - Do pacote principal, o motor continua importando só tipos.
   - O arquivo do caminho próprio só importa tipos. Com isso o motor não carrega o Zod nem os esquemas, e a validação continua num lugar só, na borda ([ADR-0008](0008-validacao-de-dados.md)).
2. **Specs e auxiliares de teste do motor podem importar valores do esquema** (`validatePlant`, `createDefault*`), para montar plantas que o esquema aceita. O código do motor fica restrito ao item 1.
3. **Na série por intervalo, o lead time de uma peça entra na fatia em que ela sai.** A série traz a média do lead time das peças que saíram na fatia, e `null` quando nenhuma saiu. O lead time vai da chegada à expedição e inclui a fila da fonte ([RN-SIM-013](../product/rules/simulation.md)). As peças "que entraram" do item 8 são as que entraram no sistema, medidas quando saem.

Este ADR **complementa** o ADR-0011, itens 2 e 8; não o substitui.

## Alternativas consideradas

- **O motor reescreve a aplicação do cenário (cerca de 40 linhas):** cumpre o texto do item 2 sem ADR. Perde porque ficam duas cópias da mesma regra, a do `validatePlant` e a do motor, que podem divergir sem que nenhum teste perceba. Validar um cenário e rodá-lo com aplicações diferentes daria resultado errado sem erro.
- **Quem chama aplica o cenário antes e entrega a planta já aplicada:** também cumpre o item 2. Perde porque muda o UC-SIM-002, passo 2. Além disso, uma casca que esquecesse de aplicar rodaria a planta base com os parâmetros do cenário, sem erro nenhum.
- **Importar `applyScenario` pela raiz do pacote:** uma linha a menos no `package.json`. Perde porque carrega o Zod e todos os esquemas no motor e no Worker, contra o motivo do item 1.
- **Lead time pela regra do AutoSimOA**, que soma o tempo atual das peças que ainda estão dentro: a curva fica sempre contínua. Perde porque mistura peças terminadas com peças em andamento, e o número da fatia deixa de ser um lead time.
- **Lead time pela fatia de chegada:** perde porque o valor de uma fatia só fica conhecido quando sua última peça sai, e o fim do turno censura as fatias finais.
- **Um ADR separado para o item 8:** perde porque as duas complementações nascem do mesmo plano e são pequenas; um registro a mais custaria leitura sem ganho.

## Consequências

**Positivas:**
- A aplicação do cenário tem uma implementação só, usada pela validação e pela execução. O UC-SIM-002 continua verdadeiro.
- O motor continua sem Zod.
- Os testes do motor montam plantas com os padrões e a validação reais do esquema, em vez de cópias.
- A série de lead time nunca registra um zero falso, e a fatia vazia aparece como buraco no gráfico.

**Negativas e custos:**
- O motor passa a depender, em tempo de execução, de um arquivo do esquema. Uma mudança no `applyScenario` muda os resultados do motor, mas não muda a versão do motor que o resultado registra (RN-SIM-001). **Palpite:** cabe ao sub-plano 6, que decide de onde vem a versão do motor, contar o esquema nela.
- O `package.json` do esquema ganha uma entrada de `exports` que precisa continuar apontando para um arquivo que só importa tipos.
- A série de lead time tem `null`. O assistente de aquecimento (MSER-5) e as médias entre replicações precisam tratar esse valor; fica como pendência dos sub-planos 6 e 7 no [roteiro](../plans/2026-11-04-roteiro-motor.md).
- O indicador final de lead time do turno conta só as peças que saíram. Isso subestima o lead time, porque as peças mais lentas ainda estão na linha no fim; a interface precisa dizer isso (marco 2).

## Riscos de segurança

A decisão não cria superfície de ataque. Duas ameaças do [ADR-0011](0011-motor-de-simulacao-e-esquema.md) e do [ADR-0008](0008-validacao-de-dados.md) ficam como estavam:
- **Planta que trava o motor:** continua tratada pelos tetos de segurança.
- **Poluição de protótipo:** continua tratada pelo modo estrito do esquema e pela aplicação campo a campo, agora com uma implementação só. O plano do sub-plano 4 tem um teste de defesa em profundidade com `__proto__`.

## Conformidade

- **Lint do motor**, com casos no teste de conformidade (`libs/sim-engine/src/lint-conformance.spec.ts`):
  - aceita `import { applyScenario } from '@takt/plant-schema/apply-scenario'` no código do motor;
  - recusa `applyScenario` e `validatePlant` importados da raiz `@takt/plant-schema` no código do motor;
  - aceita importações de valores do esquema em specs.
- **Teste do esquema:** o caminho `@takt/plant-schema/apply-scenario` exporta `applyScenario`.
- **Testes das séries:** uma fatia sem saída tem lead time `null`. Uma fatia com saídas tem a média delas, com valores calculados à mão (plano do sub-plano 4, tarefa 7).

## Relacionados

- [ADR-0011](0011-motor-de-simulacao-e-esquema.md), itens 2 e 8, que este registro complementa; [ADR-0008](0008-validacao-de-dados.md) (validação na borda); [ADR-0013](0013-erros-esperados.md).
- [UC-SIM-002](../product/use-cases/uc-sim-002-executar-simulacao.md); [RN-SIM-001](../product/rules/simulation.md), [RN-SIM-013](../product/rules/simulation.md) e [RN-SIM-018](../product/rules/simulation.md).
- [Plano do sub-plano 4](../plans/2026-11-26-motor-nucleo-e-linha-simples.md); [pesquisa da literatura do motor](../research/literatura-do-motor.md).

## Em aberto

- Se a versão do esquema conta na versão do motor que o resultado registra (sub-plano 6).
- Como o MSER-5 e as médias entre replicações tratam o `null` das fatias sem saída (sub-planos 6 e 7).
