# Esquema da planta (`@takt/plant-schema`)

> **Resumo.** Como o esquema da planta é construído hoje. É a única entrada do motor: o Zod 4 define a forma do documento (objetos estritos, todo valor escrito), funções puras verificam as regras da planta, e o resultado é a planta tipada ou a lista completa de problemas `{ elementId?, path, code }`. O JSON Schema publicado é gerado do mesmo esquema. O porquê está no [ADR-0008](../adr/0008-validacao-de-dados.md), no [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md) e no [PDR-0022](../pdr/0022-modelo-de-fluxo-da-planta.md); o plano que o construiu é o [esquema da planta v1](../plans/2026-11-25-esquema-da-planta-v1.md).

Atualizado em 26/11/2026 (sub-plano 4 concluído: o motor importa `applyScenario` pelo caminho próprio).

## Estrutura

Em `libs/plant-schema/src/`, pastas pelos dois níveis de validação do ADR-0008. Na raiz fica só o que o `index.ts` exporta como função ou valor:

| Onde | O que tem |
| --- | --- |
| `validate-plant.ts` | `validatePlant`, a entrada única |
| `apply-scenario.ts` | `applyScenario` |
| `defaults.ts` | Os padrões do editor |
| `limits.ts` | `PLANT_LIMITS`, todos os limites num só lugar |
| `structure/` | A forma do documento, em Zod, um arquivo por parte: `ids.ts` (`idSchema` e `nameSchema`), `time-distribution.ts`, `routing.ts`, `settings.ts`, `elements.ts` (os seis tipos e `elementParamSchemas`), `scenario.ts` (cenários e sobreposições), `plant.ts` (`plantSchema`) e `issues.ts` (`PlantIssue`, os códigos e `parseStructure`) |
| `semantics/` | As regras da planta: referências, faixas, grafo, grade, roteamento, cenários |
| `tests/helpers/` | `makePlant` e os construtores de elementos; `catchError` (cópia do motor, que o esquema não pode importar). Fora do build (`tsconfig.lib.json`) e proibidos fora dos specs pelo lint, com teste de conformidade |

O esquema não importa o motor (lint e teste de conformidade). Do pacote principal, o código do motor só importa **tipos** (ADR-0011, item 2); o único valor que ele importa é o `applyScenario`, pelo caminho `@takt/plant-schema/apply-scenario` ([ADR-0015](../adr/0015-cenario-aplicado-e-series-do-motor.md)). O lint do motor recusa qualquer outro valor do esquema, com casos no teste de conformidade; os specs e os auxiliares de teste do motor podem importar valores (`validatePlant`, `createDefault*`) para montar plantas válidas.

## O documento

A forma está no exemplo do [modelo da planta](../product/plant-model.md). Pontos que o exemplo não mostra:

- **Todo objeto é estrito:** uma chave desconhecida, inclusive `__proto__` vindo do `JSON.parse`, vira `UNKNOWN_FIELD`. Nenhum campo tem `.default()`: o documento traz todos os valores, porque o `default` do JSON Schema não preenche nada e o do Zod preenche, e um padrão mudado numa versão nova mudaria plantas antigas.
- **Tempos em segundos** em todo elemento (`valueSec`, `meanSec`, `minSec`, `modeSec`, `maxSec`, `standardDeviationSec`); a duração do cenário em horas (`durationH`); o aquecimento em minutos (`warmupMin`). A normal truncada grava `minSec` e `maxSec`, com `null` para "sem máximo".
- **Pisos acima de 0** onde zero agendaria eventos sem fim: intervalo fixo da fonte e tempo fixo até a falha (`timeDistributionSchema({ positive: true })`), média da exponencial, desvio da normal, `idealCycleSec`, comprimento e velocidade da esteira. O ciclo e o reparo podem ser 0.
- **Grade:** `pos` é a célula de menor coluna e menor linha; a rotação `rotDeg` é 0, 90, 180 ou 270 graus; `size` é colunas por linhas a 0° e 180° e se inverte a 90° e 270°.
- **Roteamento na saída do elemento** (`routing`), `null` quando há uma saída só. Expedição e refugo não têm o campo.
- **Sobreposições:** uma variante por parâmetro (`interarrival`, `queueCapacity`, `cycle`, `idealCycleSec`, `defectRate`, `failure`, `capacity`, `lengthM`, `speedMPerMin`, `routing`, `reworkLimit`), cada valor com o mesmo esquema do campo que troca, e por isso com os mesmos pisos e tetos.
- **`$schema`** opcional, para editores validarem o arquivo exportado.

