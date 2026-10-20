# Escopo do MVP

> **Resumo.** O MVP é Capacitar com o módulo Produção: montar uma fábrica do zero em 3D, rodar com reprodução controlável e ver gargalo, filas e OEE. Inclui login, organizações, papéis, plano gratuito e grupos. Fica de fora tudo o que não serve à história do demo.

Atualizado em 20/10/2026 · Decisões: [PDR-0006](../pdr/0006-escopo-do-mvp.md), [PDR-0007](../pdr/0007-montagem-3d-em-grade.md), [PDR-0008](../pdr/0008-simulacao-com-reproducao.md), [PDR-0014](../pdr/0014-roteamento-definido-pelo-usuario.md).

## Entra e fica de fora

| Área | Entra | Fica de fora |
| --- | --- | --- |
| Elementos | Fonte, estação, esteira, buffer, expedição, refugo | Operadores, transporte interno, montagem com vários componentes |
| Parâmetros | Duração com distribuição (fixa, exponencial, normal truncada, triangular), taxa de defeitos, MTBF e MTTR, capacidade do buffer, chegadas | Setup, turnos, calendários, custos |
| Roteamento | Por qualidade, por percentual, fila mais curta; limite de retrabalho | Prioridade, por produto, por condição |
| Editor | Grade 3D com encaixe, rotação de 90°, paleta, conectar, propriedades, desfazer | Posicionamento livre, distâncias e colisões, importação de CAD |
| Estrutura | Uma fábrica com uma ou poucas linhas (zonas) | Várias fábricas, redes |
| Simulação | Reprodução controlável (play, pause, 1x a 100x); replicações com intervalo de confiança; semente fixa; **três modos** (turno, continuar do turno anterior, regime estável); **assistente de aquecimento (MSER-5)**; aviso de utilização do gargalo; números aleatórios comuns entre cenários | Interação em tempo real, otimização automática |
| Indicadores | Vazão, WIP, lead time, utilização, OEE, gargalo destacado | CEP, Pareto de paradas, custos |
| Didática | Cenário guiado do gargalo; dica e painel "Saiba mais" em todo termo e indicador; explicação do resultado em degraus com previsão; sugestões de planejamento de experimentos; ajuda desligável | Biblioteca de aulas, trilhas, provas, missões; retirada automática da ajuda conforme o domínio |
| Cenários | Comparar dois cenários lado a lado | Ramificação e versionamento |
| Acesso | Login (e-mail e senha), organizações, papéis, plano gratuito, grupos, contas demo, 18+ | SSO, cobrança, analista, convite por e-mail |
| Dados | Importar e exportar JSON por papel | Dados reais, CSV |
| Interface | Português e inglês; Missões e Analisar como "em breve" | Outros idiomas |
| Acompanhamento | Nenhum (o aluno entrega o JSON) | Painel do professor |

Regras exatas: [rules/](rules/README.md).

## História do demo (cerca de 2 minutos)

1. Abrir a fábrica de exemplo, com cinco estações.
2. Rodar e ver a fila crescer na estação mais lenta, destacada.
3. Reduzir o tempo dessa estação ou balancear a linha.
4. Comparar os dois cenários: a vazão sobe e o gargalo muda de lugar.
5. Ligar falhas (MTBF e MTTR) e ver o OEE cair.

## Critérios de pronto

- O motor passa em todos os casos de validação ([simulation.md](simulation.md)).
- Quem nunca viu o Takt monta uma linha de 3 estações e roda em até **5 minutos, sem ajuda** ([ux-visual.md](ux-visual.md)).
- Cada rota da API é testada com cada papel, e o isolamento entre organizações é testado.
- A interface está completa nos dois idiomas.
- A história do demo roda de ponta a ponta numa conta demo.
