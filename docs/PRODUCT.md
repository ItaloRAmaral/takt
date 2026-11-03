# Takt

> **Resumo.** Takt é uma plataforma web com uma fábrica virtual em 3D, montada no navegador e movida por um motor de simulação de eventos discretos, para ensinar, treinar e, no futuro, analisar fábricas reais. O MVP ensina gargalo, filas e OEE. Este arquivo é a porta de entrada: dá a visão geral e aponta para os documentos de detalhe.

Atualizado em 20/10/2026 · Status: produto definido; arquitetura a definir.

Convenção usada nos documentos de produto: **fato** (verificável), **estimativa** (nossa conta, não medida) e **palpite** (aposta a validar).

## O que é

Uma **planta virtual em 3D**, editável no navegador, em que o usuário monta uma linha de produção do zero, roda a simulação e vê o efeito: a fila crescendo, a máquina quebrando, o gargalo em destaque. A planta (um documento JSON) e o motor são os mesmos em todos os usos; o que muda é a área do produto e a origem dos números.

Frase do MVP: **"Monte uma linha de produção em 3D e veja o gargalo aparecer."**

## Por que existe

1. **Portfólio** (objetivo principal): mostrar produto e engenharia de software (arquitetura, segurança, testes, documentação, uso de agentes).
2. **Base de um produto vendável**: se o resultado for bom, bonito e fácil de usar, há interesse em vender assinaturas no futuro. Por isso, acesso, planos e autorização existem desde o MVP.

## Para quem

| Público | Uso | Quem paga (futuro) |
| --- | --- | --- |
| Professor de engenharia de produção | Montar fábricas e demonstrar conceitos em aula | Instituição de ensino |
| Aluno | Montar, rodar e "quebrar" a linha | Ninguém (conta gratuita) |
| Empresa: treinamento | Capacitar operadores e lideranças | Empresa |
| Empresa: engenharia | Analisar a fábrica real antes de investir | Empresa |

