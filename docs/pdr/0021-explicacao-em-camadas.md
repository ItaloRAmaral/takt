# PDR-0021: Explicação em camadas e ajuda sob demanda

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |

## Contexto

O Takt precisa ser fácil de usar e **ensinar o que mostra**. A proposta inicial tinha três camadas: dica curta, painel "Saiba mais" e explicação de cada resultado. A [pesquisa sobre explicação em camadas](../research/explicacao-em-camadas-na-interface.md) confirmou o desenho, com ajustes:
- **fato:** ajuda que o usuário pede funciona melhor que tours obrigatórios, e dois níveis de revelação é o máximo recomendado (Nielsen Norman Group);
- **fato:** simulação com orientação ensina mais que sem orientação (Alfieri et al., 2011; Lazonder e Harmsen, 2016);
- **fato:** explicar o resultado já com "faça X" aumenta a aceitação cega e tira do aluno o diagnóstico (Bansal et al., 2021; Buçinca et al., 2021; Sinha e Kapur, 2021);
- **fato:** deixar o aluno escolher "iniciante ou avançado" tem efeito quase nulo (Karich et al., 2014);
- **fato:** conteúdo interativo dentro de uma dica viola o padrão de acessibilidade (WCAG 2.2, 1.4.13; WAI-ARIA).

## Decisão

1. **Quatro tipos de explicação:**

| Tipo | O que é | Quando aparece |
| --- | --- | --- |
| **Dica** | Uma frase em linguagem simples sobre um termo, indicador ou campo | Ao passar o mouse, focar com o teclado ou tocar |
| **Painel "Saiba mais"** | Explicação completa, ao lado da tela, sem bloqueá-la: na sua fábrica → números → fórmula com os valores da planta aberta → regra geral | Ao acionar o ícone próprio de "Saiba mais" |
| **Explicação do resultado, em degraus** | 1) meta do cenário; 2) dica de processo ("olhe as filas"); 3) diagnóstico ("o gargalo é M3"), depois de o usuário **prever** ou pedir; 4) sugestão como **hipótese para testar** ("teste reduzir o tempo de M3"), nunca como ordem | Sob demanda, a cada degrau |
| **Planejamento de experimentos** | Sugestões opcionais: mudar uma variável por vez, comparar com o cenário base | Sob demanda |

2. **Ajuda sob demanda por padrão.** O usuário pede; o sistema não sai explicando. Sem modo "iniciante × avançado".
3. **O usuário pode desligar as dicas e as ajudas, e religar quando quiser.** A preferência fica salva no perfil.
4. **Informação correta sobre o número não é ajuda e não se desliga:** modo da execução, aviso de utilização do gargalo, incerteza (intervalo de confiança) e empate dentro da variação ([PDR-0020](0020-modos-de-simulacao-e-aquecimento.md)).
5. **Alertas de estado da fábrica também não são ajuda e não se desligam:** gargalo, fila crescendo, buffer cheio, estação bloqueada ou sem material e máquina parada por falha ficam visíveis na cena 3D e no painel de resultados, com cor **e** ícone.
6. **Fontes bibliográficas só nos documentos**, nunca na interface.
7. **Explicações geradas por modelos de texto fixos**, a partir das mesmas definições de indicador que o motor usa. Sem IA generativa.

## Alternativas consideradas

- **Explicação do resultado sempre visível e prescritiva:** descartada pela evidência de aceitação cega e perda do diagnóstico.
- **Modo iniciante × avançado escolhido pelo usuário:** efeito quase nulo na literatura; descartado.
- **Retirada automática da ajuda conforme o domínio do aluno:** funciona melhor (Salden et al., 2010), mas exige registrar o domínio por conceito; fica para as missões.
- **Tour de apresentação obrigatório:** usuários pulam e não melhora o desempenho.
- **Texto gerado por IA:** poderia contradizer o motor.

## Consequências

- O conteúdo didático (dicas, painéis, degraus) vira um ativo grande a escrever e revisar, nos dois idiomas ([PDR-0016](0016-idiomas.md)).
- O "prever antes de ver" acrescenta um passo na interface de resultados.
- **Lacuna da literatura:** nenhum estudo comparou exemplos com os dados do próprio aluno contra exemplos genéricos. É uma aposta bem fundamentada, não um fato.
- **Em aberto:** convite discreto de ajuda quando houver sinal de dificuldade (alunos usam mal a ajuda sob demanda; Aleven et al., 2003).

## Regras derivadas

- `RN-HLP-001`: todo termo técnico, indicador e campo tem dica e painel "Saiba mais".
- `RN-HLP-002`: a dica segue a WCAG 2.2 (1.4.13) e não tem conteúdo interativo; "Saiba mais" é um controle próprio.
- `RN-HLP-003`: unidade, faixa válida e obrigatoriedade de um campo ficam sempre visíveis.
- `RN-HLP-004`: ajuda sob demanda; o usuário desliga e religa dicas e ajudas.
- `RN-HLP-005`: o painel não bloqueia a tela e segue a ordem do concreto ao abstrato.
- `RN-HLP-006`: a explicação do resultado é revelada em degraus, e a sugestão é uma hipótese.
- `RN-HLP-007`: explicações geradas a partir das definições de indicador do motor, sem IA generativa.
- `RN-HLP-008`: informação correta sobre o número nunca se desliga.
- `RN-HLP-009`: sugestões de planejamento de experimentos sob demanda.
- `RN-HLP-010`: alertas de estado da fábrica sempre visíveis, na cena e nos resultados.

## Reflete em

- [product/ux-visual.md](../product/ux-visual.md), [product/mvp-scope.md](../product/mvp-scope.md).
- [Pesquisa sobre explicação em camadas](../research/explicacao-em-camadas-na-interface.md).
