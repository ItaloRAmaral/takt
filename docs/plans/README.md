# Planos

> **Resumo.** Planos de implementação: o que vai ser construído, em quais arquivos, com quais testes, quais ameaças são tratadas e quais princípios de estilo são quebrados e por quê. Toda mudança de código ou configuração começa por um plano aprovado: curto, na conversa, para mudanças pequenas e locais; completo, nesta pasta, para o resto. Só texto de documentação, comentários e formatação dispensam plano. Os planos são escritos com a skill `planning-code-changes` (`.claude/skills/planning-code-changes/`).

Atualizado em 04/11/2026.

## Como funciona

- **Para pedir um plano:** envie o pedido **e** os documentos que o definem (caso de uso, regras, seção de `docs/product/`, ADR). Sem eles, o Claude procura os candidatos e pergunta antes de planejar.
- **Testes:** todo plano planeja os testes tanto quanto o código (seção "Plano de testes": nível, nome, dados e metas do ADR-0009).
- **Nome do arquivo:** `AAAA-MM-DD-<nome>.md`. Um pedido grande gera primeiro um **roteiro**, que divide o trabalho em sub-planos; cada sub-plano vira um plano próprio.
- **Status:** **Proposto** (rascunho, editável) → **Aprovado** (pelo fundador; só então o código começa) → **Concluído** (marcado na última tarefa do próprio plano, no mesmo pull request que entrega o código; passa a valer quando ele é mesclado).
- **Guia:** todo plano segue o [guia de estilo](../architecture/code-style.md). Desvio de um princípio de estilo é registrado no plano com as cinco informações da seção 3 do guia. `CLAUDE.md`, ADRs e PDRs aceitos e regras `RN-...` nunca são quebrados por um plano.
- **Revisão:** a autorrevisão roda sempre. O agente `plan-reviewer` (o que falta, inclusive segurança e testes, e como será construído) roda nos planos importantes, com olhar de quem não viu a conversa: roteiros, domínio e regras, segurança, banco e determinismo do motor.

## Planos

| Plano | Status | Data |
| --- | --- | --- |
| [Workspace Nx do marco 1](2026-11-03-workspace-nx.md) | Concluído (PR #1, 04/11/2026) | 03/11/2026 |
| [Roteiro: esquema da planta e motor (marco 1)](2026-11-04-roteiro-motor.md) | Aprovado | 04/11/2026 |

## Medição do revisor

O revisor fica só se achar o que a autorrevisão não acha. Depois de cinco planos revisados, a tabela é resumida para o fundador, que decide se ele continua.

| Plano | Data | Critério | Autorrevisão | Só o revisor (erros / sugestões) | Rejeitados |
| --- | --- | --- | --- | --- | --- |
| [Workspace Nx do marco 1](2026-11-03-workspace-nx.md) | 03/11/2026 | 3 (segurança: segredos, dependências, token do CI) | 4 | 6 / 17 | 1 |
| [Roteiro: esquema da planta e motor](2026-11-04-roteiro-motor.md) | 04/11/2026 | 1 e 5 (roteiro; determinismo do motor) | 5 | 9 / 11 | 0 |
