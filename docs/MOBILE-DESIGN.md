# MOBILE-DESIGN.md — SinalCerto

Fonte da verdade do design. Toda decisão de interface lê este arquivo antes. Escrito no marco de
design (MD), etapa E1, com a skill `mobile-design-system`; as etapas seguintes o atualizam.
Referência visual (estilo, não conteúdo): `docs/design/figma-01..10.png`.

## App Read

Previsão da qualidade da internet para leigos, com foco em acessibilidade (WCAG 2.2 AA, NBR
17060, VoiceOver testado a cada marco). Linguagem calma e direta.
- Plataformas: iOS de primeira classe (aparelho de teste da equipe); Android de primeira classe no
  código, ainda não testado em aparelho; web não é alvo.
- Postura: marca única (mesmo visual nas duas plataformas), com navegação nativa por baixo.
- Offline: existe (reserva guardada no app, D27).

## Dials

| Dial | Antes (M6) | Alvo (MD) | Por quê |
|---|---|---|---|
| EXPRESSION | 3 | 6 | marca própria (cores, serifa, relógio), mas barra de abas e cabeçalhos nativos |
| MOTION | 1 | 3 | só o que responde a um toque (expandir linha, destacar o relógio); movimento reduzido respeitado |
| DENSITY | 4 | 3 | arejado: público leigo, texto grande |

**Elemento assinatura (um só):** a faixa do dia, com 24 barras e padrão por categoria (D33; substituiu o relógio de 24 horas da E2 e da E3). O resto
fica quieto.

## Design System

### Escolhas seguras (SAFE)
- **Uma cor de acento** (verde-floresta), uma família de cinzas esverdeados, sem gradiente roxo.
- **Barra de abas e cabeçalhos nativos** (CHROME LAGS CONTENT): o cabeçalho das 3 abas é escondido
  e o título em serifa vai para o conteúdo, mas a barra de abas e os cabeçalhos de Sobre e Escolher
  local continuam nativos, com o voltar nativo.
- **Cores de categoria com significado fixo** (Boa verde, Regular âmbar, Instável vermelho), sempre
  junto de texto e forma (RNF03).
- **Tema seguindo o sistema**, sem botão, claro e escuro desde o início.
- **Uma família de ícones** (Lucide), traço 2, importados um a um.

### Riscos (RISK)
```
RISK: títulos em DM Serif Display (serifa de alto contraste) + texto em Manrope
gain: identidade própria e hierarquia clara entre título e texto, como nos prints
cost: a serifa só tem um peso (sem negrito) e precisa ser provada com texto no máximo;
      Manrope é perto do "sem serifa geométrica seguro" que muitos apps usam
```
```
RISK: um gradiente no app, no cartão de topo do Início, na cor da categoria (E2)
gain: a categoria vira a coisa mais visível da tela, que é o que o stakeholder pediu
cost: o contraste tem de valer no ponto mais claro e no mais escuro do gradiente, nos dois modos
```
```
RISK: padrões (liso, pontilhado, quadriculado) nas barras da faixa do dia (D33; antes, nas fatias do relógio)
gain: a categoria não depende só da cor nem no gráfico (RNF03); é o elemento memorável
cost: em tamanho pequeno o padrão pode virar ruído; a faixa precisa de resumo em texto
```
```
RISK: fundo off-white quente (#F6F5F1), como nos prints
gain: fidelidade à referência aprovada; menos cansativo que o branco puro
cost: creme + serifa é um visual comum em apps gerados por IA; compensado com o acento verde
      (e não terracota) e com o relógio como assinatura
```

**Coerência:** a serifa de um peso só e a escala com texto ampliado podem brigar nos títulos
longos; os títulos quebram linha (sem `numberOfLines`) e são conferidos com texto no máximo a
cada etapa.

### Paleta (`src/theme/index.ts`)

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| background | #F6F5F1 | #0F1512 | fundo das telas |
| surface | #FFFFFF | #18201B | cartões, barra de abas |
| text | #17201B | #E9EFEA | texto principal |
| textMuted | #4F5A53 | #A7B3AB | texto de apoio |
| primary | #1F6B45 | #86D2A3 | acento único: botões, aba ativa, foco |
| onPrimary | #FFFFFF | #0D1A12 | texto sobre o acento |
| primarySoft | #DDF1E4 | #1E3A2A | fundo suave do acento (sem texto) |
| border | #7E8A82 | #6F7D74 | bordas e divisórias (>= 3:1) |
| danger | #A3261F | #FF8A80 | erros |
| good / goodBg | #17693A / #DDF1E4 | #7FD59D / #173A26 | Boa |
| moderate / moderateBg | #7A4500 / #FDEBCB | #F3C26C / #3A2B10 | Regular |
| unstable / unstableBg | #A3261F / #FBE1DE | #FF9A8F / #3E1A16 | Instável |

Todo par usado na tela está em `contrastPairs` e passa no teste nos **dois** modos
(`src/theme/contrast.test.ts`): 4,5:1 para texto, 3:1 para ícones, bordas e texto grande.

### Tipografia

