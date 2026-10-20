# PDR-0013: Importar e exportar JSON por papel

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O JSON da planta permite levar plantas entre pessoas e organizações e é o modo de o aluno entregar trabalho. Ao mesmo tempo, um arquivo exportado sai do sistema sem controle.

## Decisão

1. **Planta real:** só o **administrador** importa e exporta.
2. **Planta didática:**
   - o **instrutor** exporta;
   - o **aprendiz** importa e exporta **apenas as cópias que ele mesmo criou**.
3. **Todo arquivo importado é validado** (formato, tamanho e versão) e migrado se for de versão antiga.
4. O JSON é **portátil**: não carrega organização, dono nem tipo.

## Alternativas consideradas

- **Aprendiz sem exportação:** quebraria a entrega de trabalho ([PDR-0011](0011-grupos.md)).

## Consequências

- **Fato:** restringir a exportação não é segurança. O que aparece no navegador pode ser extraído. A proteção real da planta real é quem consegue abri-la (papel + RLS); a restrição de exportação é política e auditoria.

## Regras derivadas

- `RN-JSN-001`: só o administrador importa ou exporta uma planta real.
- `RN-JSN-002`: o instrutor exporta plantas didáticas.
- `RN-JSN-003`: o aprendiz exporta apenas as cópias que criou.
- `RN-JSN-004`: o aprendiz pode importar plantas didáticas.
- `RN-JSN-005`: todo arquivo importado é validado e, se antigo, migrado; um arquivo inválido é recusado com o motivo.
- `RN-JSN-006`: a importação cria planta didática, exceto quando o administrador importa como real.
- `RN-JSN-007`: exportar uma planta real fica registrado em auditoria.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "O MVP em uma tela".
- `product/access.md` (a criar).
