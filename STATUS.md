# STATUS â€” verdade primeiro

Atualizado: 2026-10-22, M4 aprovado. Estados: **feito** (na tela e verificado) Â·
**parcial** (parte pronta; o que falta estÃ¡ dito) Â· **pendente** (nÃ£o comeÃ§ou).
"Teste automatizado" = Jest (`npm test`). "Teste manual" = descrito na linha.
Aparelho de teste atÃ© agora: sÃ³ iPhone. **Nada foi testado em Android.**

| Req | Estado | Onde estÃ¡ | Como foi verificado | Falta |
|---|---|---|---|---|
| RQ01 | feito | `app/(tabs)/index.tsx` (cartÃ£o "PrevisÃ£o mais prÃ³xima"), `components/StatusBadge.tsx` | Teste automatizado (`__tests__/inicio.test.tsx`: categoria, data real, aviso de dado antigo, anÃºncio). Teste manual no iPhone (2026-10-16): troca de local funciona e o InÃ­cio volta com a regiÃ£o escolhida | TalkBack (Android). O cartÃ£o continua sendo a previsÃ£o mais prÃ³xima de agora (RQ01); o horÃ¡rio escolhido aparece em Atividades e Detalhes |
| RQ02 | feito | `app/(tabs)/detalhes.tsx` (24 horas em lista textual, cabeÃ§alho por dia, filtros por perÃ­odo), `components/TimelineRow.tsx`, `data/time.ts` (`groupByDay`), `data/periods.ts` (`itemsInPeriod`); prÃ©via "PrÃ³ximas horas" no InÃ­cio (D22) | Teste automatizado (`__tests__/detalhes.test.tsx`: 24 linhas com nome completo, 2 cabeÃ§alhos, filtro Noite com 6 horas em 2 datas, `selected`, anÃºncios, tocar numa hora vale na aba Atividades, estados carregando/erro/vazio/filtro sem horas; `__tests__/inicio.test.tsx`: prÃ©via honesta e prÃ©via com 3 horas). **Teste manual no iPhone (2026-10-22):** 24 horas com cabeÃ§alhos de data; filtros com âœ“ (Noite com 6 horas nas duas datas); hora escolhida em Detalhes valendo em Atividades; "PrÃ³ximas horas" com a mensagem honesta | TalkBack (Android). A prÃ©via com horas futuras sÃ³ foi vista em teste automatizado (os dados atuais nÃ£o tÃªm horas depois do cartÃ£o) |
| RQ03 | feito | `app/(tabs)/atividades.tsx`, `components/ActivityCard.tsx`, `hooks/useActivityChecks.ts` (D5, D19, D20) | Teste automatizado: 6 cartÃµes com `suitable` e `code` da API, erro e "Tentar de novo" por cartÃ£o, timeout de 15 s, cache, descarte de resposta atrasada, anÃºncio do resumo. **Teste manual no iPhone (2026-10-16):** 6 cartÃµes com status em texto, Ã­cone e cor | TalkBack (Android) |
| RQ04 | parcial | `components/TimeChooser.tsx`, `data/periods.ts` (D17), `data/time.ts` (`itemAtClock`, D6, D18) | Teste automatizado: 4 perÃ­odos com data completa e maior nota; 15:20 â†’ 15:00 com aviso; o aviso some quando o horÃ¡rio muda em Detalhes; tocar num perÃ­odo fecha o seletor; sÃ³ `predictionFor` da timeline enviado (o seletor nativo Ã© um substituto nos testes). **Teste manual no iPhone (2026-10-16):** botÃµes de perÃ­odo com âœ“; seletor nativo de rolagem: 15:20 virou 15:00, com aviso. **(2026-10-22):** o seletor fecha ao tocar num perÃ­odo; o aviso "VocÃª escolheu 15:20" some ao trocar a hora em Detalhes | **Seletor do Android (diÃ¡logo `DateTimePickerAndroid`): nÃ£o testado no aparelho nem nos testes automatizados** |
| RNF01 | pendente | â€” | â€” | Checklist NBR 17060 / WCAG no M7 |
| RNF02 | parcial | `AppButton` e `TimelineRow` (role, nome, dica, estado); cartÃµes e linhas lidos como um item; "Tentar de novo: <atividade>"; perÃ­odos, filtros, locais e horas com `selected`; lint a11y | Teste automatizado + lint. **VoiceOver no iPhone (2026-10-16):** InÃ­cio (cartÃ£o como frase Ãºnica com a data, "Trocar local", 3 abas com nome, regiÃ£o selecionada anunciada); Atividades (cartÃµes como frase Ãºnica, "selecionado" nos perÃ­odos, seletor ajustÃ¡vel). **(2026-10-22):** Detalhes (linhas lidas como frase, cabeÃ§alhos de data para pular entre dias, "selecionado" na hora escolhida) | TalkBack (Android) |
| RNF03 | parcial | Texto + forma + cor em `StatusBadge` (qualidade, atividades, linhas da timeline); seleÃ§Ã£o com "âœ“" e `selected` | Teste automatizado. Teste manual no iPhone: status das atividades (2026-10-16) e linhas e filtros da timeline (2026-10-22) com texto, Ã­cone e cor ou "âœ“" | Android; conferÃªncia final no M7 |
| RNF04 | parcial | `theme/index.ts`, `theme/contrast.ts` | Teste automatizado: 18 pares da paleta | Conferir cada tela no M7 |
| RNF05 | parcial | Sem `numberOfLines` e sem `lineHeight` fixo; botÃµes e linhas da timeline quebram linha; telas com rolagem | **Texto no mÃ¡ximo no iPhone:** InÃ­cio, Escolher local e Atividades (2026-10-16); Detalhes e a prÃ©via do InÃ­cio (2026-10-22), sem cortes nem sobreposiÃ§Ãµes | Android; telas do M5 |
| RNF06 | parcial | SÃ³ toques simples em botÃµes; o seletor de rolagem do iOS tem "Usar este horÃ¡rio" e "Cancelar"; filtros sem rolagem horizontal | Leitura do cÃ³digo. Teste manual no iPhone: seletor ajustÃ¡vel pelo VoiceOver | Android; telas do M5 |
| RNF07 | parcial | `i18n/glossary.ts` | Teste automatizado | Mostrar as mÃ©tricas na tela (M5) |
| RNF08 | parcial | AnÃºncios: previsÃ£o (InÃ­cio), resumo das atividades (Atividades), filtro e hora escolhida (Detalhes) | Teste automatizado (o anÃºncio Ã© chamado com o texto certo). **VoiceOver no iPhone (2026-10-16):** novo local anunciado ao voltar; resumo das atividades anunciado. **(2026-10-22):** anÃºncios de filtro e de hora escolhida | TalkBack (Android) |
| RNF09 | parcial | `AppButton` e `TimelineRow` com mÃ­nimo de 48 | Teste automatizado (`AppButton`) | Conferir a barra de abas no celular |