Premissa assumida: professores querem a ferramenta. Não há entrevistas; a engenharia se valida pela literatura e o interesse, pela reação pública (veja [Validação](#validação)).

## Como o produto se organiza

**Núcleo único:** editor 3D + motor de simulação, iguais para todos.

**Duas áreas**, no menu lateral:

| Área | Para quê | No MVP |
| --- | --- | --- |
| **Capacitar** | Aprender e treinar com plantas fictícias; missões com meta e nota | Sim (missões "em breve") |
| **Analisar** | Decidir sobre a fábrica real com dados calibrados e cenários | "Em breve" |

**Módulos de engenharia**, dentro da planta (elementos na paleta e abas de indicadores):

Produção (MVP) → Estoque + PCP → Manutenção → Qualidade.

**Três chaves decidem o que cada um vê:**
- **Plano:** áreas, módulos e número de plantas que a organização contratou.
- **Tipo de planta:** didática (fictícia) ou real (confidencial).
- **Papel:** administrador, instrutor, aprendiz e, depois, analista, sempre dentro de uma organização.

## O MVP em uma tela

**Entra:**
- Montagem do zero em 3D, em grade com encaixe (estilo The Sims), câmera orbital e vista de cima.
- Elementos de produção: fonte, estação, esteira, buffer, expedição e refugo.
- Variabilidade (fixa, exponencial, normal truncada, triangular), falhas (MTBF e MTTR), defeitos e retrabalho.
- Regras de roteamento definidas pelo usuário: por qualidade, por percentual e fila mais curta.
- Reprodução controlável (play, pause, velocidade) e replicações com intervalo de confiança.
- Três modos de execução (turno, continuar do turno anterior, regime estável), com assistente de aquecimento e aviso de utilização do gargalo.
- Indicadores: vazão, WIP, lead time, utilização, OEE e gargalo destacado.
- Cenário guiado do gargalo e comparação de dois cenários.
- Login, organizações, papéis, planos (só o gratuito), grupos, contas demo por papel.
- Importar e exportar JSON, conforme o papel.
- Interface em português (padrão) e inglês.

**Fica de fora:** missões, acompanhamento do aluno pelo professor, Analisar, módulos além de Produção, várias fábricas, cobrança, SSO.

**História do demo (cerca de 2 minutos):** abrir a fábrica de exemplo → rodar e ver a fila crescer na estação mais lenta → mexer nela → comparar os cenários e ver o gargalo mudar de lugar → ligar falhas e ver o OEE cair.

Detalhe: [mvp-scope.md](product/mvp-scope.md).

## Princípios

- **Fácil de usar:** quem nunca viu o Takt monta uma linha de 3 estações e roda em até **5 minutos, sem ajuda**.
- **Correto antes de bonito:** o motor reproduz resultados conhecidos da literatura antes de aparecer em aula.
- **Segurança desde o início:** autorização no servidor, por organização, e isolamento no banco (RLS).
- **Base sólida:** acertar já o que é caro de migrar (esquema da planta, acesso); deixar para depois o que é barato.
- **Bilíngue:** pt-BR padrão e inglês. O que o usuário cria não é traduzido.
- **Idiomas do projeto:** documentação em português; código, `CLAUDE.md`, skills e agentes em inglês.

## Validação

- **Engenharia:** testes do motor contra casos da literatura (Hopp e Spearman, Law, M/M/1, Lei de Little).
- **Uso:** teste com uma pessoa de fora, usando o critério dos 5 minutos.
- **Interesse:** publicações no LinkedIn a cada marco; contam mensagens e pedidos de acesso.

## Marcos

Sem prazo final. Cada marco termina em algo mostrável, tem tempo-alvo e revisão, e vira um post.

| # | Entrega | Status |
| --- | --- | --- |
| 1 | Esquema da planta + motor + testes contra a literatura | Não iniciado |
| 2 | Cena 3D reproduzindo uma planta pronta | Não iniciado |
| 3 | Editor 3D, salvar local, importar e exportar JSON | Não iniciado |
| 4 | API: login, organizações, papéis, planos, RLS, contas demo | Não iniciado |
| 5 | Grupos, publicar planta, cenário guiado, "em breve" | Não iniciado |
| 6 | Comparação de cenários, polimento, vídeo do MVP | Não iniciado |

Detalhe: [milestones.md](product/milestones.md).

## Mapa da documentação

| Documento | Conteúdo | Status |
| --- | --- | --- |
| [product/vision.md](product/vision.md) | Áreas, módulos, roadmap, cópia real → Capacitar | Criado |
| [product/audiences-market.md](product/audiences-market.md) | Públicos, compradores, concorrência | Criado |
| [product/mvp-scope.md](product/mvp-scope.md) | Escopo, história do demo, critérios | Criado |
| [product/access.md](product/access.md) | Organização, papéis, planos, grupos | Criado |
| [product/plant-model.md](product/plant-model.md) | Modelo conceitual da planta | Criado |
| [product/simulation.md](product/simulation.md) | Motor, indicadores, validação | Criado |
| [product/ux-visual.md](product/ux-visual.md) | Identidade visual, UX, i18n | Criado |
| [product/milestones.md](product/milestones.md) | Marcos e estado de cada um | Criado |
| [product/risks.md](product/risks.md) | Riscos de produto | Criado |
| [product/glossary.md](product/glossary.md) | Termos pt ↔ en, com o nome usado no código | Criado |
| [product/references.md](product/references.md) | Bibliografia e o que cada obra embasa | Criado |
| [product/rules/](product/rules/README.md) | Regras de negócio com ID (`RN-...`) | Criado (39 regras) |
| product/use-cases/ | Casos de uso com ID (`UC-...`) | No início de cada marco |
| [pdr/](pdr/README.md) | Decisões de produto (PDR) e regras reservadas | Criado (21 PDRs) |
| [adr/](adr/README.md) | Decisões de arquitetura (ADR) | Em andamento (13 ADRs, 1 proposto) |
| [architecture/](architecture/README.md) | Como o sistema funciona hoje (documentos vivos) e o guia de estilo de código | Em andamento (`code-style`, `takt-core-api`) |
| [research/](research/README.md) | Pesquisas na literatura (relatórios e notas) | 4 pesquisas |
| [archive/](archive/) | Relatório inicial, fonte para os documentos acima | Arquivado |

**Convenções:** cada documento abre com um resumo de 3 a 5 linhas e a data de atualização; um tema por arquivo, até cerca de 300 linhas; uma única fonte de verdade (este arquivo resume e aponta). Os IDs de regras e casos de uso aparecem nos nomes dos testes. PDRs e ADRs aceitos não são editados: uma mudança vira um registro novo.

## Pontos em aberto

- Disponibilidade de domínio e de marca para "Takt" (INPI).
- Teste de uso com alguém de fora antes do marco 5.
- Tempo-alvo de cada marco.
- Como mostrar o código fechado no portfólio (ADRs públicos, posts técnicos).
- Revisão técnica do conteúdo didático em inglês.
- Modelo comercial (preços e o que cada plano libera), para o futuro.
- Auditoria: lista final de eventos e onde ela vive (sessão de arquitetura).
