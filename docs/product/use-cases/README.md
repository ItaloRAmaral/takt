# Casos de uso

> **Resumo.** Cada caso de uso descreve um objetivo de quem usa o sistema, passo a passo, com as falhas e variações de cada passo. Os casos citam as regras (`RN-...`) e os ADRs, sem reescrevê-los, e dão nome aos testes (`UC-SIM-002: ...`). Cada marco começa escrevendo os seus.

Atualizado em 03/11/2026 · Formato: Alistair Cockburn, *Writing Effective Use Cases* (2001), versão completa, sem o campo "Technology & Data Variations" · Decisões: [PDR-0015](../../pdr/0015-marcos-mostraveis.md).

## Formato

```markdown
# UC-XXX-NNN: <verbo + objetivo do ator>

| Campo | Valor |
| --- | --- |
| Ator principal | quem tem o objetivo |
| Escopo | o sistema ou a biblioteca que entrega o objetivo, vista de fora |
| Nível | objetivo do usuário (o ator "vai embora satisfeito") ou subfunção |
| Interessados | quem mais se importa com o resultado, e o que quer |
| Pré-condições | o que já é verdade antes de começar |
| Garantia mínima | o que vale mesmo se der errado |
| Garantia de sucesso | o que vale quando dá certo |
| Gatilho | o que inicia o caso |
| Regras e decisões | `RN-...` e ADRs que o caso aplica |

## Cenário principal

1. Passos numerados, do gatilho até a garantia de sucesso.

## Extensões

- **2a.** Condição no passo 2: o que acontece, com o código de erro.

## Em aberto

- O que ainda não foi decidido.
```

## Convenções

- **ID estável:** `UC-<DOMÍNIO>-NNN`, com os prefixos das [regras](../rules/README.md). Um ID nunca é reutilizado.
- **Um arquivo por caso,** em minúsculas: `uc-sim-001-validar-planta.md`.
- **O caso cita, não reescreve:** o enunciado exato fica na regra ou no ADR; o caso diz em que passo ele se aplica.
- **Sem detalhe de implementação:** nomes de funções, formatos de retorno, códigos internos e tolerâncias de teste ficam nos planos e em `docs/architecture/`.
- **"Em aberto" só com decisões de produto deste caso.** Uma pendência que já está aberta numa regra ou num ADR é citada em "Regras e decisões", não repetida; um detalhe técnico vai para o plano.
- **Testes:** um teste que verifica um passo ou uma extensão leva o ID do caso no nome; um teste de uma regra leva o ID da regra.

## Índice

| Caso | Objetivo | Escopo | Marco |
| --- | --- | --- | --- |
| [UC-SIM-001](uc-sim-001-validar-planta.md) | Validar uma planta | `@takt/plant-schema` | 1 |
| [UC-SIM-002](uc-sim-002-executar-simulacao.md) | Executar uma simulação | `@takt/sim-engine` | 1 |
| [UC-SIM-003](uc-sim-003-sugerir-aquecimento.md) | Sugerir o aquecimento | `@takt/sim-engine` | 1 |
| [UC-SIM-004](uc-sim-004-avancar-ate-instante.md) | Avançar a simulação até um instante | `@takt/sim-engine` | 1 |

No marco 1 não há tela: o ator é a aplicação que chama o motor (a casca do Worker no `takt-web-app`; nos testes, a suíte). Professor e aluno aparecem como interessados. Os casos com tela, dos marcos 2 e 3, usam estes.
