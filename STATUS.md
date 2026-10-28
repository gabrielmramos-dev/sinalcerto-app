# STATUS — verdade primeiro

Atualizado: 2026-10-28, M6 aprovado (API real com reserva automática). Estados: **feito** (na tela e verificado) ·
**parcial** (parte pronta; o que falta está dito) · **pendente** (não começou).
"Teste automatizado" = Jest (`npm test`). "Teste manual" = descrito na linha.
Aparelho de teste até agora: só iPhone. **Nada foi testado em Android.**

| Req | Estado | Onde está | Como foi verificado | Falta |
|---|---|---|---|---|
| RQ01 | feito | `app/(tabs)/index.tsx` (cartão "Previsão mais próxima"), `components/StatusBadge.tsx` | Teste automatizado (`__tests__/inicio.test.tsx`: categoria, data real, aviso de dado antigo, anúncio). Teste manual no iPhone (2026-10-16): troca de local funciona e o Início volta com a região escolhida | TalkBack (Android). O cartão continua sendo a previsão mais próxima de agora (RQ01); o horário escolhido aparece em Atividades e Detalhes |
| RQ02 | feito | `app/(tabs)/detalhes.tsx` (24 horas em lista textual, cabeçalho por dia, filtros por período), `components/TimelineRow.tsx`, `data/time.ts` (`groupByDay`), `data/periods.ts` (`itemsInPeriod`); prévia "Próximas horas" no Início (D22) | Teste automatizado (`__tests__/detalhes.test.tsx`: 24 linhas com nome completo, 2 cabeçalhos, filtro Noite com 6 horas em 2 datas, `selected`, anúncios, tocar numa hora vale na aba Atividades, estados carregando/erro/vazio/filtro sem horas; `__tests__/inicio.test.tsx`: prévia honesta e prévia com 3 horas). **Teste manual no iPhone (2026-10-22):** 24 horas com cabeçalhos de data; filtros com ✓ (Noite com 6 horas nas duas datas); hora escolhida em Detalhes valendo em Atividades; "Próximas horas" com a mensagem honesta | TalkBack (Android). A prévia com horas futuras só foi vista em teste automatizado (os dados atuais não têm horas depois do cartão) |
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

## Verificação desta entrega (M6, API real com reserva automática, D27)
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
