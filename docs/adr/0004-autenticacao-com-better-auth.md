# ADR-0004: Autenticação com Better Auth dentro da API

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api` (módulo `identity`), `takt-web-app` |

## Contexto

O Takt precisa de cadastro e login por e-mail e senha no MVP, com recuperação de senha e proteção contra força bruta. A regra do projeto é **não criar criptografia própria**. Também se quer manter os dados de usuários no próprio banco e mostrar, no portfólio, o domínio da arquitetura de autenticação.

O fundador sempre usou JWT com Passport e não conhece Better Auth nem sessões no banco.

## Decisão

1. **A autenticação roda dentro da `takt-core-api`**, no módulo `identity`, com a biblioteca **Better Auth**.
2. **No MVP:** cadastro e login por e-mail e senha, saída, recuperação de senha e limite de tentativas. Sem login social e sem SSO.
3. **Armazenamento** no PostgreSQL do Takt, pelo adaptador Prisma do Better Auth.
4. **A autenticação responde só "quem é".** A autorização (papéis, planos, organizações) é código nosso ([ADR-0006](0006-autorizacao-por-organizacao.md)); recursos de organização ou papel da biblioteca não são usados.
5. **O cadastro cria a organização pessoal** (RN-ACE-002) e exige a declaração de maioridade (RN-ACE-003) na mesma operação, por meio dos ganchos da biblioteca.
6. **Senhas com Argon2id**, configurado no Better Auth. É a primeira recomendação da OWASP para armazenar senhas. A biblioteca de Argon2id é escolhida na implementação, entre as que têm manutenção ativa, com os parâmetros recomendados pela OWASP na época.
7. **O resto da API não conhece o Better Auth:** ele fica atrás de uma porta (`SessionReader`: dado o pedido, devolve o usuário ou nada), implementada em `modules/identity/infra/`.

## Alternativas consideradas

- **Passport + sessões escritas por nós:** mais trabalho (sessões, recuperação de senha, limites) e mais pontos para errar; mostra mais no portfólio, mas aumenta o risco.
- **Provedor gerenciado (Clerk, Auth0, Supabase Auth):** menos código; dados de usuários fora do nosso banco, custo e dependência de fornecedor.
- **Lucia:** **fato:** descontinuada como biblioteca em 2025.
- **JWT com Passport** (padrão do `cliniccontrol`): ver [ADR-0005](0005-sessao-no-banco-com-cookie.md).

## Consequências

**Positivas:**
- Fluxos de autenticação prontos e mantidos por uma biblioteca ativa.
- Dados de usuários no nosso banco, sob as mesmas regras de LGPD.
- Trocar a biblioteca afeta só o módulo `identity`.

**Negativas e custos:**
- O Better Auth é pensado para frameworks web em geral; a integração com o NestJS precisa ser feita e testada por nós.
- Dependência de uma biblioteca relativamente nova.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Força bruta e *credential stuffing*** (senhas vazadas de outros sites) | Invasão de contas | Limite de tentativas por IP e por conta; Argon2id torna cada tentativa cara |
| **Enumeração de contas** (descobrir quais e-mails estão cadastrados) | Alvo para *phishing* e força bruta | Respostas iguais no login, no cadastro e na recuperação de senha, exista ou não a conta |
| **Senha fraca** | Conta fácil de adivinhar | Tamanho mínimo de 12 caracteres, sem regras de composição (orientação da OWASP); checagem contra senhas vazadas fica em aberto |
| **Token de recuperação de senha roubado ou reutilizado** | Tomada de conta | Token de uso único, com expiração curta, guardado como hash; as sessões existentes caem quando a senha é trocada |
| **Cadastro com e-mail de outra pessoa** (sem verificação de e-mail no MVP) | Conta em nome de terceiros; e-mails indesejados | Em aberto: decidir se a verificação de e-mail entra no MVP |
| **Vulnerabilidade na própria biblioteca** | Falha de autenticação | Versão fixada, alertas de segurança do GitHub, atualização prioritária de correções |

## Conformidade

- Nenhum módulo fora de `identity` importa o Better Auth (lint de fronteiras).
- Testes ponta a ponta: cadastro (com e sem declaração de maioridade), login, saída, sessão expirada, recuperação de senha, limite de tentativas.
- Teste: todo cadastro termina com exatamente uma organização pessoal e uma associação de administrador.
- Teste: o hash de senha gravado no banco é Argon2id.

## Relacionados

- [PDR-0009](../pdr/0009-acesso-no-mvp.md).
- Regras: `RN-ACE-002`, `RN-ACE-003`, `RN-ACE-005`.
- [ADR-0005](0005-sessao-no-banco-com-cookie.md).

## Em aberto

- Envio de e-mail de recuperação de senha no MVP (provedor de e-mail).
- Versão do Better Auth, fixada no início da implementação.
