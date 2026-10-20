# Públicos e mercado

> **Resumo.** Quem compra são instituições de ensino e empresas; professores, alunos e funcionários são os usuários. Os simuladores industriais maduros são pesados, voltados a especialistas e com preço sob consulta. O espaço que o Takt busca é web, sem modelagem, didático e com preço aberto: uma hipótese, não um fato.

Atualizado em 20/10/2026 · Decisões: [PDR-0003](../pdr/0003-compradores-e-validacao.md).

## Públicos

| Público | Dor (premissa, não validada por entrevistas) | O que o Takt entrega | Quem paga |
| --- | --- | --- | --- |
| Professor de engenharia de produção | Ensinar prática com slides e exercícios de papel; laboratório físico caro; software profissional caro e desktop | Uma fábrica montada e alterada sem instalar nada | Instituição de ensino |
| Aluno | Difícil enxergar o efeito de variabilidade, filas e falhas | Rodar e "quebrar" a linha à vontade | Ninguém (conta gratuita) |
| Empresa: treinamento | Treinar em Lean sem parar a produção | Capacitar, com missões (fase 2) e cópia da própria fábrica | Empresa |
| Empresa: engenharia | Testar mudanças antes de investir | Analisar (fase 4 do roadmap) | Empresa |

**Premissa assumida:** professores querem a ferramenta. **Critério de adoção:** abrir o link, montar uma linha em até 5 minutos e usar na aula seguinte.

## Concorrência

Levantamento de 19/10/2026 em fontes públicas; preços não confirmados com os fornecedores.

| Ferramenta | O que é | Preço | Observação |
| --- | --- | --- | --- |
| FlexSim | Simulação 3D de eventos discretos | Sob consulta | Comprada pela Autodesk em 2023; Windows |
| Simio | Simulação de processos industriais | Sem preço público | Uso corporativo |
| Arena | Simulação de eventos discretos | Sem preço público | Presença acadêmica estabelecida |
| Plant Simulation X Essentials (Siemens) | SaaS para modelos 3D de produção; entrada limitada a 500 objetos | Assinatura, valor não confirmado | Integra com OPC UA e MQTT |
| AnyLogic | Simulação multimétodo | Edição de aprendizado gratuita (não comercial); profissional sob consulta | Roda no navegador via AnyLogic Cloud; curva de aprendizado alta |
| realvirtual WEB | Gêmeo digital 3D no navegador, AGPL | Gratuito; licenças comerciais à parte | Foco em automação (PLC), não em ensino de operações |
| Tractian, Dynamox | Sensores + software de manutenção preditiva | Assinatura por ativo | Competem por dado real, não por modelo |

**Precedentes acadêmicos:** o Virtual Factory Teaching System (Dessouky et al., 2001) e um simulador web de fábrica virtual (Winter Simulation Conference, 2004). Ambos separam o modelo de simulação da interface, a mesma decisão do Takt. Ver [references.md](references.md).

## Espaço livre (hipóteses)

- Web, sem instalação, rodando no computador do laboratório.
- O usuário **não modela**: arrasta elementos prontos, em vez de programar (a barreira do AnyLogic).
- Feito para ensinar: indicadores explicados, cenários guiados.
- Preço aberto e conteúdo em português alinhado ao currículo (OEE, TPM, CEP), com inglês para o exterior.
- Caminho posterior para calibrar a planta com dados reais.

**Risco:** o professor pode já usar uma opção gratuita (AnyLogic de aprendizado). A diferenciação depende de facilidade e didática, não de recursos.
