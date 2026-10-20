# Riscos de produto

> **Resumo.** Os maiores riscos de produto são o projeto nunca ficar apresentável (sem prazo e sem cortes), o editor 3D consumir o tempo e o motor dar resultados errados. Riscos de código ficam para a sessão de arquitetura.

Atualizado em 20/10/2026.

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Nunca ficar apresentável | Projeto pela metade quando surgir um emprego | Marcos mostráveis, revisão a cada marco, post por marco ([PDR-0015](../pdr/0015-marcos-mostraveis.md)) |
| Editor 3D consome tudo | O visual vira o projeto | Formas simples e um único padrão de interação; arte só depois |
| Motor com resultado errado | Perda de credibilidade com engenheiros | Testes contra a literatura antes do motor ([simulation.md](simulation.md)) |
| Professor simulado | Recursos que professores não usam | Teste de uso de 5 minutos com alguém de fora, antes do marco 5 |
| Pouca adoção por haver opção gratuita (AnyLogic de aprendizado) | Pouco interesse | Diferenciar por web, sem modelagem e didática |
| Falha de segurança com dados de alunos | Vazamento, problema com a LGPD | Autorização no servidor, RLS, testes de papel e isolamento, dados mínimos |
| Desempenho em computador fraco | Travamentos em aula | Motor fora da linha principal, limite de elementos por plano, 3D *low-poly* |
| Plantas locais perdidas | Frustração | Exportar JSON sempre; planta salva no servidor a partir do marco 4 |
| Promessa grande demais ("gêmeo digital") | Perda de credibilidade | Comunicar só o que existe; o resto como "em breve" |
| Código fechado no portfólio | O recrutador não vê o código | ADRs públicos e posts técnicos (em aberto) |
| Nome "Takt" indisponível | Troca de marca | Checar domínio e INPI antes de publicar |
