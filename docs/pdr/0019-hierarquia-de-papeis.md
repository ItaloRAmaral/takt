# PDR-0019: Hierarquia de papéis

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

Na organização pessoal, o usuário é administrador, mas precisa montar plantas como um instrutor. Era preciso decidir se os papéis se acumulam ou se herdam.

## Decisão

1. **O papel mais alto herda as permissões dos mais baixos:** administrador > instrutor > aprendiz.
2. **Nomes em inglês no código:** papéis `admin`, `instructor`, `learner` (e `analyst` na fase 3); permissões no formato `resource:action`, como `plant:publish` e `group:manage`.

## Alternativas consideradas

- **Papéis independentes, acumulados por associação:** mais flexível, porém mais complexo de entender e testar no MVP.

## Consequências

- **O analista (fase 3) não cabe na escada:** não está acima nem abaixo do instrutor. Quando ele entrar, a hierarquia vira um conjunto de permissões por papel, o que deve ser registrado num PDR novo.

## Regras derivadas

- `RN-ACE-006`: o papel mais alto herda as permissões dos mais baixos.

## Reflete em

- [product/access.md](../product/access.md).
- [product/glossary.md](../product/glossary.md).
