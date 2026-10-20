# ADR-0011: Motor de simulação e esquema da planta

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `@takt/sim-engine`, `@takt/plant-schema`, `takt-web-app` |

## Contexto

O motor é o principal ativo técnico e precisa ser correto antes de aparecer em aula ([PDR-0008](../pdr/0008-simulacao-com-reproducao.md)). Já estão decididos: eventos discretos, semente fixa, replicações, "avançar até t" e cena 3D que só reproduz ([PDR-0008](../pdr/0008-simulacao-com-reproducao.md)); três modos de execução e assistente MSER-5 ([PDR-0020](../pdr/0020-modos-de-simulacao-e-aquecimento.md)); esquema em Zod ([ADR-0008](0008-validacao-de-dados.md)). Bases: [pesquisa sobre aquecimento](../research/aquecimento-em-simulacao-didatica.md) e a pesquisa rápida sobre geradores ([references.md](../product/references.md#geração-de-números-aleatórios)).

## Decisão

1. **`@takt/sim-engine` é TypeScript puro**, sem React, Three.js nem DOM. No `takt-web-app`, roda num Web Worker.
2. **`@takt/plant-schema` é a única entrada do motor.** A planta é validada e migrada antes ([ADR-0008](0008-validacao-de-dados.md)) e depois **compilada** para o modelo interno: unidades convertidas, grafo de elementos montado, sequências aleatórias atribuídas. O motor depende só dos tipos do esquema.
3. **Núcleo de eventos discretos:** lista de eventos futuros num *heap* binário, com desempate determinístico (tempo, depois tipo de evento, depois ordem de inserção).
4. **Tempo interno em segundos**, como número decimal. A planta guarda a unidade no nome do campo (`meanSec`, `mtbfMin`); a compilação converte.
5. **Gerador MRG32k3a**, portado do pacote RngStreams (L'Ecuyer et al., 2002), sem biblioteca externa:
   - **uma sequência por elemento aleatório** (cada fonte, cada estação, cada falha), derivada da semente do cenário: números aleatórios comuns entre cenários (RN-SIM-010);
   - **uma subsequência por replicação**;
   - `Math.random()` é proibido no motor.
6. **Distribuições geradas pelo método da inversão** (cada amostra = inversa da função de distribuição aplicada a um único número uniforme), sem métodos de aceitação e rejeição:
   - **fixa:** sem sorteio;
   - **exponencial:** `x = −média · ln(1 − u)`;
   - **triangular:** fórmula fechada por partes;
   - **normal truncada:** `u` reescalado para o intervalo [F(a), F(b)] e aplicada a inversa da normal, calculada pelo **algoritmo AS 241 de Wichura** (o mesmo usado pelo `qnorm` do R).

   **Por quê (fato):** a inversão cria fluxos correlacionados a partir dos mesmos números uniformes, o que mantém o pareamento dos números aleatórios comuns; métodos de rejeição podem dessincronizar os fluxos (Schmeiser e Kachitvichyanukul, WSC 1986). Glasserman e Yao (1992) mostram que o ganho dos números aleatórios comuns depende de monotonicidade, que a inversão garante.
7. **Três modos** (turno, continuar do turno anterior, regime estável). No regime estável, as estatísticas são zeradas no fim do aquecimento e o estado é mantido (RN-SIM-008). O **MSER-5** é uma função pura sobre as séries (RN-SIM-009).
8. **Saídas de cada execução:**
   - indicadores por replicação, com média e intervalo de confiança de 95% (distribuição t);
   - **séries por intervalo**, por padrão a cada **1 minuto simulado**: vazão, WIP médio e lead time das peças que entraram;
   - **estado final da fábrica**, para o modo "continuar";
   - **log de eventos completo só da replicação animada**; as demais devolvem só indicadores e séries;
   - versão do motor, semente e modo, para reprodutibilidade (RN-SIM-001).
9. **Duas formas de uso:** `run` (todas as replicações até o fim) e `step`/`advanceUntil(t)` (reprodução controlável e, no futuro, interação em tempo real).
10. **Replicações independentes podem rodar em vários Workers em paralelo** sem perder o determinismo, porque cada uma tem a própria subsequência.

## Alternativas consideradas

- **pure-rand (xoroshiro128+):** biblioteca mantida, com saltos; descartada por não ser o padrão das ferramentas de simulação.
- **Mersenne Twister (`@stdlib`):** muito conhecido, sem sequências e subsequências nativas.
- **Biblioteca de simulação pronta:** menos controle sobre determinismo, log e modos; o motor é o ativo do portfólio.
- **Tempo em inteiros (milissegundos):** evita erro de arredondamento, mas complica distribuições contínuas; reavaliar se os testes de determinismo mostrarem problema.

## Consequências

**Positivas:**
- Resultados reproduzíveis e comparáveis entre cenários, com o mesmo gerador das ferramentas de simulação.
- O motor roda igual no navegador, nos testes e, no futuro, num serviço do servidor.

**Negativas e custos:**
- Implementar e manter o gerador. Mitigação: teste contra a saída da implementação de referência.
- O algoritmo AS 241 e a fórmula da triangular precisam ser conferidos contra uma implementação de referência (por exemplo, o `qnorm` do R e o `triinv` do Octave).
- **Fato:** o MRG32k3a não é perfeito nos testes estatísticos mais rigorosos (resultados limítrofes ocasionais no BigCrush, segundo a NVIDIA).
- Séries por intervalo e estado final aumentam o volume de dados de cada execução.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Planta importada desenhada para travar o motor** (milhares de elementos, laços de retrabalho, duração enorme) | Navegador travado; no futuro, servidor sobrecarregado | Validação prévia ([ADR-0008](0008-validacao-de-dados.md)); limite de retrabalho (RN-SIM-006); **tetos de segurança**: número máximo de elementos por planta, duração simulada máxima e número máximo de eventos por execução. Ao passar de um teto, a execução para com o código `SIMULATION_LIMIT_EXCEEDED`, em vez de travar |
| **Código do motor acessando o DOM ou a rede** | Vazamento de dados da página | Motor sem acesso ao DOM (regra de fronteira do Nx); Worker sem acesso à página |
| **Log de eventos muito grande** | Memória esgotada | Log completo só da replicação animada |

## Conformidade

- Regra de fronteira: `@takt/sim-engine` não importa React, Three.js nem APIs do DOM ([ADR-0001](0001-monorepo-nx-e-nomes.md)).
- Lint: `Math.random` proibido no motor.
- Teste das distribuições: inversa da normal e da triangular iguais às de referência dentro da tolerância numérica; média e variância amostrais compatíveis com as teóricas.
- Teste do gerador: a saída das primeiras sequências e subsequências é idêntica à da implementação de referência do RngStreams.
- Teste de determinismo: duas execuções com a mesma entrada produzem resultados idênticos, inclusive em Workers paralelos.
- Testes contra a literatura e por propriedade ([ADR-0009](0009-estrategia-de-testes.md), [simulation.md](../product/simulation.md)), incluindo a Lei de Little exata em janela finita.
- Mutação mínima de 80% no motor ([ADR-0009](0009-estrategia-de-testes.md)).

## Relacionados

- [PDR-0008](../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../pdr/0014-roteamento-definido-pelo-usuario.md), [PDR-0020](../pdr/0020-modos-de-simulacao-e-aquecimento.md).
- [ADR-0008](0008-validacao-de-dados.md), [ADR-0009](0009-estrategia-de-testes.md).
- Regras: [simulation.md](../product/rules/simulation.md).

## Em aberto

- Valores dos tetos de segurança. **Não há literatura para isso** (é capacidade do navegador); serão medidos com um teste de desempenho no marco 1.
- Número de replicações piloto do assistente MSER-5 e de tentativas.
- Quantos Workers usar em paralelo por padrão.
- Documento de arquitetura do motor e do esquema (`docs/architecture/sim-engine.md` e `plant-schema.md`), na implementação do marco 1.
