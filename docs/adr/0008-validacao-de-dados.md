# ADR-0008: Validação de dados com Zod

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api`, `takt-web-app`, `@takt/plant-schema` |

## Contexto

"Validação" cobre quatro perguntas diferentes:
1. a entrada tem o formato certo;
2. a ação é permitida pelas regras de negócio;
3. o documento da planta é válido e pode rodar;
4. o dado gravado é coerente.

O projeto anterior (`cliniccontrol`) usava `class-validator` e Zod ao mesmo tempo e validava a mesma entrada no controller e no caso de uso, o que gerou duplicação. O documento da planta é usado pelo front (editor e importação), pela API (importação) e pelo motor, e precisa de um formato publicável para quem quiser integrar.

## Decisão

### Camadas

| Camada | Ferramenta | Onde |
| --- | --- | --- |
| Formato da entrada HTTP | Zod | `http/` de cada módulo |
| Regra de negócio | Código do domínio, sem biblioteca | Entidades e objetos de valor ([ADR-0002](0002-arquitetura-hexagonal-por-contexto.md)) |
| Documento da planta | Zod + validador semântico | `@takt/plant-schema` |
| Última linha | Restrições do PostgreSQL (NOT NULL, FK, UNIQUE, CHECK) | Migrações |
| Variáveis de ambiente | Zod | Na inicialização da API: se faltar algo, ela não sobe |

### Entrada da API

1. **Zod é a única biblioteca de validação.** Sem `class-validator`.
2. Cada rota declara esquemas para corpo, parâmetros e *query*; um *pipe* do NestJS valida antes do controller. **Uma única validação de formato por entrada.**
3. **Modo estrito:** campos desconhecidos são recusados.
4. **Conversão de tipos só em parâmetros e *query*** (que chegam como texto); o corpo nunca é convertido implicitamente.
5. **Erros como códigos:** cada problema vira `{ path, code }` e a resposta usa o código `VALIDATION_ERROR` (422). A interface traduz (RN-I18-004).
6. **A documentação OpenAPI é gerada dos mesmos esquemas.**

### Saída da API

7. **DTO de saída explícito:** o controller monta a resposta campo a campo, a partir da entidade. Nunca devolve a entidade nem o registro do banco.
8. **Nos testes, toda resposta é validada contra o esquema de saída** da rota.

### Documento da planta

9. **Zod é a fonte da verdade** do esquema da planta, em `@takt/plant-schema`. Os tipos TypeScript são inferidos dele.
10. **JSON Schema gerado a partir do Zod** (o Zod 4 gera nativamente), publicado como artefato versionado. O JSON exportado leva um campo `"$schema"`, para que editores como o VS Code validem e completem o arquivo.
11. **Dois níveis de validação, os mesmos no front e na API:**
    - **estrutural (Zod):** tipos, faixas (por exemplo, `defectRate` entre 0 e 1), obrigatórios, versão;
    - **semântico (funções puras):** conexões apontam para elementos existentes; percentuais somam 100% (RN-SIM-005); há fonte e saída; nenhum elemento solto; nenhuma sobreposição na grade (RN-EDT-001); saídas com vários destinos têm regra (RN-SIM-004).
12. **O resultado é uma lista `{ elementId?, path, code }`**, que o editor mostra no elemento afetado (RN-EDT-004) e a API devolve em `INVALID_PLANT` ou `INVALID_PLANT_FILE`.
13. **Importação em três passos:** ler `schemaVersion` → aplicar as migrações em cadeia até a versão atual → validar com o esquema atual (RN-JSN-005). Versão mais nova que a do sistema: `UNSUPPORTED_SCHEMA_VERSION`.

## Alternativas consideradas

- **TypeBox + Ajv:** o esquema nasce como JSON Schema padrão e o Ajv é muito rápido. Menos ergonômico para regras como "a soma dá 100%", e o front usaria outra ferramenta nos formulários. **Palpite:** a velocidade não importa para arquivos de até 1 MB.
- **JSON Schema escrito à mão + Ajv:** fonte padrão, mas tipos TypeScript gerados à parte e risco de divergência.
- **`class-validator` (padrão do NestJS):** acopla a validação a classes com decoradores; não serve ao front nem ao motor.
- **Validação semântica dentro do Zod (`superRefine`):** possível, mas mistura formato e regra e dificulta devolver erros por elemento.

## Consequências

**Positivas:**
- Um esquema da planta para front, API e motor: nunca divergem.
- Formato da planta documentado e utilizável por ferramentas externas, via JSON Schema.
- Menos validação duplicada do que no `cliniccontrol`.

**Negativas e custos:**
- O JSON Schema gerado não expressa as regras semânticas; ele documenta só a estrutura.
- Dependência forte do Zod em três projetos.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Atribuição em massa** | Escalada de privilégio | Modo estrito; `organizationId` e usuário vêm do contexto, nunca do corpo ([ADR-0002](0002-arquitetura-hexagonal-por-contexto.md)) |
| **Corpo enorme ou muito aninhado** | Negação de serviço | Limite de tamanho do corpo no servidor; 1 MB para a planta (RN-JSN-005); limites de quantidade de elementos e conexões no esquema |
| **Poluição de protótipo** (chaves como `__proto__`) | Alteração de comportamento da aplicação | Modo estrito recusa chaves desconhecidas; nenhuma mesclagem profunda de objetos vindos do usuário |
| **Expressão regular catastrófica (ReDoS)** | Negação de serviço | Evitar expressões regulares complexas nos esquemas; preferir validadores prontos (e-mail, UUID) |
| **Entrada que não passa pela borda HTTP** (tarefas, filas) | Dado inválido no domínio | Toda entrada externa ao processo é validada no seu próprio adaptador |
| **Resposta vazando campos internos** | Exposição de dados (por exemplo, hashes) | DTO de saída explícito e validação das respostas nos testes |

## Conformidade

- Lint: nenhuma importação de `class-validator`; o domínio não importa `zod` ([ADR-0002](0002-arquitetura-hexagonal-por-contexto.md)).
- Teste de inicialização: toda rota com corpo, parâmetros ou *query* tem esquema declarado.
- Testes da planta: um caso por regra semântica, com o código esperado; os mesmos testes valem para o front e a API, porque o código é o mesmo.
- Teste: o JSON Schema gerado é atualizado no build e comparado com o versionado (falha se esquecerem de gerar).
- Teste: campo desconhecido no corpo devolve `VALIDATION_ERROR`.

## Relacionados

- [ADR-0002](0002-arquitetura-hexagonal-por-contexto.md), [ADR-0006](0006-autorizacao-por-organizacao.md).
- Regras: [json.md](../product/rules/json.md), [editor.md](../product/rules/editor.md), [simulation.md](../product/rules/simulation.md), [i18n.md](../product/rules/i18n.md).
- [Modelo da planta](../product/plant-model.md).

## Em aberto

- Biblioteca de integração Zod + NestJS + OpenAPI (uma pronta ou um *pipe* próprio), escolhida na implementação.
- Limites de quantidade de elementos e conexões por planta.
