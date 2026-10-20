# PDR-0009: Acesso no MVP: organização + papel

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

Login custa cerca de 2 semanas (**estimativa**) e não é necessário para validar o ensino, mas é central para o portfólio e para a venda futura.

## Decisão

1. **Login no MVP**, com e-mail e senha.
2. **Acesso por organização + papel**: administrador, instrutor e aprendiz no MVP; analista depois. Uma pessoa pode ter vários papéis, um por organização.
3. **Sempre existe uma organização.** Quem se cadastra sozinho ganha uma **organização pessoal** automática.
4. **Só maiores de 18** no MVP, por causa da LGPD.
5. **Contas demo por papel**, restauradas todo dia, para recrutadores testarem.

## Alternativas consideradas

- **MVP sem login:** descartado ([PDR-0001](0001-objetivos-do-produto.md)).
- **Conta global compartilhada:** eliminaria a autorização que o portfólio quer mostrar.
- **Usuário sem organização:** deixaria o campo de organização opcional, com exceções no RLS e dois caminhos de código.

## Consequências

- O modelo é o de produtos como Notion e GitHub.
- O isolamento no banco (RLS) é decisão técnica e vai para um ADR.

## Regras derivadas

- `RN-ACE-001`: um papel vale para uma organização, nunca globalmente.
- `RN-ACE-002`: todo usuário pertence a pelo menos uma organização; a pessoal é criada no cadastro.
- `RN-ACE-003`: o cadastro exige declarar ser maior de 18.
- `RN-ACE-004`: acesso a uma organização sem associação responde como inexistente.
- `RN-ACE-005`: contas demo vivem numa organização isolada e são restauradas todo dia.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "Como o produto se organiza".
- `product/access.md` (a criar).
