# Réplica O: revisor sênior da modelagem do produto

## Onde eles acertam e eu errei

- **P, demo:** o passo 4 é falso. [Fato] `mvp-scope.md` diz "a vazão sobe e o gargalo muda de lugar". Com ρ < 1, a vazão é a taxa de chegada nos dois cenários [Estimativa: conservação de fluxo]. É o achado mais grave da rodada.
- **P, gargalo:** a maior utilização erra quando há falhas. [Estimativa] Recalculei o exemplo dele: M3 tem 53,1 s efetivos e limita a linha, mas a utilização dá 0,98 para M2 contra 0,94 para M3.
- **M, chaves:** uma só chave `m1:failure` para falha e reparo quebra a RN-SIM-010. O sorteio de defeito com p = 0 precisa consumir um uniforme. Era a minha lente e eu não vi.
- **M, normal truncada:** a média real é 19,31 min [Estimativa: 15 + 15·φ(1)/Φ(1)].
- **M, turno:** o caso dos 94,1% dá 94,29% no turno [Estimativa: s·T = 34].
- **M, Q1:** meu argumento de números aleatórios comuns estava exagerado. O pareamento só enfraquece. O argumento melhor é o dele: com (b), o λ que o usuário escreveu é o λ que o motor simula.

## Onde discordo ou vejo excesso

- **O caso (1 − p)/c de P** precisa de condição. Num laço para a própria estação, um buffer de retrabalho cheio trava a máquina, que segura a peça com bloqueio após o serviço.
- **A planta sobrecarregada de P invalida a RN-SIM-011.** Com capacidades finitas e perda na fonte, a linha enche rápido [Estimativa: cerca de 65 lugares × 56 s, uns 60 min de 480]. O aviso "mal saiu do enchimento" mentiria no demo.
- **Ordem dos eventos "agora" (M):** é regra do motor, não do esquema. Entra na primeira tarefa do sub-plano 4.
- **SimPy (M):** descarto. Custa de 2 a 3 dias para reproduzir os desempates, e o oráculo de Markov cobre as exponenciais.
- **Esteira que quebra (P):** concordo em cortar, mas o item 5 é decisão do dono. Fica como recomendação.

## Posições conjuntas

- **Q1:** (b). A liberação por CONWIP fica para depois, como tipo de fonte.
- **Q2:** (a). O ciclo "espera por" exclui o reparo. Sem média só das réplicas que não travaram: o resultado mostra "k de 30 travaram".
- **Comparação de cenários:** com o IC da diferença pareada.
- **OEE:** no gargalo; faminto e bloqueado contam como perda externa.
- **Tempos:** "tempo no sistema" e lead time da linha são indicadores separados, com regra para a censura no turno.

## Custo no esquema v1 (sub-plano 3)

| Proposta | Veredito |
| --- | --- |
| `idealCycleSec` | **Agora**: sem ele, o P do OEE não tem referência. Padrão = média **real** do ciclo; ciclo 0 dá P "—" |
| Gargalo pela fração ativa | Regra agora, código no sub-plano 4; mostrar empate quando os IC se sobrepõem (Roser) |
| OEE no gargalo | Sub-plano 5, só regra |
| Planta de exemplo sobrecarregada | **Agora** (o documento validado é deste sub-plano); os números de P são [Palpite] e precisam rodar no motor |
| Sequências separadas para falha e reparo; sorteio sempre consumido | **Agora**, na RN-SIM-010: as chaves são contrato, e trocá-las depois muda todos os resultados |
| Média da truncada | **Agora**, a semântica: parâmetros de antes do corte e média real exibida. O motor já tem o Φ (Hart) |
| Ordem dos eventos | Sub-plano 4 |
| Testes exatos por cadeia de Markov | Marco 1, depois do fluxo; antes, os testes degenerados e de extremo de Sargent, mais baratos |
| SimPy | Descartar |
| Modelo conceitual de Robinson | Versão leve agora: a seção "simplificações e sentido do efeito" em `plant-model.md`, que também alimenta o "Saiba mais" |
| Meu manifesto | **Reduzo**: o ADR-0011 já prevê versão, semente e indicadores por réplica. Ficam o status de término e `lostArrivalCount` (saída, sub-plano 4). Descarto o hash canônico |
| Meu `onQueueFull` | **Descarto**: M tem razão, a alternativa é outro tipo de liberação, e acrescentar o campo depois é uma migração trivial |

## As 5 mudanças mais importantes para o sub-plano 3

1. **Demo verdadeiro:** planta de exemplo sobrecarregada com números verificados, sem laço que trave, e RN-SIM-011 revista para capacidade finita. A alternativa é reescrever o passo 4.
2. **Q1(b) e Q2(a) como regras escritas,** com detecção e status por réplica.
3. **Contrato das chaves:** `ttf` separado de `repair`; defeito e roteamento sempre sorteiam.
4. **Semântica dos parâmetros gravados:** média real da truncada e `idealCycleSec`, com regra para ciclo 0.
5. **Tabela de validação com condições:** o modo de cada caso, K = fila + 1, tolerância δ com a corrida dimensionada para ela, testes de extremo e lista de simplificações.

## Nota acadêmica

Os itens 3 e 4 e as saídas por réplica já bastam para as perguntas de pesquisa da rodada 1. Não acrescento nada só pela dissertação.
