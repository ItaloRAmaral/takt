# Fábrica Virtual 3D: Relatório de Produto e MVP

Oct 19, 2026 · @Italo

## Resumo executivo

A recomendação é construir em 10 semanas um MVP web de **ensino**, com login e perfis de acesso, em que o professor monta uma linha de produção em 3D, roda a simulação e vê o gargalo aparecer. Esse demo serve ao mesmo tempo como teste de interesse do mercado e como portfólio.

A tese do produto é um núcleo único (planta virtual + motor de simulação de eventos discretos) com três modos de uso, em ordem crescente de dificuldade: **ensinar**, **treinar** e **analisar/planejar a planta real**. O MVP prova só o primeiro.

Três decisões destravam o início do trabalho:

1. **Primeiro modo de uso: ensino**, com um único conceito bem feito (gargalo, produtividade, OEE, WIP).
2. **Simulação por execuções**, com animação 3D acelerada da rodada e um painel de resultados. O modo "jogo em tempo real contínuo" fica para depois. *Premissa minha; confirme ou troque.*
3. **Backend e login desde o início.** A API (NestJS) cuida de contas, organizações, papéis e turmas; a edição da planta fica no IndexedDB do navegador, com exportação e importação em JSON. Isso soma cerca de 2 semanas ao plano, que passa a ter 10.

## Visão de produto

O produto é uma **planta virtual em 3D, editável no navegador e movida por um motor de simulação**, usada para ensinar, treinar e analisar. A planta (um arquivo JSON) e o motor são os mesmos nos três usos; mudam a origem dos números e a camada de uso por cima.

| Modo | Quem usa | O que o usuário faz | Origem dos dados | Fase |
| --- | --- | --- | --- | --- |
| Ensinar | Professores e alunos | Monta a linha, muda parâmetros e observa o efeito de gargalo, qualidade e manutenção | Fictícios, escolhidos pelo professor | MVP |
| Treinar | Operadores, lideranças, times de melhoria contínua | Cumpre missões com meta e pontuação (por exemplo, reduzir o setup) | Fictícios ou parecidos com a planta da empresa | 2 |
| Analisar e planejar | Engenharia e operações | Calibra a planta com dados reais, cria cenários e compara alternativas antes de investir | Reais (começando por CSV), calibrados e validados | 3 |

A ordem é também a ordem de risco: o ensino aceita modelos fictícios e não exige integração; a análise de planta real exige calibração e credibilidade técnica.

Tractian e Dynamox partem do dado real, coletado por sensores físicos. Este produto parte do modelo. No longo prazo podem ser complementares (dados coletados por elas poderiam calibrar a planta virtual), mas não há parceria nem integração verificada, e isso não entra no MVP.

A frase de posicionamento do MVP é: **"Monte uma linha de produção em 3D e veja o gargalo aparecer."** A visão maior (gêmeo digital, dados reais) entra como roadmap, para quem já se interessou pelo demo.

## Públicos e problemas

O primeiro público é o professor de engenharia de produção; empresas e o próprio fundador (portfólio) vêm em seguida. As dores abaixo vêm do seu contexto de mestrado e da literatura de ensino de manufatura, e ainda **não foram validadas com entrevistas** (seção de validação).

| Público | Dor | O que o MVP entrega | Hipótese de receita |
| --- | --- | --- | --- |
| Professor de engenharia de produção (universidade, curso técnico) | Ensinar prática só com slides e exercícios de papel; laboratório físico é caro; software profissional é caro e desktop | Uma fábrica que ele monta e altera sozinho, sem instalar nada, para demonstrar um conceito em aula | Gratuito ou barato no início; assinatura institucional depois |
| Aluno | Difícil enxergar o efeito de variabilidade, filas e falhas | Rodar e "quebrar" a linha à vontade | Sem receita direta; gera adoção |
| Empresa, treinamento | Treinar operadores e lideranças em Lean e Six Sigma sem parar a produção | Fase 2: missões, metas e pontuação | Licença por usuário ou turma |
| Empresa, análise de planta | Testar mudança de layout ou capacidade antes de gastar | Fase 3: cenários e dados reais | Assinatura por planta ou por usuário |
| Você, como fundador | Mostrar capacidade a empresas enquanto procura emprego | Um demo polido, público e fácil de compartilhar | Portfólio e conversas |

