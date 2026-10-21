# Arquitetura

> **Resumo.** Documentos vivos que descrevem **como** o Takt é construído e funciona hoje. O **porquê** de cada escolha está nos ADRs, em [`../adr/`](../adr/README.md). Quando o código muda, estes documentos mudam junto; os ADRs, não.

Atualizado em 20/10/2026.

## Convenções

- **Vivo:** atualizado no mesmo pull request que muda o comportamento descrito.
- **Um documento por app ou lib**, com até cerca de 300 linhas; se crescer, divide.
- **Aponta para os ADRs** em vez de repetir o porquê.
- **Pendências marcadas** como "em aberto", nunca decididas em silêncio.

## Visão geral

```
 Navegador
 ┌──────────────────────────────────────────────────────────────┐
 │ takt-web-app (Vite + React, estático)                        │
 │   editor e cena 3D ── @takt/sim-engine (Web Worker)          │
 │   IndexedDB (rascunhos locais)    @takt/plant-schema         │
 └───────────────┬──────────────────────────────────────────────┘
                 │ HTTPS, cookie de sessão (mesmo site)
 ┌───────────────▼──────────────────────────────────────────────┐
 │ proxy reverso: arquivos estáticos + /api → API               │
 └───────────────┬──────────────────────────────────────────────┘
 ┌───────────────▼──────────────────────────────────────────────┐
 │ takt-core-api (NestJS): identidade, organizações, papéis,    │
 │ planos, grupos, registro de plantas, auditoria               │
 │   @takt/plant-schema (validação de importações)              │
 └───────┬───────────────────────────────────┬──────────────────┘
         │ Prisma + RLS                      │ stdout (JSON) + OpenTelemetry
 ┌───────▼────────┐                  ┌───────▼───────────────────┐
 │ PostgreSQL     │                  │ logs e traces             │
 └────────────────┘                  └───────────────────────────┘
```

**A simulação roda no navegador.** A API guarda e protege plantas, mas não simula. Simulações no servidor (`takt-sim-worker`) ficam para Analisar.

## Documentos

| Documento | Conteúdo | Status |
| --- | --- | --- |
| [takt-core-api.md](takt-core-api.md) | API: estrutura, fluxo de uma requisição, erros, validação, banco, observabilidade, segurança | Criado |
| `takt-web-app.md` | Front-end, cena 3D, estado, armazenamento local | Na implementação ([ADR-0012](../adr/0012-front-end.md)) |
| `sim-engine.md` | Motor de simulação | Após o ADR do motor |
| `plant-schema.md` | Esquema, validação e migrações da planta | Após o ADR do motor |
