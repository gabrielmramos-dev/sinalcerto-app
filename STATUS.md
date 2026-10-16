# STATUS — verdade primeiro

Atualizado: 2026-10-16, M2 aprovado. Estados: **feito** (na tela e verificado) ·
**parcial** (parte pronta; o que falta está dito) · **pendente** (não começou).
"Teste automatizado" = Jest (`npm test`). "Teste manual" = descrito na linha.

| Req | Estado | Onde está | Como foi verificado | Falta |
|---|---|---|---|---|
| RQ01 | feito | `app/(tabs)/index.tsx` (cartão "Previsão mais próxima"), `components/StatusBadge.tsx` | Teste automatizado (`__tests__/inicio.test.tsx`: categoria, data real, aviso de dado antigo, anúncio). Teste manual no iPhone (2026-10-16): troca de local funciona e o Início volta com a região escolhida | Mostrar o horário escolhido pelo usuário (M3/M4) |
| RQ02 | pendente | Dados prontos: `getTimeline` no mock | Teste automatizado | Tela (M4) e prévia no Início (D15) |
| RQ03 | pendente | Dados prontos: `checkActivity` no mock, textos no glossário | Teste automatizado | Tela (M3) |
| RQ04 | pendente | `data/time.ts` (`nearestItem`, D6) | Teste automatizado | Seletor e botões de período (M3) |
| RNF01 | pendente | — | — | Checklist NBR 17060 / WCAG no M7 |
| RNF02 | parcial | `AppButton` (role, nome, dica, estado); cartão do Início lido como um item; lista de locais com `selected`; lint a11y | Teste automatizado + lint. **Teste manual, VoiceOver no iPhone (2026-10-16):** cartão lido como frase única com a data; botão "Trocar local" e as 3 abas com nome; região selecionada anunciada na lista | TalkBack (Android); telas do M3 em diante |
| RNF03 | parcial | Texto + forma + cor em `StatusBadge`; local atual marcado com "✓" e `selected` | Teste automatizado | Aplicar nas telas do M3/M4 |
| RNF04 | parcial | `theme/index.ts`, `theme/contrast.ts` | Teste automatizado: 18 pares da paleta | Conferir cada tela no M7 |
| RNF05 | parcial | Sem `numberOfLines` e sem `lineHeight` fixo; telas com rolagem | **Teste manual no iPhone com texto no máximo (2026-10-16):** Início, Atividades, Detalhes e Escolher local sem cortes nem sobreposições | Repetir nas telas do M3 em diante (Atividades e Detalhes ainda são provisórias) |
| RNF06 | parcial | Início e Escolher local só com toques simples em botões | Leitura do código | Conferir nas telas seguintes |
| RNF07 | parcial | `i18n/glossary.ts` | Teste automatizado | Mostrar as métricas na tela (M5) |
| RNF08 | parcial | Anúncio da previsão ao carregar e ao trocar de local (`announceForAccessibility`) | Teste automatizado (o anúncio é chamado com o texto certo). **Teste manual, VoiceOver no iPhone (2026-10-16):** novo local anunciado ao voltar | TalkBack (Android); anúncios das telas do M3 em diante |
| RNF09 | parcial | `AppButton` com mínimo de 48 | Teste automatizado | Conferir a barra de abas no celular |

## Verificação desta entrega
- `npm run check` (typecheck + lint com a11y + Jest), 2026-10-16: sem erros, 62 testes passando em
  8 arquivos.
- Bundle iOS gerado sem erro, depois da correção da D16.
- Teste manual no iPhone (2026-10-16): troca de local funcionando; VoiceOver e texto no máximo
  conforme as linhas RNF02, RNF05 e RNF08.
- Estado vazio do Início (404) com orientação "Escolha outra em Trocar local": teste automatizado.

## Problemas conhecidos
- Avisos `act(...)` no console durante `__tests__/inicio.test.tsx`. Vêm de dentro do expo-router
  e não fazem nenhum teste falhar.
- Botão azul de engrenagem no iPhone: não faz parte do app (ver a mensagem do M2).