| Token | Família | Tamanho | Uso |
|---|---|---|---|
| display | DM Serif Display | 40 | a categoria no cartão do Início |
| title | DM Serif Display | 30 | título de cada tela |
| heading | DM Serif Display | 21 | títulos de seção |
| label | Manrope SemiBold | 16 | botões, rótulos |
| body | Manrope Regular | 16 | texto |
| small | Manrope Medium | 14 | apoio |

Sem `lineHeight` fixo no texto e sem `maxFontSizeMultiplier`: todo texto escala com o sistema
(RNF05, verificado no iPhone a cada marco). Sem `fontWeight`: o peso vem da família (no Android, um
peso por família). Fontes carregadas com `expo-font` antes de a tela de abertura sumir.

### Espaço, forma e elevação
- Espaços: 4, 8, 16, 24, 32. Margem lateral das telas: 16.
- Cantos (trava de forma): 8 chips, 12 controles e linhas, 16 cartões, pílula para selos.
- Elevação `card`: sombra do iOS + `elevation: 2` do Android sempre juntas.
- Toque: mínimo 48 dp (RNF09).

### Movimento e háptica
- Navegação: transições nativas. Toque: retorno visual em todo botão (E5 troca a opacidade por
  escala no iOS e ondinha no Android).
- Movimento só em resposta ao usuário; `Reduzir movimento` do sistema é respeitado.
- Háptica: nenhuma por enquanto (não há ação que a justifique).

## Onde está cada coisa
- Tokens e ganchos de tema: `src/theme/index.ts` (`useColors`, `createThemedStyles`).
- Contraste: `src/theme/contrast.ts` e `contrast.test.ts`.
- Fontes: `src/app/_layout.tsx`. Ícones das abas: `src/app/(tabs)/_layout.tsx`.
- Textos: `src/i18n/glossary.ts` (nunca no código das telas).

## Nav Read (atual, sem reestruturação)
```
abas (3): Início · Atividades · Detalhes      ícones Lucide + texto
app/
  (tabs)/index        Início      → push sobre · modal local
  (tabs)/atividades   Atividades
  (tabs)/detalhes     Detalhes    → push sobre
  local               modal (pageSheet), título e botão Fechar próprios, foco no Fechar (D36)
  sobre               push, voltar nativo; título em serifa no conteúdo (D36)
sheets: nenhuma
voltar do Android: padrão em todas
máximo de toques até qualquer tela: 2
```

## Componentes do marco
- `ForecastHero`: cartão de topo com o gradiente da categoria (tokens `hero*From/To`).
- `SignalBars`: barras de sinal (4/2/1 cheias), decorativas.
- `DayStrip` (D33): faixa do dia.
  - **Barras:** 24, em ordem de tempo, todas da mesma altura (D34); a cor e o padrão são a categoria.
  - **Rótulos:** a cada 3 horas, com a data na virada.
  - **Hora escolhida:** contorno na barra e "01:00 · Boa" em Text acima (D34), crescendo com o texto.
  - **Toque:** uma área só, mais "Hora anterior" e "Próxima hora".
  - **Leitor de tela:** ajustável, com legenda e resumo em texto.

  Substituiu o `DayClock`.
- `TabScreen`: aba sem cabeçalho nativo, com área segura e faixa na cor do fundo (D30, D31).
- `ActivityRow` (D34): linha de atividade (alvo ≥ 48) com status em ícone + texto; abre Melhor/Evite, uma
  por vez (`expanded`).
- `BestAvoid` (D34): "Melhor" (verde) e "Evite" (vermelho) em duas linhas com divisória; Início e Atividades.
- Resumos da previsão: `src/data/forecastSummary.ts` (`dayRange`, `bestOverall`, `windowsWhere`,
  `formatWindows`, `countByQuality`).

## Histórico
- 2026-10-28, E1: proposta SAFE/RISK aprovada pela equipe (fontes, Lucide, ícones nas abas,
  cabeçalho das abas escondido, Fechar no modal, nota discreta). Tema claro e escuro.
- 2026-10-28, E2: Início redesenhado (D29): cartão em gradiente, melhor momento, relógio de 24 horas.
  Depois do teste no iPhone (D30): a fatia começa na hora (não fica centrada no rótulo), "Próximas
  horas" saiu, e uma faixa na cor do fundo cobre a área segura do topo.
- 2026-10-28, E3: Atividades com o planejador no relógio (D31); esboço do layout no carregamento.
- 2026-10-28, D33: relógio trocado pela faixa do dia, com as bases em `docs/fundamentacao-design.md`;
  Início e Atividades com uma pergunta por tela. E4 (Detalhes) pausada.
- 2026-10-28, D34 (wireframe v2, `docs/design/wireframe-v2.md`): Início sem título (cartão, faixa,
  Melhor/Evite, botão, aviso); Atividades em lista com status e linha que abre Melhor/Evite.
- 2026-10-29, fechamento: revisão final contra `design-baseline.json`: nota B → A, nenhum achado alto;
  E5 (D36: Escolher local e Sobre). Merge da md-design na main.