Para o professor, o critério de adoção é simples: abrir o link, montar uma linha em minutos e usar na aula seguinte.

## Mercado e concorrência

Os simuladores industriais maduros são pesados e de preço sob consulta; o espaço livre parece ser um produto **web, feito para ensinar e com preço aberto**. Levantamento de 19/10/2026, em fontes públicas; preços não foram confirmados com os fornecedores.

| Ferramenta | O que é | Preço | Observação |
| --- | --- | --- | --- |
| [FlexSim](https://dsi-mfg.com/software/flexsim) | Simulação 3D de eventos discretos para fábricas, armazéns e logística | Sob consulta ([G2](https://www.g2.com/compare/flexsim-vs-simio)) | Autodesk anunciou a compra em 2023 ([Autodesk](https://adsknews.autodesk.com/en/news/autodesk-acquires-factory-simulation-flexsim/)); roda em Windows. Referência em layout e gargalos |
| [Simio](https://www.g2.com/products/simio/pricing) | Simulação de processos industriais | Sem preço público | Concorrente no uso corporativo |
| [Arena](https://www.capterra.co.uk/compare/107009/144460/flexsim/vs/arena) | Simulação de eventos discretos usada em manufatura, saúde, governo e também em universidades | Sem preço público ([G2](https://www.g2.com/products/arena-simulation/pricing)) | Presença acadêmica já estabelecida |
| [Plant Simulation X Essentials](https://www.siemens.com/en-us/products/tecnomatix/offerings/plant-simulation-x-essentials/) (Siemens) | Software como serviço para modelos 3D de produção, no nível de entrada limitado a 500 objetos | Assinatura; valor não confirmado aqui | Integra com OPC UA e MQTT, já pensado para dados de chão de fábrica |
| [AnyLogic](https://checkthat.ai/brands/anylogic/pricing) | Simulação multimétodo (eventos discretos, agentes, dinâmica de sistemas) | Edição de aprendizado gratuita, com limites e uso não comercial; licença profissional e nuvem sob consulta | Roda modelos no navegador pela [AnyLogic Cloud](https://www.wikipedia.com/wiki/AnyLogic), com execução no servidor. Avaliações citam curva de aprendizado alta |
| [realvirtual WEB](https://realvirtual.io/en/buy/) | Gêmeo digital 3D no navegador, open source (AGPL), voltado a comissionamento virtual e interfaces de automação | Gratuito; licenças comerciais à parte | Prova que 3D industrial na web é viável; o foco é automação (PLC), não ensino de operações |

**Precedente acadêmico.** O formato não é novo na pesquisa: o [Virtual Factory Teaching System](https://manuscript.isc.ac/Inventory/10/7792.htm) (Dessouky et al., IIE Transactions, 2001) é um simulador web de fábrica para ensino, desenvolvido separando o modelo de simulação da interface gráfica, a mesma decisão de arquitetura recomendada aqui. Há também um [simulador web de fábrica virtual](https://www.informs-sim.org/wsc04papers/282.pdf) apresentado na Winter Simulation Conference de 2004. Vale ler os dois antes de desenhar o produto, para aproveitar o que já foi aprendido.

**Tractian e Dynamox.** Ambas vendem sensores físicos mais software de manutenção preditiva: a [Dynamox](https://www.capterra.com/p/10048586/Dynamox-Platform/) combina sensores sem fio de vibração e temperatura com análise por IA, e a [Tractian](https://neuronfeed.com/startups/tractian), fundada em 2019 em São Paulo, cobra assinatura por ativo por mês com hardware e software juntos. Elas competem por dado real; este produto compete por modelo e por ensino.

**Onde está o espaço livre (hipóteses a validar):**

- Web, sem instalação, rodando no computador de um laboratório de universidade.
- O professor **não modela**: arrasta elementos prontos de produção, em vez de programar um modelo, o que é a barreira de ferramentas como AnyLogic.
- Feito para ensinar: cada indicador explicado e cenários guiados, enquanto as ferramentas acima são feitas para especialistas em simulação.
- Preço aberto e acessível a um professor individual, e conteúdo em português alinhado ao currículo (OEE, TPM, CEP).
- Caminho posterior para calibrar a planta com dados reais.

## Escopo do MVP

O MVP é uma linha de produção pequena, editável em 3D, que roda e mostra onde está o gargalo; todo o resto fica de fora até o demo existir.

| Área | Entra no MVP | Fica de fora |
| --- | --- | --- |
| Elementos | Fonte de matéria-prima, estação (máquina), esteira, estoque (buffer), expedição | Operadores, transportadores complexos, veículos autônomos, montagem com vários componentes |
| Parâmetros | Tempo de ciclo, taxa de defeitos, MTBF e MTTR, capacidade do buffer, taxa de chegada | Setup, turnos, calendários, custos |
| Editor | Grid com encaixe, paleta, arrastar e conectar, painel de propriedades, desfazer e refazer | Layout físico com distâncias e colisões, importação de CAD |
| Simulação | Uma rodada animada e várias replicações em segundo plano, com média e intervalo de confiança, e semente fixa | Otimização automática, jogo em tempo real contínuo |
| Indicadores | Vazão, WIP, lead time, utilização por estação, OEE, gargalo destacado | Cartas de controle (CEP), Pareto de paradas, custos |
| Conteúdo didático | Um cenário guiado sobre gargalo, com cada indicador explicado | Biblioteca de aulas, trilhas, provas |
| Cenários | Duplicar a planta e comparar dois cenários lado a lado | Ramificação e versionamento completos |
| Contas e dados | Login e papéis (instrutor, aprendiz, administrador da organização), turmas com código de convite e planta publicada na turma; edição local no IndexedDB, com exportar e importar JSON | Cobrança, SSO, dados reais, papel de analista |

**A história única do demo (cerca de 2 minutos):**

1. Abrir uma linha de exemplo com cinco estações.
2. Rodar e ver a fila crescer na estação mais lenta, destacada em vermelho.
3. Reduzir o tempo de ciclo dessa estação ou balancear a linha.
4. Rodar de novo e comparar os dois cenários: a vazão sobe e o gargalo muda de lugar.
5. Ligar falhas (MTBF e MTTR) e ver o OEE cair.

Se o professor conseguir montar a linha, ver o gargalo e mexer num parâmetro para ver o efeito, a ideia está validada para esta fase.

## Acesso e perfis

O acesso se modela com **organização + papel**, e não com "tipo de usuário": a empresa é um tipo de organização, e os funcionários são membros dela. Isso resolve a dúvida de como dividir o perfil empresarial.

- **Usuário:** uma pessoa com uma conta (e-mail e senha no MVP).
- **Organização:** uma universidade ou escola, uma empresa, ou um professor individual sem instituição.
- **Associação:** liga um usuário a uma organização com um papel. Uma pessoa pode ter várias associações (professor em duas universidades; aluno que também é funcionário).

| Papel | Quem é | Pode | Fase |
| --- | --- | --- | --- |
| Administrador da organização | Responsável na universidade ou na empresa | Convidar e remover membros, atribuir papéis, ver o uso da organização | MVP |
| Instrutor | Professor; na empresa, instrutor ou líder de treinamento | Criar turmas, montar plantas, publicar plantas e cenários para a turma, ver resultados | MVP |
| Aprendiz | Estudante; na empresa, funcionário em treinamento | Abrir plantas publicadas, rodar simulações, salvar cópias próprias | MVP |
| Analista | Engenharia e operações da empresa | Criar cenários sobre a planta da empresa, importar dados reais, comparar alternativas | 3 |

Nos seus termos: **professor** = instrutor em organização do tipo escola; **estudante** = aprendiz; **empresarial** = organização do tipo empresa, com administrador, instrutores, aprendizes (os funcionários) e, mais tarde, analistas.

**Regras de projeto:**

- A autorização é decidida **no servidor**, por organização; o front-end apenas esconde botões. Um papel nunca é global.
- Entrada: o professor cria a conta e a organização (ou fica como individual); estudantes entram por código de turma; funcionários entram por convite do administrador.
- Autenticação: não criar criptografia própria. A decisão entre provedor gerenciado e implementação em NestJS (hash Argon2, sessões ou tokens em cookie seguro) vira um ADR no início do repositório. Minha inclinação é deixar **autenticação com biblioteca ou provedor consolidado** e escrever **autorização (papéis) em código próprio**.
- Dados pessoais mínimos (nome e e-mail), política de privacidade, exclusão de conta e atenção à LGPD, porque o produto guarda dados de alunos.

**Tabelas mínimas do MVP:** usuários, organizações, associações (usuário, organização, papel), convites, turmas, membros da turma e plantas publicadas (o JSON da planta, com a turma de destino). Login por SSO, cobrança e papel de analista ficam para depois.

Esta decisão **aumenta o escopo** (estimo cerca de 2 semanas, sem medição). Para limitar o custo: só e-mail e senha, convite por código de turma antes de convite por e-mail, e nenhuma cobrança no MVP.

## Arquitetura técnica

A simulação e o editor rodam inteiros no navegador, e o servidor existe para identidade, perfis, turmas e plantas publicadas. A separação importante é a do motor: ele não conhece React nem 3D.

&#91;embedded content: arquitetura do MVP · navegador e servidor\]

O motor (em destaque) recebe a planta e devolve resultados e um log de eventos; a cena 3D só reproduz esse log. O traço pontilhado marca o que fica para depois do MVP.

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Front-end | Next.js com TypeScript | Stack que você já domina; rotas e páginas prontas |
| 3D | React Three Fiber e drei | Cena em React, com muitos exemplos e componentes |
| Estado | Zustand | Simples, sem cerimônia, bom para editor |
| Persistência local | Dexie sobre IndexedDB | API melhor que a nativa; guarda plantas estruturadas |
| Simulação | Pacote TypeScript próprio, em Web Worker | Testável sem interface e sem travar a tela |
| API | NestJS | Módulos e injeção de dependência ajudam a organizar papéis e organizações |
| Banco | PostgreSQL com um ORM (Prisma ou Drizzle) | Relacional, adequado a organizações, associações e turmas |
| Testes | Vitest, testes de API e Playwright | Motor, autorização por papel e um fluxo ponta a ponta |
| Repositório | Monorepo com pnpm workspaces | Pacotes compartilhados: esquema da planta e motor |

Dois cuidados: pedir ao navegador armazenamento persistente (`navigator.storage.persist()`), porque o IndexedDB pode ser limpo pelo sistema, e oferecer sempre o botão de exportar a planta em JSON.

## Modelo de dados da planta

A planta é um único JSON com versão, desenhado desde o dia 1 para ser salvo no navegador, exportado, compartilhado e, depois, preenchido com dado real. O exemplo abaixo mostra a forma, não um esquema final.

```json
{
  "schemaVersion": 1,
  "id": "plant_01",
  "name": "Linha de montagem exemplo",
  "grid": { "cols": 20, "rows": 12 },
  "elements": [
    { "id": "src1", "type": "source", "pos": [1, 5],
      "params": { "interarrivalSec": 30, "dist": "exponential" } },
    { "id": "m1", "type": "station", "pos": [5, 5],
      "params": { "cycleSec": 25, "defectRate": 0.02, "mtbfMin": 240, "mttrMin": 15 } },
    { "id": "b1", "type": "buffer", "pos": [9, 5], "params": { "capacity": 10 } },
    { "id": "snk1", "type": "sink", "pos": [13, 5], "params": {} }
  ],
  "connections": [
    { "from": "src1", "to": "m1" },
    { "from": "m1", "to": "b1" },
    { "from": "b1", "to": "snk1" }
  ],
  "scenarios": [
    { "id": "base", "name": "Atual", "run": { "durationH": 8, "replications": 30, "seed": 42 }, "overrides": {} }
  ]
}
```

Regras de projeto:

- **Versão no arquivo e migrações** por número de `schemaVersion`, para plantas antigas continuarem abrindo.
- **Unidade no nome do parâmetro** (`cycleSec`, `mtbfMin`), para nunca haver dúvida entre segundos e minutos.
- **Cenário como sobreposição** (`overrides`) sobre a planta base: comparar alternativas vira trocar valores, sem duplicar a planta inteira.
- **Validação na entrada** (por exemplo, com Zod) ao abrir arquivos importados.
- **Parâmetros explícitos e tipados**, porque são exatamente o que na fase 3 será preenchido com dado real em vez de valor digitado.
- **Posição separada do comportamento**: `pos` serve ao 3D; o motor só usa elementos, conexões e parâmetros.

## Motor de simulação

O motor é o principal ativo técnico e deve ser correto antes de ser bonito: uma biblioteca TypeScript pura, sem dependência de React nem de 3D, testável no terminal e executada em um Web Worker para não travar a interface.

**Como funciona.** Simulação de eventos discretos: uma fila de eventos ordenada pelo tempo (chegada, início de processo, fim de processo, falha, reparo) que o motor consome, avançando o relógio de evento em evento. Para o MVP, um motor próprio pequeno basta e dá controle total; bibliotecas só entram se aparecer necessidade.

**Decisões que protegem a credibilidade:**

- **Semente fixa de números aleatórios.** A mesma planta com a mesma semente dá o mesmo resultado, o que torna testes e aulas reproduzíveis.
- **Replicações.** Falhas e defeitos são probabilísticos, então uma rodada só engana. O motor roda várias replicações e informa média e intervalo de confiança.
- **Log de eventos como saída.** O 3D apenas reproduz esse log em câmera acelerada; a cena nunca calcula nada.

**Indicadores do MVP:**

```latex
OEE = D \times P \times Q
```

em que D é a disponibilidade (tempo produzindo em relação ao tempo planejado), P o desempenho (ritmo real em relação ao ritmo ideal) e Q a qualidade (peças boas em relação ao total). Além do OEE, o painel mostra vazão, WIP, lead time e utilização por estação. O **gargalo** é apontado pela maior utilização, confirmada pela fila acumulada à sua frente.

**Validação contra casos conhecidos** (testes automáticos, escritos antes do motor):

| Caso | Resultado esperado pela teoria |
| --- | --- |
| Linha em série, tempos fixos, sem falhas | A vazão converge para 1 dividido pelo maior tempo de ciclo, e o gargalo é a estação mais lenta |
| Fila M/M/1 com taxa de chegada 0,8 e de atendimento 1,0 | Utilização 0,8, 4 itens no sistema em média e 5 unidades de tempo em média por item |
| Qualquer rodada estável | Lei de Little: WIP médio igual à vazão vezes o lead time médio |
| Máquina com falhas, MTBF de 240 min e MTTR de 15 min | Disponibilidade de cerca de 94,1% (240 dividido por 255) |

Quando o motor reproduzir esses quatro casos dentro do intervalo de confiança, ele está pronto para aparecer em sala de aula.

## Plano de execução em 10 semanas

O plano tem cinco fases de duas semanas, cada uma terminando num gate: sem passar nele, a fase seguinte não começa. As durações são estimativas minhas, para uma pessoa trabalhando sozinha, e devem ser recalibradas ao fim da primeira fase.

&#91;embedded content: plano em 5 fases · 10 semanas, 5 gates\]

A fase 1 vem antes do 3D de propósito: motor e esquema corretos são o que sustenta tudo o resto. Se o prazo apertar, corte **nesta ordem**:

1. Comparar dois cenários lado a lado (fica um cenário só).
2. Animação refinada (a cena mostra a fila, sem movimento de peças).
3. Convite por e-mail (fica só o código de turma).

O que **não** se corta: o motor com seus quatro testes, login com papel verificado no servidor e o cenário do gargalo.

## Validação e go-to-market

A validação anda junto com a divulgação: o demo serve ao mesmo tempo para testar a ideia e para chamar a atenção de empresas. Comece as conversas **antes** de terminar o produto, não depois.

1. **Entrevistas (semanas 1 a 4, em paralelo ao código).** Converse com 5 a 10 professores de engenharia de produção. Perguntas centrais: qual conceito é mais difícil de ensinar? Como ensinam hoje? O que usariam em aula se existisse? Pagariam, ou a universidade pagaria?
2. **Demo em vídeo (semana 9).** Dois minutos, seguindo a história única do escopo.
3. **Publicação (semana 10).** LinkedIn e comunidades e eventos de engenharia de produção (por exemplo, ABEPRO e ENEGEP). O interesse aparece como mensagens e pedidos de acesso.
4. **Conversas com empresas.** Use o mesmo demo e pergunte quem treina pessoas em Lean ou testa mudanças de layout hoje.

| Sinal ao fim das 10 semanas | Meta mínima (sugestão de partida) |
| --- | --- |
| Entrevistas com professores concluídas | 8 |
| Professores que pedem acesso para usar em aula | 3 |
| Conversas com empresas | 2 |
| Motor passando nos 4 testes de validação | 4 de 4 |

Se os sinais forem fracos, o aprendizado já valeu e o produto continua servindo como portfólio. Se forem fortes, segue-se para a fase 2. As metas acima são palpites para começar a conversa, não números de mercado.

## Riscos e mitigação

O maior risco é o escopo, ainda mais com backend e papéis desde o início e sem renda no período.

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Escopo cresce | Prazo estoura | Prazo fixo de 10 semanas, lista de "fica de fora" e ordem de corte definida |
| Motor com resultado errado | Professor perde a confiança | Quatro testes analíticos antes do motor, replicações com intervalo de confiança |
| 3D consome o tempo | O visual vira o projeto | Formas simples e câmera fixa no início; modelos só se tiverem licença livre |
| Autenticação ou papéis com falha | Vazamento de dados de alunos | Biblioteca ou provedor consolidado, autorização no servidor, testes de acesso por papel, LGPD desde o início |
| Professor já usa opção gratuita (como o AnyLogic de aprendizado) | Pouca adoção | Diferenciar por web, sem modelagem e didática; confirmar nas entrevistas |
| Desempenho em computador fraco | Travamentos | Motor em Web Worker, limite de elementos por planta, instanciamento no 3D |
| Plantas locais perdidas | Frustração | Armazenamento persistente, exportar JSON e, depois, planta publicada no servidor |
| Promessa grande demais ("teste antes de construir") | Perda de credibilidade | Comunicar só o que o modelo prova; a análise de planta real entra após validação |
| Falta de tempo e renda | Abandono | Marco de decisão ao fim das 10 semanas e uso do demo como portfólio |

## Roadmap pós-MVP e próximos passos

Depois do MVP, a ordem segue a dificuldade dos três usos.

1. **Fase 2, treinar:** missões com metas e pontuação, relatórios por turma ou equipe, planta salva no servidor, convite por e-mail, cobrança.
2. **Fase 3, analisar e planejar:** importação de dados reais por CSV, calibração e validação da planta contra a produção atual, replicações e intervalos de confiança como padrão, papel de analista, SSO.
3. **Fase 4, escala:** layout físico com distâncias e interferências, integrações com dados de sensores (possivelmente de ferramentas como as da Tractian e da Dynamox), módulos de manutenção e qualidade estatística (CEP).

**Próximos passos imediatos**, antes de qualquer código:

- [ ] Confirmar as três decisões do resumo (primeiro modo de uso, simulação por execuções, backend e login desde o início)
- [ ] Marcar 5 a 10 entrevistas com professores
- [ ] Ler os dois artigos acadêmicos citados em Mercado e concorrência
- [ ] Escolher nome e domínio do produto
- [ ] Aprovar este documento como a definição do MVP
- [ ] Usar o prompt da próxima seção para criar o repositório, as skills e a base de engenharia

## Prompt para o terminal

Use este prompt **depois** de aprovar o documento como definição do MVP. Ele cria o repositório e a base de engenharia (arquitetura, testes, revisão de código, skills), sem escrever nenhuma funcionalidade.

**Como usar:** crie a pasta do projeto e rode `git init`; exporte este documento em Markdown e salve como `docs/PRODUCT.md`; abra o Claude Code na pasta (comando `claude`); cole o prompt abaixo.

```text
Você é meu engenheiro de software sênior neste projeto. Nesta sessão não escreva código de funcionalidade: só prepare o repositório e a base de engenharia.

Contexto
O arquivo docs/PRODUCT.md é a fonte de verdade do MVP. Leia-o inteiro antes de qualquer ação. Resumo: plataforma web com planta de fábrica virtual em 3D, editável, movida por um motor de simulação de eventos discretos, para ensinar engenharia de produção. Tem backend com login e perfis de acesso desde o início: organização + papel (administrador da organização, instrutor, aprendiz; analista só na fase 3). A edição da planta fica no IndexedDB do navegador; o servidor guarda contas, organizações, turmas e plantas publicadas.

Trabalhe nesta ordem e PARE para minha aprovação ao fim de cada etapa.

1. Plano. Liste em tópicos o que pretende criar e faça até 5 perguntas sobre pontos em aberto do documento. Não crie arquivos antes da minha resposta.

2. Monorepo (pnpm workspaces): apps/web (Next.js + TypeScript), apps/api (NestJS), packages/engine (motor de simulação em TypeScript puro, sem dependência de React nem do DOM) e packages/schema (tipos e validação da planta com Zod, com schemaVersion). TypeScript estrito, ESLint, Prettier e scripts de lint, typecheck, test e build na raiz.

3. CLAUDE.md na raiz, curto: visão do produto em até 10 linhas, comandos principais, convenções de código e estas regras: o motor nunca importa React; a autorização é sempre decidida no servidor, por organização; unidade no nome dos parâmetros (cycleSec, mtbfMin); nenhum segredo no repositório; lista do que está fora do escopo do MVP.

4. ADRs em docs/adr/ (contexto, decisão, consequências, uma página cada) para: monorepo; motor isolado em Web Worker com semente fixa de números aleatórios; persistência local com Dexie e JSON versionado; modelo organização + papel com RBAC por organização; autenticação (compare provedor gerenciado e implementação própria em NestJS e recomende uma); PostgreSQL e ORM (compare Prisma e Drizzle); estratégia de testes.

5. Testes. Escreva docs/testing.md e configure: Vitest para engine e schema; testes de API com checagem de autorização por papel (cada rota testada com cada papel); Playwright com um fluxo ponta a ponta de exemplo; e os testes de validação do motor contra casos analíticos, escritos antes do motor e ainda falhando: linha em série com tempos fixos (vazão = 1 / maior tempo de ciclo), fila M/M/1 com chegada 0,8 e atendimento 1,0 (utilização 0,8, 4 itens no sistema, 5 unidades de tempo por item), lei de Little (WIP = vazão x lead time) e disponibilidade com MTBF 240 min e MTTR 15 min (cerca de 94,1%).

6. Revisão de código e skills. Crie em .claude/skills/ uma skill por pasta (SKILL.md) para: revisão de código (checklist de segurança, autorização, testes, legibilidade), criação de ADR, e adição de um novo tipo de elemento (esquema, motor e 3D). Crie também um subagente revisor em .claude/agents/ que só lê e comenta, sem editar arquivos.

7. Automação. GitHub Actions com lint, typecheck, test e build em pull request; Conventional Commits; modelo de pull request com checklist (testes, autorização, ADR quando a decisão for de arquitetura).

8. Encerramento. Liste o que ficou pendente e proponha o primeiro marco: esquema da planta e motor com os 4 testes passando.

Regras: trabalhe na branch chore/bootstrap com commits pequenos e frequentes; não instale dependências sem me dizer o motivo; se algo do documento for ambíguo, pergunte em vez de supor; responda em português.
```

Se preferir revisar antes de qualquer criação de arquivo, inicie a sessão no modo de plano do Claude Code. Cada etapa acima pode virar uma sessão separada, o que facilita revisar o resultado.

## Fontes

Consultadas em 19/10/2026. Preços e disponibilidade devem ser confirmados com os fornecedores.

- [FlexSim na DSI (Windows, Autodesk)](https://dsi-mfg.com/software/flexsim) e [anúncio da Autodesk](https://adsknews.autodesk.com/en/news/autodesk-acquires-factory-simulation-flexsim/)
- [G2: FlexSim e Simio](https://www.g2.com/compare/flexsim-vs-simio), [G2: Simio](https://www.g2.com/products/simio/pricing) e [G2: Arena](https://www.g2.com/products/arena-simulation/pricing)
- [Capterra: FlexSim e Arena](https://www.capterra.co.uk/compare/107009/144460/flexsim/vs/arena)
- [Siemens: Plant Simulation X Essentials](https://www.siemens.com/en-us/products/tecnomatix/offerings/plant-simulation-x-essentials/)
- [AnyLogic: preços e edições](https://checkthat.ai/brands/anylogic/pricing) e [AnyLogic na Wikipédia](https://www.wikipedia.com/wiki/AnyLogic)
- [realvirtual WEB](https://realvirtual.io/en/buy/)
- [Dessouky et al., Virtual Factory Teaching System (2001)](https://manuscript.isc.ac/Inventory/10/7792.htm) e [simulador web de fábrica virtual (WSC 2004)](https://www.informs-sim.org/wsc04papers/282.pdf)
- [Dynamox na Capterra](https://www.capterra.com/p/10048586/Dynamox-Platform/) e [Tractian](https://neuronfeed.com/startups/tractian)
