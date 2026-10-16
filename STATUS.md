# STATUS — verdade primeiro

Atualizado: 2026-10-16, M3 aprovado. Estados: **feito** (na tela e verificado) ·
**parcial** (parte pronta; o que falta está dito) · **pendente** (não começou).
"Teste automatizado" = Jest (`npm test`). "Teste manual" = descrito na linha.
Aparelho de teste até agora: só iPhone. **Nada foi testado em Android.**

| Req | Estado | Onde está | Como foi verificado | Falta |
|---|---|---|---|---|
| RQ01 | feito | `app/(tabs)/index.tsx` (cartão "Previsão mais próxima"), `components/StatusBadge.tsx` | Teste automatizado (`__tests__/inicio.test.tsx`: categoria, data real, aviso de dado antigo, anúncio). Teste manual no iPhone (2026-10-16): troca de local funciona e o Início volta com a região escolhida | Mostrar o horário escolhido pelo usuário (M4) |
| RQ02 | pendente | Dados prontos: `getTimeline` no mock | Teste automatizado | Tela (M4) e prévia no Início (D15) |
| RQ03 | feito | `app/(tabs)/atividades.tsx`, `components/ActivityCard.tsx`, `hooks/useActivityChecks.ts` (D5, D19, D20) | Teste automatizado: 6 cartões com `suitable` e `code` da API, erro e "Tentar de novo" por cartão, timeout de 15 s, cache, descarte de resposta atrasada, anúncio do resumo. **Teste manual no iPhone (2026-10-16):** 6 cartões com status em texto, ícone e cor | TalkBack (Android) |
| RQ04 | parcial | `components/TimeChooser.tsx`, `data/periods.ts` (D17), `data/time.ts` (`itemAtClock`, D6, D18) | Teste automatizado: 4 períodos com data completa e maior nota; 15:20 → 15:00 com aviso; só `predictionFor` da timeline enviado (o seletor nativo é um substituto nos testes). **Teste manual no iPhone (2026-10-16):** botões de período com ✓; seletor nativo de rolagem: 15:20 virou 15:00, com aviso | **Seletor do Android (diálogo `DateTimePickerAndroid`): não testado no aparelho nem nos testes automatizados** |
| RNF01 | pendente | — | — | Checklist NBR 17060 / WCAG no M7 |
| RNF02 | parcial | `AppButton` (role, nome, dica, estado); cartões lidos como um item; "Tentar de novo: <atividade>"; períodos e locais com `selected`; lint a11y | Teste automatizado + lint. **VoiceOver no iPhone (2026-10-16):** Início (cartão como frase única com a data, "Trocar local", 3 abas com nome, região selecionada anunciada); Atividades (cartões como frase única, "selecionado" nos períodos, seletor ajustável) | TalkBack (Android); telas do M4 em diante |
| RNF03 | parcial | Texto + forma + cor em `StatusBadge` (qualidade e atividades); seleção com "✓" e `selected` | Teste automatizado. Teste manual no iPhone: status das atividades com texto, ícone e cor | Telas do M4 em diante |
| RNF04 | parcial | `theme/index.ts`, `theme/contrast.ts` | Teste automatizado: 18 pares da paleta | Conferir cada tela no M7 |
| RNF05 | parcial | Sem `numberOfLines` e sem `lineHeight` fixo; botões de período quebram linha; telas com rolagem | **Texto no máximo no iPhone (2026-10-16):** Início, Escolher local e Atividades (já com seletor, períodos e 6 cartões) sem cortes nem sobreposições | Detalhes (M4) e Android |
| RNF06 | parcial | Só toques simples em botões; o seletor de rolagem do iOS tem os botões "Usar este horário" e "Cancelar" | Leitura do código. Teste manual no iPhone: seletor ajustável pelo VoiceOver | Telas do M4 em diante |
| RNF07 | parcial | `i18n/glossary.ts` | Teste automatizado | Mostrar as métricas na tela (M5) |
| RNF08 | parcial | Anúncio da previsão (Início) e do resumo das atividades (Atividades) | Teste automatizado (o anúncio é chamado com o texto certo). **VoiceOver no iPhone (2026-10-16):** novo local anunciado ao voltar; resumo das atividades anunciado | TalkBack (Android); telas do M4 em diante |
| RNF09 | parcial | `AppButton` com mínimo de 48 | Teste automatizado | Conferir a barra de abas no celular |

## Verificação desta entrega (M3)
- `npm run check` (typecheck + lint com a11y + Jest), 2026-10-16: sem erros, 82 testes passando em 11 arquivos.
- Teste manual no iPhone (2026-10-16): períodos com ✓; 15:20 → 15:00 com aviso; 6 cartões com
  status em texto, ícone e cor; VoiceOver (cartões como frase única, "selecionado" nos períodos,
  seletor ajustável, resumo anunciado); texto no máximo sem cortes.
- **Não testado no aparelho:** nada no Android, em especial o diálogo nativo de hora
  (`DateTimePickerAndroid.open`), que também não é exercitado pelos testes automatizados.

## Problemas conhecidos
- Avisos `act(...)` no console durante os testes de tela. Vêm de dentro do expo-router e não
  fazem nenhum teste falhar.
- Botão azul de engrenagem no iPhone: não faz parte do app (ver a mensagem do M2).
- Ao voltar a um horário cuja consulta falhou enquanto ele estava na tela, o erro antigo aparece
  até a nova tentativa terminar (`useActivityChecks.ts`).