## Limites

`PLANT_LIMITS`, em `limits.ts`, é a única fonte dos números abaixo (o padrão dos IDs também vem dele) e fecha o "Em aberto" do ADR-0008 sobre limites. Os de quantidade e de valor foram aprovados pelo fundador em 24 e 25/11/2026; os menores são estimativas do plano. Nenhum tem fonte publicada; o sub-plano 9 mede os tetos do motor.

| Limite | Valor |
| --- | --- |
| Elementos, conexões | 500, 2000 |
| Zonas, cenários, sobreposições por cenário | 50, 20, 2000 |
| Capacidades (buffer, esteira, fila da fonte) | até 10 000 |
| Todo tempo | até 1 ano (31 536 000 s) |
| Duração do cenário | até 720 h |
| Grade | até 200 × 200 células |
| IDs, nomes | 1 a 64 caracteres, 1 a 120 caracteres |
| Limite de retrabalho | 0 a 10 |
| Comprimento e velocidade da esteira | até 10 000 m e 10 000 m/min |
| Semente | inteiro de 0 a 4 294 967 295 |
| Replicações | 5 a 100 (RN-SIM-003) |
| Endereço do `$schema` | até 2048 caracteres |

## Validação

`validatePlant(document)` faz, nesta ordem:

1. **Versão:** só um `schemaVersion` inteiro seguro maior que `CURRENT_SCHEMA_VERSION` (1) é "mais novo" e devolve só `UNSUPPORTED_SCHEMA_VERSION`. Outro valor inválido (1.5, texto) é problema de forma. A v1 não tem migração; a cadeia começa na v2, com arquivos de exemplo de cada versão (ADR-0009).
2. **Forma**, por `parseStructure`, o único lugar que chama `safeParse` com `reportInput: true` (para separar `REQUIRED` de `INVALID_TYPE`; a entrada recebida nunca sai dele). Com problema de forma, devolve só esses, todos de uma vez ([UC-SIM-001](../product/use-cases/uc-sim-001-validar-planta.md), extensões 3a e 3b).
3. **Regras da planta base** (`validateSemantics`), na ordem das verificações: referências, faixas das distribuições, grafo, grade, roteamento. Uma regra que aponta para um elemento inexistente só gera `UNKNOWN_REFERENCE`.
4. **Cenários** (`checkScenarios`): sobreposições aplicáveis e não repetidas, aquecimento só no regime estável e menor que a duração (um aquecimento inválido não esconde os problemas das sobreposições) (comparado como `warmupMin / 60 >= durationH`, sem o erro de arredondamento de `durationH * 60`), e, com as sobreposições aplicadas, só as regras que uma sobreposição pode quebrar (`validateOverridableRules`: referências, faixas e roteamento; a grade e o grafo dependem de posições, tamanhos e conexões, que nenhuma sobreposição muda). Um problema que a base já tem não se repete, a não ser que caia dentro do campo trocado por uma sobreposição. Um problema dentro do campo trocado aponta para a sobreposição (`['scenarios', i, 'overrides', k, 'value', ...]`); os outros, para o cenário (`['scenarios', i]`), com o `elementId`.

O `elementId` de um problema de forma vem do `id` bruto do elemento (ou do `elementId` da sobreposição), só quando ele passa no padrão dos IDs e nomeia um elemento do documento. Uma chave desconhecida entra no caminho só quando tem forma de identificador (1 a 64 letras ASCII, dígitos, `_`, `$` ou `-`); senão o caminho para no objeto que a contém. Assim nenhum texto arbitrário digitado pelo usuário (um e-mail, um *token*) chega à interface ou a um log (ADR-0007). Cada caminho e código aparece uma vez só na lista.

