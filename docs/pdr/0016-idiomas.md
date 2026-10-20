# PDR-0016: Internacionalização e idiomas do projeto

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O portfólio pode ser visto por recrutadores de fora do Brasil, e o produto pode ser vendido em outros países. **Fato:** colocar internacionalização depois exige caçar texto fixo espalhado pelo código.

## Decisão

1. A **interface** é bilíngue desde o MVP: **português do Brasil (padrão) e inglês**, incluindo o conteúdo didático.
2. **Idioma:** detectado pelo navegador na primeira visita e depois salvo no perfil.
3. **O que o usuário cria não é traduzido.** Nomes padrão ("Estação 1") nascem no idioma de quem cria e passam a ser conteúdo do usuário. A fábrica de exemplo existe nas duas línguas.
4. **Idiomas do projeto:**
   - documentação, PDRs e ADRs em português;
   - código, `CLAUDE.md`, skills e agentes em inglês;
   - o glossário traz o nome usado no código, em inglês.

## Alternativas consideradas

- **Só português no MVP:** a tradução depois seria uma caça manual.
- **Conteúdo didático só em português no início:** descartado; já que a internacionalização existe, os dois idiomas saem juntos.

## Consequências

- **Estimativa:** o conteúdo didático é o item de tradução mais caro.
- **Em aberto:** quem garante a qualidade técnica do texto em inglês.

## Regras derivadas

- `RN-I18-001`: o idioma inicial vem do navegador e depois é salvo no perfil.
- `RN-I18-002`: o conteúdo criado pelo usuário não é traduzido.
- `RN-I18-003`: o JSON da planta não depende de idioma (ponto decimal, unidades fixas).
- `RN-I18-004`: a API devolve códigos, nunca frases; a interface traduz.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "Princípios".
- `product/ux-visual.md` e `product/glossary.md` (a criar).
