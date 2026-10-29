# STATUS — verdade primeiro

Atualizado: 2026-10-29, **M7 concluído, exceto o teste com TalkBack** (pendente do Android). Design
concluído (marco MD, nota A). Estados: **feito** (na tela e verificado) · **parcial** (parte pronta; o
que falta está dito) · **pendente** (não começou).
"Teste automatizado" = Jest (`npm test`). "Teste manual" = descrito na linha.
Aparelho de teste até agora: só iPhone. **Nada foi testado em Android** (o APK está pronto, D37).

| Req | Estado | Onde está | Como foi verificado | Falta |
|---|---|---|---|---|
| RQ01 | feito | Início: cartão da hora escolhida (`app/(tabs)/index.tsx`, `components/ForecastHero.tsx`) | Teste automatizado (`__tests__/inicio.test.tsx`). iPhone a cada etapa (último: 2026-10-29) | TalkBack |
| RQ02 | feito | Início: faixa das 24 horas (`components/DayStrip.tsx`); Detalhes: hora a hora (`app/(tabs)/detalhes.tsx`, `components/HourRow.tsx`) | Teste automatizado (`DayStrip.test.tsx`, `detalhes.test.tsx`). iPhone (2026-10-29) | TalkBack |
| RQ03 | parcial | Atividades (`app/(tabs)/atividades.tsx`, `components/ActivityRow.tsx`, `hooks/useActivityChecks.ts`, `lib/hourPhrases.ts`) | Teste automatizado (`atividades.test.tsx`, `hourPhrases.test.ts`). iPhone (2026-10-28) | **Jogos online:** a API 0.2.0 não tem essa atividade (6 de 7). TalkBack |
| RQ04 | feito | Hora escolhida no app inteiro (`hooks/useChosenHour.ts`): faixa do Início (toque, botões e leitor de tela) e lista de Detalhes | Teste automatizado (`inicio.test.tsx`, `detalhes.test.tsx`, `DayStrip.test.tsx`). iPhone (2026-10-28 e 29). O seletor nativo de hora e os períodos saíram na D34/D35 | TalkBack |
| RNF01 | parcial | Critérios da WCAG 2.2 AA aplicados em todas as telas (os RNF abaixo) | Testes automatizados e VoiceOver no iPhone | TalkBack; checklist formal da NBR 17060 |
| RNF02 | parcial | Nome, função e estado em todo controle (`selected`, `expanded`, `adjustable`); lint de acessibilidade | VoiceOver no iPhone, em todas as telas, a cada etapa | **TalkBack** |
| RNF03 | feito | Categoria em texto + forma + cor; padrão nas barras; ✓ na seleção | Teste automatizado (`DayStrip.test.tsx`). iPhone nos dois modos | — |
| RNF04 | feito | `theme/index.ts`, `theme/contrast.ts` | Teste automatizado de todos os pares, nos modos claro e escuro (`theme/contrast.test.ts`), e do ícone (`__tests__/icons.test.ts`) | — |
| RNF05 | parcial | Sem `numberOfLines` nem `lineHeight` fixo; linhas quebram com texto grande | Texto no máximo no iPhone, em todas as telas (2026-10-29) | Android. Os rótulos de hora dentro da faixa não crescem (a hora e a categoria estão em texto que cresce) |
| RNF06 | feito | Só toques simples; a faixa também tem "Hora anterior/Próxima hora" | Leitura do código e testes | — |
| RNF07 | feito | "O que esperar neste horário" em Detalhes, com "O que é isso?" (D35); termos técnicos só na tela Sobre | Teste automatizado (`detalhes.test.tsx`, `vocabulario.test.tsx`) | — |
| RNF08 | parcial | Anúncios da previsão e da hora escolhida; foco no "Fechar" do modal (D36) e na faixa ("Trocar hora", D34) | Teste automatizado; VoiceOver no iPhone | TalkBack |
| RNF09 | feito | 48 dp em botões, linhas e links (`minTouch`; `hitSlop` em "O que é isso?") | Teste automatizado | — |

## M7: passada final (2026-10-29)
- **README reescrito** para quem nunca viu o projeto: telas, APK, desenvolvimento, arquitetura,
  requisitos, acessibilidade, design, testes, equipe e limitações.
