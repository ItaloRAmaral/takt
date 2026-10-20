# PDR-0015: Sem prazo final; marcos mostráveis

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 19/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O relatório inicial previa 10 semanas com uma ordem de corte. O escopo cresceu (planos, RLS, grupos, editor 3D), e o fundador não tem data-limite nem quer cortar nada. **Estimativa:** o MVP leva de 14 a 18 semanas para uma pessoa. **Fato:** quando surgir um emprego, o tempo disponível cai.

## Decisão

1. **Sem prazo final e sem cortes.** A ordem de corte vira **ordem de construção**.
2. **Seis marcos**, cada um terminando em algo mostrável, com tempo-alvo, revisão ao fim e um post no LinkedIn:
   1. motor;
   2. 3D com reprodução;
   3. editor;
   4. API e segurança;
   5. grupos e cenário guiado;
   6. polimento.
3. O 3D vem antes do backend porque gera conteúdo visual cedo.

## Alternativas consideradas

- **Prazo fixo de 10 semanas:** irreal para o escopo atual.
- **Lançamento único no fim:** o projeto pode ficar pela metade sem nada para mostrar.
- **Backend antes do 3D:** atrasa o primeiro conteúdo visual.

## Consequências

- Se a disponibilidade mudar, o que já existe está apresentável.
- O RLS nasce na primeira migração do banco (marco 4).
- **Em aberto:** o tempo-alvo de cada marco.

## Regras derivadas

Nenhuma.

## Reflete em

- [PRODUCT.md](../PRODUCT.md), seção "Marcos".
- `product/milestones.md` (a criar).
