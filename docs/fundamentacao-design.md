# Fundamentação das decisões de design

Bases das decisões de design do SinalCerto. Para cada fonte: o que ela diz e onde aparece no app.
O conteúdo de cada fonte foi resumido pela equipe; este documento não acrescenta números nem
conclusões além disso.

## 1. Cleveland e McGill (1984), "Graphical Perception"

**O que diz:** ordenaram as codificações visuais pela precisão de leitura, da mais para a menos
precisa:
1. posição numa escala comum;
2. posição em escalas iguais, mas desalinhadas;
3. comprimento;
4. ângulo e inclinação;
5. área;
6. volume e saturação de cor;
7. matiz de cor.

**Onde aparece no app:** na faixa do dia, que usa barras (posição e comprimento) no lugar do relógio
(ângulo) (D33), e na regra de nunca depender só da cor. A categoria é sempre mostrada com texto,
ícone e padrão (RNF03).

## 2. Waldner et al. (2019), "Linear vs. Radial Charts for Daily Patterns" (arXiv 1907.13534)

**O que diz:**
- **Resultado principal:** com participantes leigos e dados de 24 horas, o gráfico de barras linear de
  24 horas foi o mais preciso e o mais rápido em todas as tarefas: localizar uma hora, ler um valor e
  achar o máximo.
- **Gráficos radiais:** o radial de 12 horas teve até 41% de erro na leitura de valores, e o formato
  de relógio não melhorou a compreensão do padrão diário. A única vantagem do radial foi ser
  considerado mais divertido por alguns participantes.
- **Limitação:** um único conjunto de dados e participantes da América do Norte.

**Onde aparece no app:** na D33, a troca do relógio de 24 horas pela faixa do dia, no Início e em
Atividades e, depois, em Detalhes.

## 3. Kay et al. (2016), "When(ish) is My Bus? User-centered Visualizations of Uncertainty in Everyday, Mobile Predictive Systems" (CHI)

**O que diz:** as pessoas usam previsões em apps do dia a dia sem perceber que elas têm incerteza.
Em telas pequenas, os autores propõem mostrar resultados discretos e testar com usuários leigos.

**Onde aparece no app:**
- **Categorias:** as três categorias (Boa, Regular, Instável).
- **Aviso:** a previsão é uma estimativa e pode errar.
- **Confiança:** a confiança da previsão aparece na tela Sobre.

## 4. Nielsen Norman Group, "3 Strategies for Managing Visual Complexity"

**O que diz:** recomenda três estratégias:
- posição previsível;
- hierarquia visual clara;
- revelação progressiva: mostrar só o necessário e abrir os detalhes quando o usuário pedir.

**Onde aparece no app:** em "uma pergunta por tela" (D33). O Início responde "como está e quando é
melhor?", e Atividades responde "quando posso fazer isto?". Os números ficam concentrados em
Detalhes.

## 5. Nielsen (2005), "Lower-Literacy Users: Writing for a Broad Consumer Audience"

**O que diz:** escrever para quem lê com mais dificuldade melhora a experiência de todos.

**Onde aparece no app:** na revisão de linguagem para leigos (D26).

## 6. WCAG 2.2 AA e ABNT NBR 17060

**O que diz:** critérios de acessibilidade.

**Onde aparece no app:** no RNF01, que reúne os requisitos de acessibilidade do app.