## VerificaÃ§Ã£o desta entrega (M4)
- `npm run check` (typecheck + lint com a11y + Jest), 2026-10-22: sem erros, 94 testes passando em 12 arquivos.
- Bundle iOS gerado sem erro (2026-10-22).
- Teste manual no iPhone (2026-10-22): 24 horas com cabeÃ§alhos de data; filtros com âœ“ (Noite com 6
  horas nas duas datas); hora escolhida em Detalhes valendo em Atividades; aviso "VocÃª escolheu
  15:20" sumindo ao trocar a hora em Detalhes; "PrÃ³ximas horas" com a mensagem honesta; seletor do
  M3 fechando ao tocar num perÃ­odo. VoiceOver: linhas como frase, cabeÃ§alhos de data para pular
  entre dias, "selecionado" na hora escolhida, anÃºncios de filtro e de escolha. Texto no mÃ¡ximo
  sem cortes.
- **NÃ£o testado no aparelho:** nada no Android, em especial o diÃ¡logo nativo de hora
  (`DateTimePickerAndroid.open`), que tambÃ©m nÃ£o Ã© exercitado pelos testes automatizados.

## Problemas conhecidos
- Avisos `act(...)` no console durante os testes de tela. VÃªm de dentro do expo-router e nÃ£o
  fazem nenhum teste falhar.
- BotÃ£o azul de engrenagem no iPhone: nÃ£o faz parte do app (ver a mensagem do M2).
- Ao voltar a um horÃ¡rio cuja consulta falhou enquanto ele estava na tela, o erro antigo aparece
  atÃ© a nova tentativa terminar (`useActivityChecks.ts`).
- No computador de desenvolvimento, o McAfee ocupa a porta 8081 (IPv4) e o celular nÃ£o acha o
  Metro. SoluÃ§Ã£o usada: `npx expo start -c --port 8082`.
