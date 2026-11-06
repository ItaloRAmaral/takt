# Pesquisas

> **Resumo.** Pesquisas na literatura que embasam decisões do Takt. Cada pesquisa tem um relatório (conclusões, com fato, estimativa e palpite separados) e as notas brutas por subtema. As referências usadas ficam também em [`../product/references.md`](../product/references.md).

Atualizado em 06/11/2026.

| Pesquisa | Pergunta | Data | Usada em |
| --- | --- | --- | --- |
| [Aquecimento em simulação didática](aquecimento-em-simulacao-didatica.md) | Começar vazio ou em regime estável; como dimensionar o aquecimento; como validar o motor contra casos analíticos | 20/10/2026 | PDR-0020, ADR-0011 |
| [Explicação em camadas na interface](explicacao-em-camadas-na-interface.md) | A literatura valida dica + painel "Saiba mais" + explicação do resultado? | 20/10/2026 | PDR-0021 |
| [Escolhas técnicas do front-end](escolhas-tecnicas-do-front-end.md) | Framework, 3D, estado e dados, interface, i18n e gráficos mais estáveis e aceitos em outubro de 2026 | 20/10/2026 | ADR-0012 |
| [Agentes e skills da comunidade](agentes-e-skills-da-comunidade.md) | Agentes, skills, hooks e plugins de revisão, segurança, testes e documentação mais aceitos; boas práticas oficiais | 20/10/2026 | `CLAUDE.md`, skills e agentes do Takt |
| [Guia de estilo de código](guia-de-estilo-de-codigo.md) | Clean code e suas críticas, critérios de desvio, convenções de TypeScript e NestJS, hexagonal e repositório, lições do `cliniccontrol` | 21/10/2026 | Guia de estilo (`docs/architecture/code-style.md`), `.claude/rules/`, skill de planejamento |
| [Precisão da função de distribuição da normal](precisao-da-normal.md) | Hart (West 2005) tem a precisão que o plano estimou? Há alternativa publicada com erro relativo pequeno na cauda? | 05/11/2026 | [Fundamentos do motor](../plans/2026-11-04-motor-fundamentos.md), tarefa 5; [`sim-engine.md`](../architecture/sim-engine.md) |
| [Literatura do motor](literatura-do-motor.md) | As afirmações e escolhas do roteiro do motor estão certas segundo a literatura? Gerador, distribuições, IC, D4, casos de validação, MSER-5, fila, bloqueio, falhas, OEE e gargalo | 04/11/2026 | [Roteiro do motor](../plans/2026-11-04-roteiro-motor.md); corrige pontos da pesquisa sobre aquecimento |

Notas: [notes/aquecimento/](notes/aquecimento/), [notes/explicacao/](notes/explicacao/), [notes/front-end/](notes/front-end/), [notes/agentes-e-skills/](notes/agentes-e-skills/), [notes/estilo-de-codigo/](notes/estilo-de-codigo/), [notes/literatura-do-motor/](notes/literatura-do-motor/).

**Regra:** toda referência usada no produto, nos PDRs ou nos ADRs entra em [`../product/references.md`](../product/references.md).
