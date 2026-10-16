# PLAN.md — SinalCerto

> Conferido contra o documento de requisitos (docs/requisitos/) em 2026-10-15.
> Andamento: M0 a M3 aprovados (M2 e M3 em 2026-10-16) · estado de cada requisito
> em STATUS.md.
> PENDENTE: quem programa, prazo de entrega, celular de teste.
> Detalhes do M0: docs/M0-design.md. Decisões: docs/DECISOES.md.

## Priorização de requisitos

O documento pede que a equipe preencha esta tabela.

| Código | Prioridade | Funcionalidade |
|---|---|---|
| RQ01 | Alta | Condição prevista mais próxima de agora, em categorias |
| RQ04 | Alta | Escolha de horário ou período do dia |
| RQ02 | Alta | Previsão por hora (timeline) |
| RQ03 | Alta | Atividades adequadas ao horário escolhido |
| RNF01–09 | Alta | Acessibilidade, critério de aceite de todas as telas |
| EX01 | Baixa | Comparar previsões dos 4 modelos (/compare) |
| EX02 | Baixa | Trocar de modelo |
| EX03 | Baixa | Lembrar o local escolhido entre aberturas |

Restrição do documento fora do código: "Prototipação em Figma - navegável". O protótipo da
squad foi feito no Stitch. PENDENTE: confirmar se a squad entrega um Figma navegável à parte.

Estimativas em sessões de trabalho de ~2h, com uma pessoa programando. Revisar depois do M1.

| Marco | Entrega | Critérios de aceite | Estimativa |
|---|---|---|---|
| M0 | Plano, revisão do design, glossário | Lista de telas e fluxo aprovados; tabela RQ/RNF x protótipo; problemas do protótipo resolvidos; mapeamento GOOD/MODERATE/UNSTABLE aprovado; PLAN.md aprovado | 1 |
| M1 | Scaffold Expo + TS estrito, tema, componentes base, MockSource | `npx expo start` roda no celular; `tsc --noEmit` e lint (com a11y) limpos; função de contraste testada; todo par de cores do tema >= 4,5:1 (texto) ou >= 3:1 (gráfico/texto grande); botão base com área >= 48x48 e role/label/state testados; MockSource devolve dados no formato da API | 2-3 |
| M2 | Tela de previsão atual (RQ01) | Mostra categoria em texto + ícone + cor (RNF03); data e hora reais da previsão em America/Sao_Paulo; probe de referência indicada; estados carregando/erro/vazio; leitor de tela anuncia o resultado (RNF08); sem truncamento com fonte em 200% (RNF05) | 2 |
| M3 | Escolha de horário e atividade (RQ03, RQ04) | Seletor nativo de data/hora; horários sugeridos acessíveis por botão (sem arrastar, RNF06); atividade selecionada com estado acessível (`selected`), não só por cor; adequação vem da API (`suitable` + `recommendation.code`), não de regra no app | 2-3 |
| M4 | Períodos futuros (RQ02) | Timeline de /timeline em lista textual (não só gráfico); cada item com hora, categoria em texto e score; navegável em ordem pelo leitor de tela | 2 |
| M5 | Explicações das métricas (RNF07) | Latência e perda de pacotes explicadas em linguagem simples, junto de onde aparecem; textos vêm de `src/i18n/glossary.ts`; jitter explicado com o aviso de que não está na previsão (D2) | 1 |
| M6 | ApiSource, erros e carregamento | App funciona contra a API real; troca mock/API por `EXPO_PUBLIC_*`; timeout generoso + texto de "servidor acordando" + "Tentar de novo"; 404/422/400 com mensagens simples | 2 |
| M7 | Passada final | Teste manual com TalkBack (e VoiceOver, se houver iPhone) descrito no STATUS.md; Jest verde; README com como rodar no celular físico; STATUS.md e MOSTRA.md só com o que existe | 2 |
| Extras | Comparar modelos, trocar modelo | Só depois do M7 | — |

Total estimado: 14-16 sessões.

## Regras que valem para todos os marcos

- Um marco por vez; parar e esperar OK.
- Ao fim de cada marco: lint + typecheck + testes, 3 perguntas de revisão, atualizar STATUS.md,
  DECISOES.md e prompts-ia.md, dizer como testar no celular.