- **Roteiro da Mostra:** `docs/MOSTRA.md`, com o roteiro de 3 minutos, o plano B e as perguntas
  prováveis.
- **Cobertura (SCRUM-23, só medida, sem meta):** `npm run coverage`, em `src`, sem os arquivos de
  teste. A pasta `coverage/` não vai para o git.

  | Medida | Resultado |
  |---|---|
  | Instruções | 95,39% (725/760) |
  | Ramos | 87,84% (441/502) |
  | Funções | 93,72% (254/271) |
  | Linhas | 96,37% (612/635) |

  A menor é `app/(tabs)/detalhes.tsx` (65% das linhas): a rolagem até a hora escolhida depende de
  medidas da tela, que o Jest não calcula.
- **Testes:** 243 passando, 2 pulados (API ao vivo), em 22 arquivos.
- **Pendente:** o teste com TalkBack e com texto grande no Android (APK pronto, D37).

## APK Android de demonstração (D37)
- Configurado: `eas.json` (perfil `preview`, APK, distribuição interna) e `app.json` (pacote
  `br.edu.brazcubas.sinalcerto`, `versionCode` 1, fundo da tela de abertura nas cores do tema).
- Conferido no computador: a configuração do Expo é válida; o pacote Android compila (`expo export`); o
  endereço da API vai embutido no build.
- Início: a região passou a ser o cabeçalho da tela para o leitor de tela (teste automatizado).
- Projeto EAS criado pela equipe (2026-10-29): @gabrieldotech/sinalcerto-app, com o `projectId` no `app.json`. O
  build `preview` carregou do `eas.json` o endereço da API e `EXPO_PUBLIC_DATA_SOURCE=auto` (API com reserva).
- **Pendente:** o build no EAS (rodado pela equipe), a instalação no Android do Léo e o roteiro com
  TalkBack e texto grande. **O app nunca rodou em Android até aqui.**
- **Ícone e tela de abertura do SinalCerto (D38):** três barras de sinal no verde do tema, geradas de
  um SVG por `npm run icons`; contraste ≥ 3:1 conferido por teste.

## Design concluído (2026-10-29)
- **Revisão final** (`mobile-design-review`, comparada com `design-baseline.json`): nota de design B → **A**,
  nota de "cara de IA" **A**.
  - **Alto impacto:** nenhum aberto. O FINDING-001 (modal sem "Fechar") foi resolvido na D36.
  - **Médios em aberto:** Início sem o nome do app e sem título para navegar por cabeçalhos; carregamento só
    com indicador giratório em Início, Detalhes e Escolher local; retorno ao toque só por escurecimento
    (decisão da equipe); rótulos da faixa do dia que não crescem com o texto; linhas de Atividades como
    superfícies separadas.
- Revisão só pelo código; as telas foram testadas pela equipe no iPhone a cada etapa. **Não testado:** Android.
- Merge da `md-design` na `main`, sem squash.

## Marco de design (MD), E5: Escolher local e Sobre (D36)
- Teste automatizado (`__tests__/local-sobre.test.tsx`):
  - **Escolher local:** título como cabeçalho; "Fechar" com 48 dp, com o foco do leitor de tela ao
    abrir; 10 regiões em lista de 48 dp, com a atual selecionada; "Fechar" volta sem trocar a região.
  - **Sobre:** título em serifa no conteúdo e seções na ordem.
  - **Outros testes:** `inicio` e `vocabulario` ajustados aos nomes das regiões ("São Paulo (SP)").
- Teste manual no iPhone (2026-10-29): 2 bugs corrigidos (o voltar da tela Sobre mostrava "(tabs)"; o aviso
  de conexão aparecia no modal) e um teste novo (o ✓ do modal segue a região do Início). `npm run check`: 238
  testes. **Não testado:** Android.

