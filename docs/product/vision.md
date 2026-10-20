# Visão do produto

> **Resumo.** O Takt é um núcleo único (editor 3D + motor de simulação) com duas áreas por cima, Capacitar e Analisar, e módulos de engenharia que ampliam o que a fábrica simula. O MVP prova Capacitar com o módulo Produção. Analisar, com dados reais, vem depois.

Atualizado em 20/10/2026 · Decisões: [PDR-0004](../pdr/0004-areas-capacitar-e-analisar.md), [PDR-0005](../pdr/0005-modulos-de-engenharia.md), [PDR-0008](../pdr/0008-simulacao-com-reproducao.md), [PDR-0012](../pdr/0012-tipo-de-planta-e-copia.md).

## Tese

A planta (documento JSON) e o motor são os mesmos em todos os usos. Muda a origem dos números (fictícios ou reais) e a camada de uso por cima. A ordem de construção segue a ordem de risco: ensinar aceita modelos fictícios; analisar uma fábrica real exige calibração e credibilidade técnica.

## Dois eixos

**Áreas: como se usa** (menu lateral).

| Área | Para quê | Quem usa | Recursos próprios |
| --- | --- | --- | --- |
| **Capacitar** | Aprender e treinar | Professor, aluno, funcionário, liderança | Grupos, cenários guiados, missões (fase 2) |
| **Analisar** | Decidir sobre a fábrica real | Engenharia (analista) | Dados reais, calibração, cenários, relatórios |

**Módulos de engenharia: o que se simula** (dentro da planta, como elementos na paleta e abas de indicadores).

| Ordem | Módulo | Acrescenta |
| --- | --- | --- |
| MVP | Produção | Fonte, estação, esteira, buffer, expedição, refugo; falhas, defeitos, retrabalho |
| 2 | Estoque + PCP | Almoxarifado, políticas de reposição, demanda, ordens, produtos e roteiros, sequenciamento |
| 3 | Manutenção | Preventiva, equipe limitada, peças de reposição, custo de parada |
| 4 | Qualidade | Inspeção, cartas de controle (CEP) |

O plano libera áreas e módulos separadamente ([rules/plans.md](rules/plans.md)).

## Modos de interação

| Modo | O que o usuário vê | Serve a |
| --- | --- | --- |
| A. Execução e resultado | Muitas replicações, comparação de números | Analisar |
| B. Reprodução controlável | A fábrica "viva": play, pause, velocidade | Capacitar (MVP) |
| C. Interação em tempo real | Mudar parâmetros durante a execução | Missões |

O motor "avança até o instante t", o que permite C sem reescrevê-lo.

## Ponte entre as áreas

- **Testar alternativas na fábrica real** ("e se comprarmos outra máquina?") é **Analisar**, com cenários sobre a planta real.
- **Ensinar a equipe com a própria fábrica** é uma **cópia** da planta real para Capacitar: vira didática, de mão única, com aviso e auditoria ([rules/plants.md](rules/plants.md)).

**Palpite:** "treine na sua própria fábrica" é o argumento de venda mais forte para empresas.

## Fábricas, linhas e redes

- **Uma fábrica é um modelo.** As linhas são **zonas** dentro dele; as abas da interface mostram cada zona.
- **Linhas isoladas** são zonas sem conexão entre si. **Linhas que trocam material** se ligam por conexões com tipo de transporte:

| Tipo de conexão | Exemplo | Quando entra |
| --- | --- | --- |
| Direta / esteira | Dentro da linha | MVP |
| Transporte interno | Carrinho, empilhadeira, AGV | Módulo futuro de logística interna |
| Transporte externo | Caminhão entre cidades | Analisar, nível de rede |

- **Várias fábricas** (rede) ficam para Analisar. **Palpite:** no nível de rede, cada fábrica vira um bloco resumido (capacidade, prazo), e só a fábrica analisada roda em detalhe.

## Roadmap

1. **MVP:** Capacitar + Produção ([mvp-scope.md](mvp-scope.md)).
2. **Treinar melhor:** missões com meta e nota, acompanhamento por grupo, convite por e-mail, cobrança.
3. **Novos módulos:** Estoque + PCP, Manutenção, Qualidade.
4. **Analisar:** plantas reais, importação de dados (começando por CSV), calibração e validação, papel de analista, SSO.
5. **Escala:** layout físico com distâncias, transporte interno, redes de fábricas, integração com sensores.

**Tractian e Dynamox** partem do dado real, coletado por sensores. O Takt parte do modelo. No longo prazo podem ser complementares, mas não há parceria nem integração verificada.

## Posicionamento

- **MVP:** "Monte uma linha de produção em 3D e veja o gargalo aparecer."
- **Visão:** aparece como "em breve", sem prometer o que o modelo ainda não prova.
