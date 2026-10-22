# PLAN.md â€” SinalCerto

> Conferido contra o documento de requisitos (docs/requisitos/) em 2026-10-15.
> Andamento: M0 a M4 aprovados (M4 em 2026-10-22) Â· estado de cada requisito
> em STATUS.md.
> PENDENTE: quem programa, prazo de entrega, celular de teste.
> Detalhes do M0: docs/M0-design.md. DecisÃµes: docs/DECISOES.md.

## PriorizaÃ§Ã£o de requisitos

O documento pede que a equipe preencha esta tabela.

| CÃ³digo | Prioridade | Funcionalidade |
|---|---|---|
| RQ01 | Alta | CondiÃ§Ã£o prevista mais prÃ³xima de agora, em categorias |
| RQ04 | Alta | Escolha de horÃ¡rio ou perÃ­odo do dia |
| RQ02 | Alta | PrevisÃ£o por hora (timeline) |
| RQ03 | Alta | Atividades adequadas ao horÃ¡rio escolhido |
| RNF01â€“09 | Alta | Acessibilidade, critÃ©rio de aceite de todas as telas |
| EX01 | Baixa | Comparar previsÃµes dos 4 modelos (/compare) |
| EX02 | Baixa | Trocar de modelo |
| EX03 | Baixa | Lembrar o local escolhido entre aberturas |

RestriÃ§Ã£o do documento fora do cÃ³digo: "PrototipaÃ§Ã£o em Figma - navegÃ¡vel". O protÃ³tipo da
squad foi feito no Stitch. PENDENTE: confirmar se a squad entrega um Figma navegÃ¡vel Ã  parte.

Estimativas em sessÃµes de trabalho de ~2h, com uma pessoa programando. Revisar depois do M1.

| Marco | Entrega | CritÃ©rios de aceite | Estimativa |
|---|---|---|---|
| M0 | Plano, revisÃ£o do design, glossÃ¡rio | Lista de telas e fluxo aprovados; tabela RQ/RNF x protÃ³tipo; problemas do protÃ³tipo resolvidos; mapeamento GOOD/MODERATE/UNSTABLE aprovado; PLAN.md aprovado | 1 |
| M1 | Scaffold Expo + TS estrito, tema, componentes base, MockSource | `npx expo start` roda no celular; `tsc --noEmit` e lint (com a11y) limpos; funÃ§Ã£o de contraste testada; todo par de cores do tema >= 4,5:1 (texto) ou >= 3:1 (grÃ¡fico/texto grande); botÃ£o base com Ã¡rea >= 48x48 e role/label/state testados; MockSource devolve dados no formato da API | 2-3 |
| M2 | Tela de previsÃ£o atual (RQ01) | Mostra categoria em texto + Ã­cone + cor (RNF03); data e hora reais da previsÃ£o em America/Sao_Paulo; probe de referÃªncia indicada; estados carregando/erro/vazio; leitor de tela anuncia o resultado (RNF08); sem truncamento com fonte em 200% (RNF05) | 2 |
| M3 | Escolha de horÃ¡rio e atividade (RQ03, RQ04) | Seletor nativo de data/hora; horÃ¡rios sugeridos acessÃ­veis por botÃ£o (sem arrastar, RNF06); atividade selecionada com estado acessÃ­vel (`selected`), nÃ£o sÃ³ por cor; adequaÃ§Ã£o vem da API (`suitable` + `recommendation.code`), nÃ£o de regra no app | 2-3 |
| M4 | PerÃ­odos futuros (RQ02) | Timeline de /timeline em lista textual (nÃ£o sÃ³ grÃ¡fico); cada item com hora, categoria em texto e score; navegÃ¡vel em ordem pelo leitor de tela | 2 |
| M5 | ExplicaÃ§Ãµes das mÃ©tricas (RNF07) | LatÃªncia e perda de pacotes explicadas em linguagem simples, junto de onde aparecem; textos vÃªm de `src/i18n/glossary.ts`; jitter explicado com o aviso de que nÃ£o estÃ¡ na previsÃ£o (D2) | 1 |
| M6 | ApiSource, erros e carregamento | App funciona contra a API real; troca mock/API por `EXPO_PUBLIC_*`; timeout generoso + texto de "servidor acordando" + "Tentar de novo"; 404/422/400 com mensagens simples | 2 |
| M7 | Passada final | Teste manual com TalkBack (e VoiceOver, se houver iPhone) descrito no STATUS.md; Jest verde; README com como rodar no celular fÃ­sico; STATUS.md e MOSTRA.md sÃ³ com o que existe | 2 |
| Extras | Comparar modelos, trocar modelo | SÃ³ depois do M7 | â€” |

Total estimado: 14-16 sessÃµes.

## Regras que valem para todos os marcos

- Um marco por vez; parar e esperar OK.
- Ao fim de cada marco: lint + typecheck + testes, 3 perguntas de revisÃ£o, atualizar STATUS.md,
  DECISOES.md e prompts-ia.md, dizer como testar no celular.