## Marco de design (MD), D35: Detalhes no wireframe v2 ("Hora a hora")
- Teste automatizado (`__tests__/detalhes.test.tsx`):
  - **Topo:** "Hora a hora" com "São Paulo (SP) · 8 boas, 13 regulares, 3 instáveis"; sem filtros nem
    "Mostrando".
  - **Lista:** 24 linhas ("20:00, Regular") em 2 dias, sem nota; a hora do app vem selecionada.
  - **Linha aberta:** abre uma por vez (`expanded`), escolhe a hora para o app inteiro e anuncia;
    tocar de novo fecha.
  - **Métricas:** "Tempo de resposta · 73 ms" e "Informação perdida · 3,9%" com a frase de efeito,
    lidas em ordem.
  - **Explicações:** "O que é isso?" (48 dp) abre e fecha o texto longo.
  - **Nota:** "Nota 63 de 100 · Confiança 80%" no fim; às 15:00, sem confiança.
  - **Outros:** link Sobre; 404 e erro de rede.
- Também: guarda de vocabulário com a linha aberta; contraste dos pares sobre `primarySoft` nos dois
  modos. `npm run check`: 232 testes.
- Teste manual no iPhone (2026-10-29): aprovado, com uma correção ("O que é isso?" na mesma linha da
  métrica, com o alvo de 48 dp pelo `hitSlop`). **Não testado:** Android.

## Marco de design (MD), D33: faixa do dia; Início e Atividades com uma pergunta por tela
- Bases em `docs/fundamentacao-design.md`. A E4 (Detalhes) está pausada e guardada em `git stash`
  ("E4 pausada"), sem commit (D32).
- Teste automatizado:
  - **Faixa (`components/DayStrip.test.tsx`):**
    - 24 barras em ordem de tempo, com altura pela nota (eixo em 0) e a categoria certa;
    - a mais alta é a das 23h;
    - rótulos a cada 3 horas e as datas 19/08 e 20/08;
    - contorno só na hora escolhida, com o horário acima;
    - horas apagadas com listras e opacidade (16 de 24 na chamada de vídeo);
    - toque escolhe a barra certa;
    - ajustável no leitor de tela, com o toque duplo sem efeito;
    - botões de hora com anúncio e desativados nas pontas.
  - **Início (`__tests__/inicio.test.tsx`):**
    - cartão com a categoria, uma frase e "Última previsão disponível: 20 de agosto, 20:00", sem
      o título, o conselho e o aviso longo;
    - região curta com "Trocar";
    - melhor momento só no cartão dele;
    - resumo da faixa só com a contagem;
    - a hora escolhida na faixa vale em Atividades;
    - ordem de leitura.
  - **Atividades (`__tests__/atividades.test.tsx`):**
    - chips com estado selecionado;
    - planejador com 24 chamadas, no máximo 6 ao mesmo tempo, e cache;
    - a frase aparece uma vez só;
    - grade de 2 colunas que vira 1 com `fontScale` ≥ 1,3.

  `npm run check`: 211 testes. O bundle iOS compila.
- Teste manual no iPhone (prints, 2026-10-28): rodada de revisão com 6 ajustes pedidos (D34).
- **D34 (wireframe v2, `docs/design/wireframe-v2.md`), teste automatizado:**
  - **Início:**
    - abre em 20:00, e o cartão (data em cima, categoria, frase) segue a faixa;
    - sem título grande, título da faixa ou contagem;
    - faixa com "19 e 20 de agosto" e "20:00 · Regular";
    - "Melhor: das 23h às 7h · Boa / Evite: das 15h às 18h · Instável";
    - botão "O que dá para fazer?" e "Saiba mais" para a seção nova da tela Sobre;
    - ordem de leitura.
  - **Atividades:**
    - lista de 6 linhas com status em texto ("Funciona", "Pode falhar", "Não deve funcionar") na
      hora selecionada;
    - uma linha aberta por vez, com `expanded`, indicador "Carregando horários" e Melhor/Evite
      anunciados;
    - 23 chamadas (a hora selecionada já no cache), no máximo 6 por vez;
    - erro com "Tentar de novo";
    - "Trocar hora" põe o foco na faixa do Início.
  - **Frases (`lib/hourPhrases.test.ts`):** minoria listada, "o resto do dia", "o dia todo",
    "nenhum horário", sem dar a volta nos dados.

  `npm run check`: 221 testes. O bundle iOS compila.
