# Regras de negócio

> **Resumo.** Regras exatas e testáveis do Takt, com ID estável (`RN-<DOMÍNIO>-NNN`). Cada regra nasce de um PDR e aparece no nome dos testes que a verificam. Os casos de uso citam as regras; não as reescrevem.

Atualizado em 20/10/2026.

## Formato

```markdown
### RN-XXX-000: Título curto

- **Enunciado:** a regra, exata e testável.
- **Origem:** PDR que a gerou.
- **Exemplo:** um caso concreto.
- **Quando violada:** o que o sistema faz e o código de erro.
- **Em aberto:** (opcional) detalhe ainda não decidido.
```

## Convenções

- **ID estável.** Um ID nunca é reutilizado. Uma regra removida fica marcada como *revogada*, com o motivo.
- **Rastreabilidade.** PDR → regra → caso de uso → teste. O nome do teste começa pelo ID: `RN-JSN-003: learner cannot export another user's plant`.
- **Uma regra muda, o PDR não.** Uma mudança de intenção pede um PDR novo; um ajuste de detalhe atualiza só a regra e a data do arquivo.

## Códigos de erro

A API devolve códigos, nunca frases ([RN-I18-004](i18n.md)). Os nomes ficam em inglês porque são código.

| Código | Quando | HTTP |
| --- | --- | --- |
| `NOT_FOUND` | O recurso não existe **ou** o usuário não tem associação com a organização | 404 |
| `FORBIDDEN` | O papel não permite a ação | 403 |
| `PLAN_LIMIT` | A ação ultrapassaria um limite do plano | 403 |
| `PLAN_FEATURE_UNAVAILABLE` | A área ou o módulo não está no plano | 403 |
| `AGE_REQUIREMENT_NOT_MET` | Cadastro sem a declaração de maioridade | 422 |
| `CONFIRMATION_REQUIRED` | Ação sensível enviada sem confirmação explícita | 422 |
| `INVALID_PLANT_FILE` | JSON importado fora do formato; acompanha a lista de erros | 422 |
| `UNSUPPORTED_SCHEMA_VERSION` | JSON de uma versão mais nova que a do sistema | 422 |
| `FILE_TOO_LARGE` | Arquivo importado acima do limite | 413 |
| `INVALID_PLANT` | A planta não pode rodar; acompanha os erros por elemento | 422 |
| `VALIDATION_ERROR` | Corpo, parâmetros ou *query* fora do formato; acompanha a lista `{ path, code }` | 422 |
| `INVALID_GROUP_CODE` | Código de grupo inexistente ou desativado | 404 |

## Índice

| Arquivo | Domínio | Regras |
| --- | --- | --- |
| [access.md](access.md) | Acesso | `RN-ACE-001` a `006` |
| [plans.md](plans.md) | Planos | `RN-PLA-001` a `006` |
| [groups.md](groups.md) | Grupos | `RN-GRP-001` a `004` |
| [plants.md](plants.md) | Plantas | `RN-PLT-001` a `004` |
| [json.md](json.md) | Importar e exportar JSON | `RN-JSN-001` a `007` |
| [simulation.md](simulation.md) | Simulação | `RN-SIM-001` a `006` |
| [editor.md](editor.md) | Editor 3D | `RN-EDT-001` a `004` |
| [i18n.md](i18n.md) | Idiomas | `RN-I18-001` a `004` |
