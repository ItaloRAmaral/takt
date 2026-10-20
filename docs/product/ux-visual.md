# Identidade visual, UX e idiomas

> **Resumo.** O tom mistura o técnico e sério com o leve e didático. A meta de facilidade é mensurável: montar uma linha de 3 estações e rodar em até 5 minutos, sem ajuda. O 3D é estilizado em *low-poly*. A interface é bilíngue (pt-BR padrão e inglês).

Atualizado em 20/10/2026 · Decisões: [PDR-0007](../pdr/0007-montagem-3d-em-grade.md), [PDR-0016](../pdr/0016-idiomas.md), [PDR-0018](../pdr/0018-identidade-visual-e-ux.md) · Regras: [rules/editor.md](rules/editor.md), [rules/i18n.md](rules/i18n.md).

## Critério de facilidade

Quem nunca viu o Takt monta uma linha de 3 estações e roda em até **5 minutos, sem ajuda**. Meta futura: 3 minutos. Esse critério é o roteiro do teste de uso com uma pessoa de fora.

## Princípios de UX

- **Nunca tela vazia:** ao abrir, já existe uma fábrica de exemplo.
- **Valores padrão sensatos:** um elemento solto na grade já funciona.
- **Desfazer sempre:** errar sem medo.
- **Explicação em camadas, sob demanda** ([PDR-0021](../pdr/0021-explicacao-em-camadas.md), [regras](rules/help.md)):
  - **dica** de uma frase em todo termo, indicador e campo;
  - **painel "Saiba mais"** ao lado, sem bloquear a tela, do concreto (a planta aberta) ao abstrato (a regra geral);
  - **explicação do resultado em degraus**: meta → dica de processo → diagnóstico depois de o usuário prever → hipótese para testar;
  - **planejamento de experimentos** sob demanda.
- **Ajuda desligável:** o usuário desliga e religa dicas e ajudas. O modo, o aviso de utilização, a incerteza e o empate nunca se desligam.
- **Alertas de estado sempre visíveis:** gargalo, fila crescendo, buffer cheio, estação bloqueada ou sem material e máquina em falha aparecem sobre o elemento na cena e no painel de resultados, com cor e ícone ([RN-HLP-010](rules/help.md)).
- **Erro no lugar certo:** um problema da planta aparece no elemento afetado.

## Editor

Grade com encaixe, no estilo dos jogos de construção (The Sims): câmera orbital, vista de cima opcional, rotação em passos de 90°. Formas simples primeiro; a arte vem depois que a interação funcionar.

## Visual

- **3D estilizado em *low-poly***, com cores chapadas: legível e leve no computador do laboratório.
- **Interface neutra e limpa**, com uma cor de destaque.
- **Cores de estado fixas** em toda parte: rodando, fila, parada, gargalo.
- **Nunca só cor.** **Fato:** cerca de 8% dos homens têm daltonismo vermelho-verde. O gargalo leva cor **e** ícone ou contorno.
- **Números com dígitos de largura fixa**, para os indicadores não "pularem".

## Menu

```
CAPACITAR                 Planta: [paleta por módulo] [cena 3D]
  Grupos                  Abas de zonas (linhas)
  Plantas                 Indicadores: [Produção] [Estoque] ...
  Missões (em breve)
ANALISAR (em breve)
  Plantas reais
  Cenários
Organização (admin)
```

## Idiomas

- Português do Brasil (padrão) e inglês, incluindo o conteúdo didático.
- Idioma inicial pelo navegador; depois, a preferência salva no perfil.
- O que o usuário cria não é traduzido; a fábrica de exemplo existe nas duas línguas.
- A API devolve códigos; a interface traduz.

**Em aberto:** quem garante a qualidade técnica do conteúdo didático em inglês.