- **Não feito:** "Jogos online" (RQ03), porque a API não tem essa atividade (ver D34). O RQ03 continua
  com 6 atividades.
- **RQ04:** o seletor nativo de hora e os períodos saíram de Atividades. A hora agora é escolhida pela
  faixa do Início e pela lista de Detalhes.
- Teste manual no iPhone (2026-10-28): Início e Atividades no wireframe v2 aprovados, inclusive o aviso e
  "Saiba mais" e "Às 20:00" e "Trocar hora" centralizados. **Não testado:** Android.

## Marco de design (MD), E3: Atividades com o planejador (D31)
- Teste automatizado (`__tests__/atividades.test.tsx`, `components/DayClock.test.tsx`):
  - título "Atividades" como cabeçalho;
  - nenhuma chamada antes de tocar numa atividade;
  - ao tocar: 24 chamadas só daquela atividade, no máximo 6 ao mesmo tempo, com a frase "Chamada de
    vídeo: melhor das 23h às 7h" anunciada, o cartão com estado selecionado e o relógio lido pela
    frase;
  - cache: com 12:00 já consultado, saem só 23 chamadas, e voltar a uma atividade não consulta nada;
  - "todas as horas" (Mandar mensagens);
  - erro numa hora, com "Tentar de novo" que consulta só a que faltou;
  - horas apagadas com padrão e opacidade (16 de 24 para chamada de vídeo).

  `npm run check`: 208 testes. O bundle iOS compila.
- Teste manual no iPhone (2026-10-28): "Chamada de vídeo: melhor das 23h às 7h"; contorno nas horas
  boas e listras nas apagadas, legenda "Não deve funcionar"; "Mandar mensagens" com todas as horas;
  cache ao voltar para a atividade; "Tarde" com status nos cartões e o ponto nas 12h; VoiceOver lendo
  "selecionado" e a frase; modo escuro e texto no máximo sem confundir listras e categorias; modo
  avião respondendo na hora. **E3 aprovada.**
- **Não testado:** Android.

## Marco de design (MD), E2: novo Início (D29, D30)
- Teste automatizado: cabeçalhos ("SinalCerto" e "Previsão de 19 e 20 de agosto"), melhor momento e
  "Evite" calculados dos dados, relógio lido pelo resumo (sem imagem solta), ordem de leitura
  (`__tests__/inicio.test.tsx`); resumos (`data/forecastSummary.test.ts`); geometria do relógio:
  cada fatia na hora certa com a categoria certa, e o marcador na fatia certa
  (`components/DayClock.test.tsx`); contraste do gradiente nos dois modos.
- Teste manual no iPhone, 1ª rodada (2026-10-28): visual aprovado nos dois modos (cartão de topo,
  melhor momento, relógio com padrão e resumo em texto, contraste no modo escuro). Três ajustes
  pedidos e feitos (D30): relógio parecia deslocado em uma hora; "Próximas horas" removida;
  conteúdo passava por baixo da barra de status.
- Teste manual no iPhone, 2ª rodada (2026-10-28): fatia das 23h verde e a das 22h pontilhada,
  verde até as 7h, quadriculado das 15h às 18h, ponto no meio da fatia das 20h; Início sem
  "Próximas horas"; rolagem sem texto sobre a barra de status nos dois modos; VoiceOver, texto no
  máximo e troca de região ok. **E2 aprovada.**
- **Não testado:** Android.

## Marco de design (MD), E1: tema claro e escuro, fontes e ícones (D28)
- Teste automatizado: contraste de todos os pares **nos dois modos** (`theme/contrast.test.ts`);
  `npm run check` com o cache do Jest limpo (163 testes); bundle iOS.
- Teste manual no iPhone (2026-10-28): abertura sem troca visível de fonte; títulos em serifa e
  texto em Manrope; abas com ícone e texto, a ativa em verde; modo escuro legível nas 5 telas
  (inclusive o aviso "Sem conexão"); modo claro correto; VoiceOver lendo só o nome das abas; texto
  no máximo sem cortes nos dois modos.
- Efeito nos requisitos: RNF04 agora vale nos dois modos (teste automatizado + aparelho); RNF05
  conferido com as fontes novas nos dois modos.
