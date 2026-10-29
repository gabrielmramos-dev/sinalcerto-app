# STATUS — verdade primeiro

Atualizado: 2026-10-29, M6 aprovado; marco de design (MD) em andamento: E1 a E3 e Início/Atividades no wireframe v2 aprovados; Detalhes (D35) aprovado. Estados: **feito** (na tela e verificado) ·
**parcial** (parte pronta; o que falta está dito) · **pendente** (não começou).
"Teste automatizado" = Jest (`npm test`). "Teste manual" = descrito na linha.
Aparelho de teste até agora: só iPhone. **Nada foi testado em Android.**

| Req | Estado | Onde está | Como foi verificado | Falta |
|---|---|---|---|---|
| RQ01 | feito | `app/(tabs)/index.tsx` (cartão "Previsão mais próxima"), `components/StatusBadge.tsx` | Teste automatizado (`__tests__/inicio.test.tsx`: categoria, data real, aviso de dado antigo, anúncio). Teste manual no iPhone (2026-10-16): troca de local funciona e o Início volta com a região escolhida | TalkBack (Android). O cartão continua sendo a previsão mais próxima de agora (RQ01); o horário escolhido aparece em Atividades e Detalhes |
| RQ02 | feito | `app/(tabs)/detalhes.tsx` ("Hora a hora": 24 horas em lista vertical por dia, linha que abre o que esperar, D35), `components/HourRow.tsx`, `data/time.ts` (`groupByDay`); faixa do dia no Início (D33, D34). Os filtros por período saíram na D35 | Teste automatizado (`__tests__/detalhes.test.tsx`: 24 linhas com nome completo, 2 cabeçalhos, filtro Noite com 6 horas em 2 datas, `selected`, anúncios, tocar numa hora vale na aba Atividades, estados carregando/erro/vazio/filtro sem horas; `__tests__/inicio.test.tsx`: prévia honesta e prévia com 3 horas). **Teste manual no iPhone (2026-10-22):** 24 horas com cabeçalhos de data; filtros com ✓ (Noite com 6 horas nas duas datas); hora escolhida em Detalhes valendo em Atividades; "Próximas horas" com a mensagem honesta | TalkBack (Android). A prévia com horas futuras só foi vista em teste automatizado (os dados atuais não têm horas depois do cartão) |
| RQ03 | feito | `app/(tabs)/atividades.tsx`, `components/ActivityCard.tsx`, `hooks/useActivityChecks.ts` (D5, D19, D20) | Teste automatizado: 6 cartões com `suitable` e `code` da API, erro e "Tentar de novo" por cartão, timeout de 15 s, cache, descarte de resposta atrasada, anúncio do resumo. **Teste manual no iPhone (2026-10-16):** 6 cartões com status em texto, ícone e cor | TalkBack (Android) |
| RQ04 | parcial | `components/TimeChooser.tsx`, `data/periods.ts` (D17), `data/time.ts` (`itemAtClock`, D6, D18) | Teste automatizado: 4 períodos com data completa e maior nota; 15:20 → 15:00 com aviso; o aviso some quando o horário muda em Detalhes; tocar num período fecha o seletor; só `predictionFor` da timeline enviado (o seletor nativo é um substituto nos testes). **Teste manual no iPhone (2026-10-16):** botões de período com ✓; seletor nativo de rolagem: 15:20 virou 15:00, com aviso. **(2026-10-22):** o seletor fecha ao tocar num período; o aviso "Você escolheu 15:20" some ao trocar a hora em Detalhes | **Seletor do Android (diálogo `DateTimePickerAndroid`): não testado no aparelho nem nos testes automatizados** |
| RNF01 | pendente | — | — | Checklist NBR 17060 / WCAG no M7 |
| RNF02 | parcial | `AppButton` e `TimelineRow` (role, nome, dica, estado); cartões e linhas lidos como um item; "Tentar de novo: <atividade>"; períodos, filtros, locais e horas com `selected`; lint a11y | Teste automatizado + lint. **VoiceOver no iPhone (2026-10-16):** Início (cartão como frase única com a data, "Trocar local", 3 abas com nome, região selecionada anunciada); Atividades (cartões como frase única, "selecionado" nos períodos, seletor ajustável). **(2026-10-22):** Detalhes (linhas lidas como frase, cabeçalhos de data para pular entre dias, "selecionado" na hora escolhida) | TalkBack (Android) |
| RNF03 | parcial | Texto + forma + cor em `StatusBadge` (qualidade, atividades, linhas da timeline); seleção com "✓" e `selected` | Teste automatizado. Teste manual no iPhone: status das atividades (2026-10-16) e linhas e filtros da timeline (2026-10-22) com texto, ícone e cor ou "✓" | Android; conferência final no M7 |
| RNF04 | parcial | `theme/index.ts`, `theme/contrast.ts` | Teste automatizado: 18 pares da paleta | Conferir cada tela no M7 |
| RNF05 | parcial | Sem `numberOfLines` e sem `lineHeight` fixo; botões e linhas da timeline quebram linha; telas com rolagem | **Texto no máximo no iPhone:** Início, Escolher local e Atividades (2026-10-16); Detalhes e a prévia do Início (2026-10-22); seção "Como ler os números" e todas as telas no SDK 58 (2026-10-28), sem cortes nem sobreposições | Android |
| RNF06 | parcial | Só toques simples em botões; o seletor de rolagem do iOS tem "Usar este horário" e "Cancelar"; filtros sem rolagem horizontal | Leitura do código. Teste manual no iPhone: seletor ajustável pelo VoiceOver (2026-10-16; de novo no SDK 58 em 2026-10-28) | Android |
| RNF07 | feito | `components/NumbersSection.tsx` (seção "O que esperar neste horário" na aba Detalhes; até o M5 chamava "Como ler os números"); bastidores, jitter e faixas de Redes na tela `app/sobre.tsx`; textos em `i18n/glossary.ts`; `data/metrics.ts` (`bandFor`, D23); D24 | Teste automatizado (`data/metrics.test.ts`: bordas das faixas; `__tests__/detalhes.test.tsx`: latência e perda com valor, faixa de Redes e explicação, aviso de que RTT alto sozinho não é defeito, jitter sem valor com aviso, nota explicada, confiança só na hora em que a API manda, equivalência Boa/Regular/Instável = OK/Risco/Falha, categoria sem reclassificação). **Teste manual no iPhone, SDK 58 (2026-10-28):** valores certos (73,2 ms, 3,9%, nota 63, confiança 80% às 20:00), confiança some às 15:00, VoiceOver e texto no máximo ok. Bordas das faixas (D23) confirmadas pela equipe **M5.1 (D26), teste manual no iPhone (2026-10-28):** "O que esperar neste horário" com 73 ms e 3,9% nos textos novos, sem jitter, "Redes" ou OK/Risco/Falha; valores de 15:00 corretos com a confiança sumindo; tela Sobre completa e visível; VoiceOver lendo "milissegundos" e "por cento" por extenso; texto no máximo sem cortes. Guarda de vocabulário automatizado (`__tests__/vocabulario.test.tsx`) | TalkBack (Android) |
| RNF08 | parcial | Anúncios: previsão (Início), resumo das atividades (Atividades), filtro e hora escolhida (Detalhes) | Teste automatizado (o anúncio é chamado com o texto certo). **VoiceOver no iPhone (2026-10-16):** novo local anunciado ao voltar; resumo das atividades anunciado. **(2026-10-22):** anúncios de filtro e de hora escolhida | TalkBack (Android) |
| RNF09 | parcial | `AppButton` e `TimelineRow` com mínimo de 48 | Teste automatizado (`AppButton`) | Conferir a barra de abas no celular |

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
