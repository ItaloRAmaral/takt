# PDR-0008: Simulação com reprodução controlável

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

Havia três modos de interação possíveis:
- **A.** Execução e resultado.
- **B.** Reprodução controlável.
- **C.** Interação em tempo real, mudando parâmetros durante a execução.

Cada uso do produto se serve melhor de um: Capacitar de B, missões de C, Analisar de A.

## Decisão

1. O MVP usa **B**: a fábrica "viva", com play, pause e velocidade de 1x a 100x.
2. O motor é de **eventos discretos**, executa replicações com semente fixa e **sabe avançar até um instante t**. Isso deixa C possível depois sem reescrever o motor.
3. A cena 3D só reproduz o log de eventos; nunca calcula.

## Alternativas consideradas

- **A, só execução e resultado:** visualmente fraco para o portfólio.
- **C no MVP:** **estimativa** de semanas a mais; a reprodutibilidade e as replicações conflitam com a interação.

## Consequências

- Os resultados são reproduzíveis e testáveis contra a literatura.
- C fica como objetivo das missões.

## Regras derivadas

- `RN-SIM-001`: a mesma planta com a mesma semente dá o mesmo resultado.
- `RN-SIM-002`: a cena 3D só reproduz o log do motor.
- `RN-SIM-003`: os indicadores mostram média e intervalo de confiança das replicações.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "O MVP em uma tela".
- `product/simulation.md` (a criar).