- **Não testado:** Android (modo escuro e fontes).

## Verificação da entrega anterior (M6, API real com reserva automática, D27)
- `ApiSource` contra a Internet Quality API, `FallbackSource` com reserva automática, aviso de
  conexão nas 5 telas, mensagem de primeira carga lenta, mensagens de 400/422.
- Teste automatizado: `ApiSource.test.ts`, `FallbackSource.test.ts`, `__tests__/aviso.test.tsx`,
  guarda de vocabulário (com "servidor"). Teste contra a API real (`LIVE_API=1`): passou em
  2026-10-28.
- Teste manual no iPhone (2026-10-28): abertura com "Carregando a previsão…" e depois "Previsão
  atualizada"; aviso em todas as telas; modo avião caindo para a reserva sem perder os dados;
  VoiceOver anunciando a mudança uma vez só; volta da rede com "Tentar de novo"; tela Sobre
  mostrando a fonte em uso; texto no máximo sem cortes.
- Depois do teste, o texto do aviso mudou para "Sem conexão: mostrando a previsão guardada no app"
  (e "Mostrando a previsão guardada no app" no modo só reserva). A mudança foi só de texto, coberta
  pelos testes automatizados; ainda não foi vista no aparelho.
- **Não testado:** Android; o caso "sem dados" (404) vindo da API real numa região conhecida (não
  acontece com os dados atuais).

## Verificação da entrega anterior (M5.1, linguagem para leigos)
- Teste manual no iPhone (2026-10-28): "Região escolhida: São Paulo (SP)"; avisos novos no Início;
  link "Sobre o SinalCerto" discreto e anunciado como link; seção "O que esperar neste horário" com
  73 ms e 3,9% nos textos novos e sem jitter, "Redes" ou OK/Risco/Falha; valores de 15:00 corretos
  com a confiança sumindo; tela Sobre completa e visível com o cabeçalho do iOS 26, títulos como
  cabeçalhos no VoiceOver; "milissegundos" e "por cento" lidos por extenso; texto no máximo sem
  cortes.

## Verificação da entrega anterior (M5 + SDK 58)
- `npm run check`, 2026-10-27: sem erros, 101 testes em 13 arquivos; `expo-doctor` 20/20; bundle iOS
  gerado sem erro.
- Teste manual no iPhone com Expo Go SDK 58 (2026-10-28): app abre; M5 com os valores certos e a
  confiança sumindo às 15:00; lista de locais visível com o cabeçalho do iOS 26; Atividades e
  Detalhes funcionando; VoiceOver e texto no máximo ok.

## Verificação da entrega anterior (M4)
- `npm run check` (typecheck + lint com a11y + Jest), 2026-10-22: sem erros, 94 testes passando em 12 arquivos.
- Bundle iOS gerado sem erro (2026-10-22).
- Teste manual no iPhone (2026-10-22): 24 horas com cabeçalhos de data; filtros com ✓ (Noite com 6
  horas nas duas datas); hora escolhida em Detalhes valendo em Atividades; aviso "Você escolheu
  15:20" sumindo ao trocar a hora em Detalhes; "Próximas horas" com a mensagem honesta; seletor do
  M3 fechando ao tocar num período. VoiceOver: linhas como frase, cabeçalhos de data para pular
  entre dias, "selecionado" na hora escolhida, anúncios de filtro e de escolha. Texto no máximo
  sem cortes.
- **Não testado no aparelho:** nada no Android, em especial o diálogo nativo de hora
  (`DateTimePickerAndroid.open`), que também não é exercitado pelos testes automatizados.

## Problemas conhecidos
- Avisos `act(...)` no console durante os testes de tela. Vêm de dentro do expo-router e não
  fazem nenhum teste falhar.
- Botão azul de engrenagem no iPhone: não faz parte do app (ver a mensagem do M2).
- Ao voltar a um horário cuja consulta falhou enquanto ele estava na tela, o erro antigo aparece
  até a nova tentativa terminar (`useActivityChecks.ts`).
- No computador de desenvolvimento, o McAfee ocupa a porta 8081 (IPv4) e o celular não acha o
  Metro. Solução usada: `npx expo start -c --port 8082`.
