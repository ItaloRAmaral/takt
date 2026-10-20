# Marcos

> **Resumo.** Sem prazo final e sem cortes: o MVP é construído em seis marcos, e cada um termina em algo mostrável, com revisão e um post no LinkedIn. Os casos de uso de cada marco são escritos no início dele, antes do código.

Atualizado em 20/10/2026 · Decisões: [PDR-0015](../pdr/0015-marcos-mostraveis.md).

## Como cada marco funciona

1. **Início:** escrever os casos de uso do marco e ajustar as regras que ele toca.
2. **Construção:** com testes em todas as etapas.
3. **Fim:** revisão (o que saiu, o que mudou, recalibrar o próximo tempo-alvo) e um post.

## Sequência

| # | Entrega | Mostrável | Status |
| --- | --- | --- | --- |
| 1 | Esquema da planta + motor + testes contra a literatura | Post técnico: "o motor reproduz Factory Physics e M/M/1" | Não iniciado |
| 2 | Cena 3D reproduzindo uma planta pronta (play, pause, velocidade) | Vídeo: a fábrica viva e o gargalo destacado | Não iniciado |
| 3 | Editor 3D em grade, salvar local, importar e exportar JSON | Vídeo: montar uma linha do zero | Não iniciado |
| 4 | API: login, organizações, papéis, planos, RLS, contas demo | Post de arquitetura e segurança, com os ADRs | Não iniciado |
| 5 | Grupos, publicar planta, cenário guiado, "em breve" | Produto usável de ponta a ponta | Não iniciado |
| 6 | Comparação de cenários, polimento visual, vídeo do MVP | Lançamento do MVP | Não iniciado |

**Por que o 3D vem antes do backend:** gera conteúdo visual cedo. O RLS nasce na primeira migração do banco, no marco 4; até lá, nada sai do navegador.

**Estimativa:** de 14 a 18 semanas para uma pessoa, de 2 a 3 semanas por marco. Não medido.

**Em aberto:** o tempo-alvo de cada marco; o teste de uso com alguém de fora, antes do marco 5.
