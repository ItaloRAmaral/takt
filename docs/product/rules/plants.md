# Regras de plantas

> **Resumo.** Toda planta é didática (fictícia) ou real (confidencial). A planta real nunca chega a um grupo; ela só pode virar material de treino por meio de uma cópia didática, feita por quem tem permissão e registrada em auditoria.

Atualizado em 19/10/2026 · Origem: [PDR-0012](../../pdr/0012-tipo-de-planta-e-copia.md).

### RN-PLT-001: Tipo de planta

- **Enunciado:** toda planta tem tipo **didática** ou **real**, definido na criação e guardado no registro do servidor (não no JSON). O tipo não muda; para mudar, cria-se uma cópia.
- **Origem:** PDR-0012.
- **Exemplo:** uma planta montada em Capacitar é didática.
- **Quando violada:** é um invariante.

### RN-PLT-002: Planta real não vai para grupo

- **Enunciado:** uma planta real nunca é publicada em grupo nem usada em missão.
- **Origem:** PDR-0012.
- **Exemplo:** o botão "publicar" não aparece numa planta real, e a API recusa.
- **Quando violada:** `FORBIDDEN`.

### RN-PLT-003: Cópia de planta real para Capacitar

- **Enunciado:** só o administrador ou o analista copia uma planta real para Capacitar. A cópia é uma planta **didática** nova, sem vínculo com os dados reais nem com a calibração. A operação fica registrada em auditoria (quem, quando, planta de origem).
- **Origem:** PDR-0012.
- **Exemplo:** o administrador copia a "Linha 2"; a cópia pode ser publicada para o grupo de operadores.
- **Quando violada:** `FORBIDDEN`. A cópia também respeita o limite de plantas ([RN-PLA-003](plans.md)).

### RN-PLT-004: Confirmação antes de copiar

- **Enunciado:** antes da cópia, o sistema avisa que ela ficará visível para os grupos de treinamento da organização, e só copia com confirmação explícita.
- **Origem:** PDR-0012.
- **Exemplo:** "Esta cópia ficará visível para os grupos de treinamento. Continuar?"
- **Quando violada:** `CONFIRMATION_REQUIRED`.
