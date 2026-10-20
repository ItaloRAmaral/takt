# ADR-0005: Sessão no banco com cookie e proxy pelo front

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api`, `takt-web-app`, hospedagem |

## Contexto

Era preciso escolher como o navegador prova quem é a cada requisição: um token sem estado (JWT) ou uma sessão guardada no banco. **Cookie e JWT não são opostos:** cookie é o meio de transporte, JWT é um formato de token.

Forças:
- **Revogação:** sair, trocar a senha ou bloquear uma conta comprometida deve valer na hora.
- **Segurança no navegador:** um token legível por JavaScript pode ser roubado por XSS.
- **Fato:** o padrão robusto de JWT (token de acesso curto + *refresh token* guardado no banco, com rotação) já é uma sessão no banco, com mais partes móveis.
- **Fato:** toda requisição do Takt já vai ao banco (associação e RLS), então a vantagem do JWT de "não consultar o banco" não existe aqui.
- **Correção registrada:** a remoção de um membro vale na hora com qualquer das opções, porque a associação é checada no banco a cada requisição. O ganho da sessão está na identidade, não nos papéis.

## Decisão

1. **Sessão guardada no banco.** O login gera um token aleatório (sem dados dentro); a tabela de sessões guarda usuário, expiração, IP e navegador.
2. **Cookie** `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`.
3. **Expiração deslizante:** a sessão expira após **7 dias sem uso** e é renovada quando usada, **no máximo uma vez por dia** (para não escrever no banco a cada requisição). Nas **contas demo**, a sessão dura **1 dia**.
4. **Revogação:** sair apaga a sessão; trocar a senha apaga as outras sessões do usuário; "sair de todos os dispositivos" apaga todas.
5. **Proteção contra CSRF:** `SameSite=Lax` mais checagem de origem nas requisições que alteram dados.
6. **Mesmo site em produção por proxy:** o `takt-web-app` responde em `/api/...` e repassa para a `takt-core-api`. Para o navegador, tudo é um único site, e o cookie não é tratado como de terceiros.
7. **Desenvolvimento:** `localhost` com portas diferentes. **Fato:** cookies não separam por porta, então funciona sem proxy.
8. **Limpeza periódica** das sessões expiradas.

## Alternativas consideradas

- **JWT sem estado:** sem consulta ao banco, mas a revogação só vale na expiração, a menos que se crie uma lista de bloqueio (que volta ao banco).
- **JWT + refresh token no banco:** robusto, mas com dois mecanismos e rotação de token para manter.
- **Subdomínios** (`app.` e `api.` do mesmo domínio): funciona, mas exige configurar o domínio do cookie e o CORS; o proxy é mais simples.

## Consequências

**Positivas:**
- Revogação imediata e nenhum token acessível ao JavaScript.
- Menos partes móveis do que JWT com *refresh token*.
- Sem CORS em produção, porque tudo está na mesma origem.

**Negativas e custos:**
- Uma consulta de sessão por requisição. **Estimativa:** cerca de 1 ms com índice; a biblioteca oferece cache curto se for preciso.
- Proteção contra CSRF obrigatória.
- O proxy acrescenta um salto entre o front e a API.
- Para apps móveis ou APIs de terceiros no futuro, será preciso um mecanismo de token (o Better Auth tem plugin de JWT).

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **CSRF** (um site malicioso dispara ações usando o cookie) | Ações em nome do usuário | `SameSite=Lax` e checagem de origem nas requisições que alteram dados; nenhuma alteração por `GET` |
| **Fixação de sessão** | O atacante reaproveita uma sessão criada por ele | Um token novo a cada login |
| **Vazamento da tabela de sessões** | Sessões sequestradas | Guardar só o hash do token, se a biblioteca permitir; caso contrário, registrar o risco e restringir o acesso à tabela |
| **XSS** (script malicioso na página) | Mesmo sem ler o cookie, o script age em nome do usuário | Política de segurança de conteúdo (CSP) no front; nada de HTML do usuário renderizado sem escape |
| **Cookie trafegando sem TLS** | Roubo do cookie na rede | `Secure` e HSTS em produção |
| **Cabeçalhos do proxy falsificados** (`X-Forwarded-For`) | IP errado no log e limite de tentativas contornado | Confiar só nos cabeçalhos vindos do proxy conhecido |

## Conformidade

- Teste: o cookie de sessão sai com `HttpOnly`, `Secure` e `SameSite=Lax`.
- Teste: uma sessão sem uso por mais de 7 dias é recusada; uma sessão demo, após 1 dia.
- Teste: depois de sair, o mesmo cookie é recusado; depois de trocar a senha, as outras sessões são recusadas.
- Teste: uma requisição que altera dados vinda de outra origem é recusada.

## Relacionados

- [ADR-0004](0004-autenticacao-com-better-auth.md).
- Regra: `RN-ACE-005` (contas demo).

## Em aberto

- Configuração do proxy no ambiente de hospedagem (tema próprio).