**Com um `DUPLICATE_ID`, a lista é parcial:** as regras trabalham pelo ID, e a segunda cópia de um ID repetido não é avaliada sozinha (por exemplo, não aparece como elemento solto). A planta já é recusada pelo `DUPLICATE_ID`; os demais problemas da cópia aparecem depois que ele for corrigido.

**Custo:** a sobreposição na grade compara retângulos, não células, e a validação por cenário não refaz grade nem grafo. Um documento de cerca de 100 KB montado para pesar (498 buffers de 200 × 200 células e 20 cenários) levava 10 s e passou a levar 60 ms (medido em 25/11/2026, Node 24, na máquina do fundador, depois da revisão de código). Os códigos e quando cada um vale estão em [rules/README.md](../product/rules/README.md#códigos-de-problema-da-planta).

**Mapeamento dos problemas do Zod** (`structure/issues.ts`, conferido no Zod 4.6.7 em 25/11/2026): `invalid_type` sem entrada → `REQUIRED`, com uma fração onde se espera inteiro → `OUT_OF_RANGE`, senão `INVALID_TYPE`; `too_big` e `too_small` → `TOO_MANY_ITEMS`/`TOO_FEW_ITEMS` em listas e textos, `OUT_OF_RANGE` em números; `invalid_format` → `INVALID_FORMAT`; `invalid_value` → `INVALID_VALUE`; `invalid_union` (discriminador) → `REQUIRED` se o discriminador falta, senão `INVALID_VALUE`; `unrecognized_keys` → um `UNKNOWN_FIELD` por chave. Os demais (`not_multiple_of`, `invalid_key`, `invalid_element`, `custom`) o esquema não produz: aparecer um é defeito, erro sem `code` (ADR-0013).

## Cenários aplicados

`applyScenario(plant, scenarioId)` devolve a planta como o cenário a roda: cada sobreposição troca o valor inteiro de um campo, sem mesclagem profunda; nem a planta base nem seus objetos mudam (os objetos que não mudam são compartilhados). Um `scenarioId` inexistente é defeito de quem chama (erro sem `code`). O motor aplica o cenário ele mesmo, na compilação ([ADR-0015](../adr/0015-cenario-aplicado-e-series-do-motor.md)).

**Caminho próprio:** o `package.json` exporta `"./apply-scenario"` → `./src/apply-scenario.ts`, com as mesmas condições do `"."`. O arquivo só importa tipos, então importá-lo não carrega o Zod, que o `index.ts` carrega. O teste `the apply-scenario path exports applyScenario` (`src/apply-scenario-path.spec.ts`) confere a exportação.

## Padrões do editor

Funções que devolvem objetos novos a cada chamada, para o editor alterar um elemento sem mudar o padrão dos seguintes: `createDefaultElement(type, { id, zoneId, pos })`, `createDefaultFailure()`, `createDefaultScenario({ id, name })`, `createDefaultSettings()`. Os valores estão na [RN-EDT-003](../product/rules/editor.md). Um teste confere que os construtores de teste (`makeStation` e os outros) são iguais aos padrões.

**Planta de exemplo do demo:** `libs/plant-schema/examples/demo-line.json`, com cinco estações fixas (40, 44, 56, 50 e 42 s), buffers de 10, chegadas exponenciais a cada 45 s, defeito de 2% na última estação com refugo, e os cenários "Atual", "M3 mais rápida" e "Com falhas". **Palpite:** os números deixam a linha sobrecarregada e fazem o gargalo passar da M3 para a M4; só valem depois de rodados com o motor (sub-planos 5 e 6). Um teste confere que o arquivo é válido.

## JSON Schema publicado

`libs/plant-schema/plant.schema.v1.json`, gerado pelo `z.toJSONSchema(plantSchema)` (Draft 2020-12; todo objeto com `additionalProperties: false`) e conferido pelo `src/json-schema.spec.ts`. Como regenerar está em [workspace.md](workspace.md#testes-cobertura-e-mutação). O JSON Schema só descreve a forma; as regras da planta não cabem nele (ADR-0008, "Consequências").
