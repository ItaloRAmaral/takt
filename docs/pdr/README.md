# Registros de decisão de produto (PDR)

> **Resumo.** Cada PDR registra uma decisão de produto: contexto, decisão, alternativas, consequências e as regras de negócio que ela gera. Decisões técnicas ficam nos ADRs, em `docs/adr/` (a criar na sessão de arquitetura).

Atualizado em 20/10/2026.

## Como funciona

- **Um PDR por decisão**, numerado em sequência (`NNNN-titulo.md`), a partir do [modelo](template.md).
- **Status:** proposto, aceito ou substituído. Um PDR aceito **não é editado**; uma mudança vira um PDR novo, que substitui o anterior, e o antigo recebe só a nota "Substituído por PDR-NNNN".
- **Regras derivadas:** o PDR lista os IDs e a intenção. O texto exato e testável fica em [`../product/rules/`](../product/rules/), e cada regra aponta de volta para o PDR de origem.
- **Reflete em:** o PDR aponta para os documentos de produto onde a decisão aparece.

## Índice

| PDR | Decisão | Status | Data |
| --- | --- | --- | --- |
| [0001](0001-objetivos-do-produto.md) | Objetivos: portfólio primeiro, venda depois | Aceito | 19/10/2026 |
| [0002](0002-nome-takt.md) | Nome do produto: Takt | Aceito | 19/10/2026 |
| [0003](0003-compradores-e-validacao.md) | Compradores e forma de validação | Aceito | 19/10/2026 |
| [0004](0004-areas-capacitar-e-analisar.md) | Duas áreas: Capacitar e Analisar | Aceito | 19/10/2026 |
| [0005](0005-modulos-de-engenharia.md) | Módulos de engenharia e ordem | Aceito | 19/10/2026 |
| [0006](0006-escopo-do-mvp.md) | Escopo didático do MVP | Aceito | 19/10/2026 |
| [0007](0007-montagem-3d-em-grade.md) | Montagem do zero em 3D, em grade | Aceito | 19/10/2026 |
| [0008](0008-simulacao-com-reproducao.md) | Simulação com reprodução controlável | Aceito | 19/10/2026 |
| [0009](0009-acesso-no-mvp.md) | Acesso no MVP: organização + papel | Aceito | 19/10/2026 |
| [0010](0010-papel-diferente-de-plano.md) | Papel ≠ plano | Aceito | 19/10/2026 |
| [0011](0011-grupos.md) | Grupos no lugar de turmas | Aceito | 19/10/2026 |
| [0012](0012-tipo-de-planta-e-copia.md) | Tipo de planta e cópia real → Capacitar | Aceito | 19/10/2026 |
| [0013](0013-importar-exportar-json.md) | Importar e exportar JSON por papel | Aceito | 19/10/2026 |
| [0014](0014-roteamento-definido-pelo-usuario.md) | Roteamento definido pelo usuário | Aceito | 19/10/2026 |
| [0015](0015-marcos-mostraveis.md) | Sem prazo final; marcos mostráveis | Aceito | 19/10/2026 |
| [0016](0016-idiomas.md) | Internacionalização e idiomas do projeto | Aceito | 19/10/2026 |
| [0017](0017-repositorio-fechado.md) | Repositório fechado | Aceito | 19/10/2026 |
| [0018](0018-identidade-visual-e-ux.md) | Identidade visual e critério de facilidade | Aceito | 19/10/2026 |
| [0019](0019-hierarquia-de-papeis.md) | Hierarquia de papéis | Aceito | 20/10/2026 |

## Regras de negócio derivadas

IDs citados pelos PDRs; o texto exato está em [`product/rules/`](../product/rules/README.md):

| Prefixo | Domínio | IDs | Origem |
| --- | --- | --- | --- |
| `RN-ACE` | Acesso | 001–006 | PDR-0009, 0019 |
| `RN-PLA` | Planos | 001–006 | PDR-0004, 0005, 0010 |
| `RN-GRP` | Grupos | 001–004 | PDR-0011 |
| `RN-PLT` | Plantas | 001–004 | PDR-0012 |
| `RN-JSN` | JSON | 001–007 | PDR-0013 |
| `RN-SIM` | Simulação | 001–006 | PDR-0008, 0014 |
| `RN-EDT` | Editor | 001–004 | PDR-0007 |
| `RN-I18` | Idiomas | 001–004 | PDR-0016 |
