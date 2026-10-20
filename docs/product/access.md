# Acesso, papéis, planos e grupos

> **Resumo.** O acesso se modela por organização + papel, nunca por "tipo de usuário". Toda conta tem uma organização (a pessoal, criada no cadastro). O papel diz quem pode; o plano diz o que a organização contratou. Grupos definem o que cada aprendiz vê. As regras exatas estão em [rules/](rules/README.md).

Atualizado em 20/10/2026 · Decisões: [PDR-0009](../pdr/0009-acesso-no-mvp.md), [PDR-0010](../pdr/0010-papel-diferente-de-plano.md), [PDR-0011](../pdr/0011-grupos.md), [PDR-0019](../pdr/0019-hierarquia-de-papeis.md).

## Conceitos

- **Usuário:** uma pessoa com uma conta.
- **Organização:** uma instituição de ensino, uma empresa ou a área pessoal de alguém.
- **Associação:** liga um usuário a uma organização com um papel. Uma pessoa pode ter várias (professora em duas universidades; aluno que também é funcionário).
- **Plano:** o que a organização contratou (áreas, módulos, limites). Uma organização tem exatamente um.
- **Grupo:** turma na escola, equipe na empresa. Recebe plantas publicadas.

## Papéis

O papel mais alto herda as permissões dos mais baixos.

| Papel | Código | Quem é | Pode (além do que herda) | Fase |
| --- | --- | --- | --- | --- |
| Administrador | `admin` | Responsável na instituição ou empresa | Gerir membros e papéis, ver o uso, importar e exportar planta real, copiar planta real | MVP |
| Instrutor | `instructor` | Professor; instrutor ou líder de treinamento | Criar grupos, montar e publicar plantas, exportar plantas didáticas | MVP |
| Aprendiz | `learner` | Estudante; funcionário em treinamento | Abrir plantas publicadas, rodar, criar e importar plantas próprias, exportar as próprias | MVP |
| Analista | `analyst` | Engenharia e operações | Plantas reais, dados, cenários | Fase 4 do roadmap |

**Permissões** usam o formato `resource:action`, em inglês (`plant:publish`, `group:manage`). A lista completa nasce na arquitetura.

## Fluxos de entrada

- **Cadastro sozinho:** cria a conta e a organização pessoal, como administrador, no plano gratuito.
- **Aluno:** cria a conta e entra num grupo pelo código; vira aprendiz da organização do grupo.
- **Funcionário:** convite do administrador (por código no MVP; por e-mail depois).
- **Recrutador:** contas demo por papel, numa organização isolada e restaurada todo dia.

## Ordem das checagens

Toda requisição passa por: **quem é** (autenticação) → **qual organização** (sem associação = como se não existisse) → **o papel permite** → **o plano permite** → **o recurso pertence à organização**. A autorização é sempre decidida no servidor; o front-end só esconde botões. O isolamento no banco (RLS) é decisão técnica, a registrar em ADR.

## Privacidade

- Dados pessoais mínimos: nome e e-mail.
- Só maiores de 18 no MVP.
- Política de privacidade, exclusão de conta e atenção à LGPD, porque o produto guarda dados de alunos.

## Auditoria (proposta)

Ações sensíveis ficam registradas no servidor (quem, quando, o quê). Proposta de eventos para o MVP:
- cópia e exportação de planta real;
- mudança de papel e remoção de membro;
- geração de código novo de grupo e desativação da entrada.

**Em aberto:** a lista final e onde a auditoria vive (serviço próprio ou dentro da API), a definir na arquitetura.
