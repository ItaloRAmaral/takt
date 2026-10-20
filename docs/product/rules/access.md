# Regras de acesso

> **Resumo.** Quem pode entrar e em que organização. O papel vale sempre dentro de uma organização, toda conta tem pelo menos uma organização e o acesso a organizações alheias responde como se elas não existissem.

Atualizado em 20/10/2026 · Origem: [PDR-0009](../../pdr/0009-acesso-no-mvp.md), [PDR-0019](../../pdr/0019-hierarquia-de-papeis.md).

### RN-ACE-001: Papel vale por organização

- **Enunciado:** um papel é atribuído a um usuário dentro de uma organização (associação) e só vale nela. Não existe papel global.
- **Origem:** PDR-0009.
- **Exemplo:** Ana é instrutora na organização A e aprendiz na B. Na B, ela não cria grupos.
- **Quando violada:** `FORBIDDEN`.

### RN-ACE-002: Toda conta tem uma organização

- **Enunciado:** no cadastro, o sistema cria uma organização pessoal, no plano gratuito, com o usuário como administrador. Não existe usuário sem associação.
- **Origem:** PDR-0009.
- **Exemplo:** Bruno se cadastra sozinho e já pode montar plantas na "área de Bruno".
- **Quando violada:** é um invariante; um teste garante que nenhum usuário fica sem associação.
- **Nota:** como administrador, ele também tem as permissões de instrutor ([RN-ACE-006](#rn-ace-006-papel-mais-alto-herda-os-mais-baixos)).

### RN-ACE-003: Só maiores de 18

- **Enunciado:** o cadastro exige que o usuário declare ser maior de 18 anos.
- **Origem:** PDR-0009.
- **Exemplo:** o formulário sem a declaração marcada não cria a conta.
- **Quando violada:** `AGE_REQUIREMENT_NOT_MET`.
- **Nota (fato):** é uma declaração, não uma verificação de identidade.

### RN-ACE-004: Organização alheia responde como inexistente

- **Enunciado:** uma requisição para uma organização da qual o usuário não é membro recebe a mesma resposta de uma organização que não existe.
- **Origem:** PDR-0009.
- **Exemplo:** um aprendiz da organização A tenta abrir `/orgs/B/plants` e recebe 404, sem saber se B existe.
- **Quando violada:** `NOT_FOUND`.

### RN-ACE-005: Contas demo isoladas e restauradas

- **Enunciado:** existe uma conta demo por papel (administrador, instrutor, aprendiz), todas numa organização demo isolada. Os dados dessa organização são restaurados todo dia.
- **Origem:** PDR-0009.
- **Exemplo:** um recrutador apaga uma planta como demo-instrutor; no dia seguinte, ela está de volta.
- **Quando violada:** é um invariante; nenhum dado da organização demo é visível fora dela.
- **Restrições:** a conta demo não importa nem exporta JSON, não troca e-mail nem senha e não exclui a organização. Tentativas recebem `FORBIDDEN`.
- **Por quê (fato):** se um visitante trocasse a senha, ninguém mais entraria até a restauração.

### RN-ACE-006: Papel mais alto herda os mais baixos

- **Enunciado:** o administrador tem todas as permissões do instrutor, e o instrutor, todas as do aprendiz. No código: `admin` > `instructor` > `learner`.
- **Origem:** PDR-0019.
- **Exemplo:** o administrador cria grupos e publica plantas sem precisar de um segundo papel.
- **Quando violada:** `FORBIDDEN` indevido; um teste por papel verifica a herança.
- **Nota:** o analista (fase 3) não entra na escada; isso pedirá um PDR novo.
