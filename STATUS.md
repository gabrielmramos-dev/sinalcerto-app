# STATUS — verdade primeiro

Atualizado: 2026-10-15, fim do M1. Estados: **feito** (na tela e verificado) · **parcial** (parte
pronta; o que falta está dito) · **pendente** (não começou).
"Teste automatizado" = Jest (`npm test`). Nenhum teste manual com TalkBack ou VoiceOver foi feito
ainda.

| Req | Estado | Onde está | Como foi verificado | Falta |
|---|---|---|---|---|
| RQ01 | parcial | `components/StatusBadge.tsx` (QualityBadge), `data/MockSource.ts`; prévia temporária em `app/(tabs)/index.tsx` | Teste automatizado (badge com texto do glossário; mock devolve a previsão real) | Tela de verdade (M2) |
| RQ02 | pendente | Dados prontos: `getTimeline` no mock | Teste automatizado (24 horas, 20/08 UTC) | Tela (M4) |
| RQ03 | pendente | Dados prontos: `checkActivity` no mock, textos no glossário | Teste automatizado (resposta real reproduzida) | Tela (M3) |
| RQ04 | pendente | `data/time.ts` (`nearestItem`, D6) | Teste automatizado | Seletor e botões de período (M3) |
| RNF01 | pendente | — | — | Checklist NBR 17060 / WCAG no M7 |
| RNF02 | parcial | `AppButton` (role, nome, dica, estado), `StatusBadge` (nome com contexto); lint a11y ligado | Teste automatizado + lint | Teste manual com TalkBack/VoiceOver |
| RNF03 | parcial | `StatusBadge` + `StatusIcon`: texto + forma + cor; `AppButton` selecionado mostra "✓" e `selected` | Teste automatizado (texto e estado) | Aplicar em todas as telas |
| RNF04 | parcial | `theme/index.ts` (paleta), `theme/contrast.ts` | Teste automatizado: 18 pares da paleta + valores de referência da WCAG | Conferir cada tela no M7 |
| RNF05 | parcial | Componentes sem `numberOfLines` e sem `lineHeight` fixo | Só leitura do código | Teste no celular com fonte grande |
| RNF06 | pendente | Nenhum gesto usado até agora | — | Conferir em cada tela |
| RNF07 | parcial | `i18n/glossary.ts` (latência, perda, jitter, nota, confiança) | Teste automatizado (cobertura dos enums) | Mostrar na tela (M5) |
| RNF08 | pendente | — | — | Foco e anúncios (M2 em diante) |
| RNF09 | parcial | `AppButton` com `minHeight`/`minWidth` 48 | Teste automatizado | Conferir a barra de abas no celular |

## Verificação desta entrega
- `npm run check` (typecheck + lint com a11y + Jest): 52 testes passando em 5 arquivos.
- Bundle Android gerado sem erro (`npx expo export --platform android`).
- **Não verificado:** abrir no celular físico (ainda não sabemos qual é o aparelho de teste).
