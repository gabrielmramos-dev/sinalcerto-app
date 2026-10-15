# M0 — Telas, requisitos x protótipo, problemas e glossário

Fontes: documento de requisitos (docs/requisitos/), protótipo da squad (docs/design/), API no ar
testada em 2026-10-15 (respostas reais de todos os endpoints, inclusive /nearby, /compare e
POST /activity/check).

## Fatos da API que mudam o design

| Fato verificado | Consequência |
|---|---|
| Dados de um dia só: 2026-08-20 00:00Z a 23:00Z = **19/08 21:00 a 20/08 20:00 em Brasília** | Toda tela mostra data e hora reais da previsão. "Agora" não existe nos dados. |
| A previsão "mais próxima" hoje devolve 20/08 20:00 (a última) | RQ01 vira "previsão mais próxima de agora", com a data à mostra. |
| `POST /activity/check` arredonda qualquer horário para a previsão mais próxima (15:30 → 15:00; hoje → a última) e **não devolve o horário usado** | O app só envia horários que existem na timeline. O horário escolhido no seletor é aproximado no app para o item mais próximo da timeline, e a tela diz qual foi usado. |
| `suitable` muda por atividade, mas `recommendation.code` é o mesmo para todas no mesmo horário | O status por atividade vem de `suitable`; o conselho vem de `code`. As duas coisas são da API, e o app só traduz. |
| As coordenadas das 10 probes batem com 10 capitais (SP, RJ, BH, Brasília, Salvador, Recife, Fortaleza, Curitiba, Porto Alegre, Manaus) | Rótulo honesto: "Região de São Paulo (SP)", definido pela equipe a partir da coordenada (ver P5). |
| A API não tem jitter, não tem "atualizado em" nem "válido até" | O app não mostra esses dados. Jitter só é explicado, com aviso de que não está na previsão. |
| `modelConfidence` pode ser null | Só aparece em Detalhes, quando existe. |

## (1) Telas e fluxo

expo-router com 3 abas. O estado comum (local, modelo, horário escolhido) fica em um Context do
React (sem biblioteca nova).

```
                 ┌──────────────── abas ────────────────┐
  [Início] ◄──────────────► [Atividades] ◄──────────► [Detalhes]
     │                           │                        │
     ├─ "Trocar local" ─► Escolher local (tela modal, lista de /locations) ─► volta ao Início
     ├─ "Ver as próximas horas" ──────────────────────────► Detalhes (timeline)
     └─ "Ver o que dá para fazer" ─► Atividades
  Detalhes: tocar numa hora da timeline = escolher esse horário (vale para as 3 abas)
```

**Início (RQ01 + prévia do RQ02)**
1. Cabeçalho: nome do app (texto, sem logo quebrado).
2. Botão "Local: Região de São Paulo (SP) — Trocar".
3. Cartão da previsão: categoria (texto + ícone + cor), frase simples, conselho (do `code`),
   "Previsão para 20/08/2026, 20:00 (horário de Brasília)".
4. Aviso curto: "Estimativa de um modelo. Não é medição do seu celular."
5. Prévia: as próximas 3 horas da timeline em lista (hora + categoria em texto).
6. Botões: "Ver as próximas horas" e "Ver o que dá para fazer".

**Atividades (RQ03 + RQ04)**
1. "Para quando?": horário escolhido em texto + botão "Mudar horário" (seletor nativo) + botões
   "Manhã", "Tarde" e "Noite" (vão para a melhor hora daquele período na timeline). Os botões
   quebram linha; não há rolagem horizontal.
2. Depois de escolher o horário: as 6 consultas em paralelo e 6 cartões, cada um com nome da
   atividade, exemplos, status em texto + ícone + cor e conselho. Se uma consulta falhar, só
   aquele cartão mostra o erro e o botão "Tentar de novo".
3. Linha fixa: "Horário usado na previsão: 20/08, 15:00".

**Detalhes (RQ02 + RNF07)**
1. Topo: timeline completa (24 horas) em lista textual, com filtros por período (Madrugada,
   Manhã, Tarde, Noite) em botões. Cada linha tem hora, categoria e nota. Tocar uma linha
   escolhe aquele horário.
2. "Como ler os números": latência, perda de pacotes e jitter, em linguagem simples, junto dos
   valores do horário escolhido.
3. "De onde vem esta previsão": modelo usado, probe de referência e o aviso da própria API
   (`metadata.disclaimer`), em texto nosso.

**Escolher local (modal)**: lista de 10 botões, um por região, com o estado `selected` no atual.
Ao fechar, o foco volta para o botão "Trocar local" e o novo local é anunciado.

## (2) Requisitos x protótipo da squad

Legenda: ✅ atende · ⚠️ parcial · ❌ falta ou viola.

| Req | Onde aparece no protótipo | Situação | O que fazemos |
|---|---|---|---|
| RQ01 | Início, cartão "STATUS: CONEXÃO REGULAR" | ⚠️ inventa "Ao Vivo", "Válido até 16:30" e "Atualizado há 5 min"; não mostra a data da previsão | Cartão com `assessment.quality` + data/hora reais |
| RQ02 | Em lugar nenhum | ❌ | Timeline no topo de Detalhes + prévia no Início |
| RQ03 | Início "Como afeta" (3 grupos) e Atividades (grade com 6 tipos) | ⚠️ os 3 grupos do Início não são os da API; a tela de resultado não aparece; não há "jogos online" (o enum da API não tem) | 6 atividades da API com resultado de `suitable` + `code`; diferença registrada (D3) |
| RQ04 | Atividades, "Horários sugeridos" ("Hoje, 15:00") | ⚠️ "Hoje" não existe nos dados; não há endpoint de sugestão; rolagem horizontal | Seletor nativo + botões por período, derivados da timeline |
| RNF01 | — | ⚠️ não dá para julgar pela imagem | Checklist no M7 |
| RNF02 | Barra de abas | ⚠️ imagem "Logo" quebrada; não dá para ver nomes e estados | role/label/state/hint em todo controle |
| RNF03 | Selo de status (texto + ícone) ✅; seleção da atividade só por cor e ✓ ❌ | ⚠️ | Status sempre em texto; seleção com `accessibilityState.selected` + texto |
| RNF04 | Texto branco sobre foto, cinza pequeno, selos em verde-claro | ⚠️ suspeito | Paleta própria checada pela função de contraste (M1) |
| RNF05 | "WhatsApp, Telegram, ...", "YouTube, filmes e ...", "Navegação e Mensa" | ❌ truncamento | Texto quebra linha e nada tem altura fixa |
| RNF06 | Chips de horário com rolagem horizontal | ❌ | Botões que quebram linha |
| RNF07 | Detalhes explica em linguagem simples | ⚠️ diz "medimos" e "previsão exata"; não explica latência, perda ou jitter | Seção "Como ler os números" |
| RNF08 | Detalhes tem "Voltar" e "X" dentro de uma aba | ⚠️ navegação ambígua | Abas sem Voltar/X; foco e anúncio em cada mudança |
| RNF09 | Ícones "?", perfil e "X" parecem < 48 dp | ⚠️ | `minWidth`/`minHeight` 48 em todo tocável |

## (3) Problemas do protótipo e proposta

| # | Problema | Proposta |
|---|---|---|
| P1 | Texto cortado com reticências (RNF05) | Nada de `numberOfLines`; os cartões crescem em altura; teste com fonte a 200%. |
| P2 | Logo quebrado ("Logo") | Sem logo no M1: nome do app em texto, com `accessibilityRole="header"`. Se surgir um logo, ele é decorativo (`accessible={false}`), porque o nome já está escrito ao lado. |
| P3 | Ícone de perfil | **Remover.** Não há conta nem dado pessoal, e o requisito diz "sem coleta de dados pessoais". O "?" também sai, porque a aba Detalhes cumpre esse papel. |
| P4 | "Ao Vivo" / "Atualizado há 5 min" / "Válido até" | Trocar por "Previsão para 20/08/2026, 20:00 (horário de Brasília)". Quando não houver previsão para agora: "Não há previsão para agora. Mostrando a mais próxima." |
| P5 | "Vila Madalena, São Paulo" | "Região de São Paulo (SP)", em lista definida por nós (probeId → região) a partir das coordenadas da API, com nota em Detalhes: "Ponto de referência da rede, não a sua localização exata." Sem distância, porque não usamos GPS e ela não teria sentido. |
| P6 | "Previsão exata" / "Não medimos..." / "como medimos" | "Estimativa feita por um modelo a partir do histórico da rede. Pode errar. O app não mede a sua internet." |
| P7 | Horários sugeridos com rolagem horizontal; não há endpoint de sugestão | Os botões "Manhã/Tarde/Noite" vão para a hora de maior `qualityScore` daquele período na timeline. Isso é escolher o máximo de um valor da API, não regra nova de qualidade. Seletor nativo como alternativa. |
| P8 | Seleção da atividade só por cor e ícone | Com a resposta 6, todas as 6 aparecem juntas e não existe seleção. Se a seleção voltar, ela terá `accessibilityState={{selected}}` e o texto "Selecionada". |
| P9 | Branco sobre foto; cinza pequeno | Foto removida (decorativa e com texto por cima). Os cinzas só entram na paleta se passarem em 4,5:1 na função de contraste. |
| P10 | Textos iguais aos do protótipo da professora | "Planejar uma atividade" → **"Ver o que dá para fazer"**; "O que esta previsão representa" → **"De onde vem esta previsão"**; "Verificar Atividade Específica" → **"O que dá para fazer neste horário"**. |
| P11 | Rótulos por atividade ("Estável", "Pode travar", "Muito bom") | Vocabulário próprio, separado das categorias de qualidade (ver glossário). |
| P12 | Detalhes tem "Voltar" e "X" numa aba (achado novo) | Remover os dois; uma aba não tem para onde voltar. |
| P13 | Atividades no Início custariam 6 chamadas a cada abertura (achado novo) | O Início mostra só o conselho geral (`code`, que já vem do /forecasts, 0 chamadas extras) e o botão para Atividades. |

## Custo das atividades

6 chamadas por (probe, horário), em paralelo, com timeout curto (sugestão: 15 s, depois que o
servidor já respondeu ao /forecasts) e cache em memória por chave `probeId|predictionFor|modelId`.
Voltar a um horário já visto custa 0 chamadas. Medido com o servidor acordado: 0,3 a 0,7 s por
chamada.

## Glossário (proposta para src/i18n/glossary.ts, criado no M1)

**Categorias de qualidade** (único lugar do mapeamento):

| API | Rótulo | Frase | Ícone (forma diferente em cada) | Cor |
|---|---|---|---|---|
| GOOD | Boa | A internet deve funcionar sem travar. | círculo com ✓ | verde (a definir) |
| MODERATE | Regular | Pode ficar lenta ou dar pequenas pausas. | triângulo com ! | âmbar (a definir) |
| UNSTABLE | Instável | Pode travar ou cair com frequência. | octógono com ✕ | vermelho (a definir) |

Conflito com o documento: o RQ01 dá "Boa, Regular, Instável..." como exemplo, mas pede
"alinhar os termos com os conceitos de Redes" (OK / Risco / Falha), e o RNF03 cita "Ruim".
Proposta: mostrar Boa / Regular / Instável (mais claro para quem não é técnico) e registrar a
equivalência com Redes no glossário e na seção "Como ler os números" (Boa = OK, Regular = Risco,
Instável = Falha). **PENDENTE: confirmar.**

**Conselho (`recommendation.code`)**:

| code | Texto |
|---|---|
| NORMAL_USE | Pode usar a internet normalmente. |
| REDUCE_NETWORK_USAGE | Prefira atividades leves; vídeos e chamadas podem falhar. |
| PREPARE_OFFLINE | A conexão pode cair. Baixe antes o que for precisar. |

**Status por atividade (`suitable`)** — vocabulário separado, porque responde a outra pergunta
("dá para fazer isto?"):

| suitable | Rótulo | Ícone |
|---|---|---|
| true | Deve funcionar | ✓ |
| false | Pode ter problemas | ! |

**PENDENTE: confirmar** se fica separado, como proposto, ou se usa Boa/Regular/Instável.

**Atividades** (só as 6 da API):

| API | Nome | Exemplos |
|---|---|---|
| VIDEO_CALL | Chamada de vídeo | reuniões, aulas on-line |
| AUDIO_CALL | Chamada de voz | ligação pelo WhatsApp |
| STREAMING | Ver vídeos e séries | YouTube, filmes |
| FILE_UPLOAD | Enviar arquivos | fotos, documentos |
| WEB_BROWSING | Navegar na internet | sites, notícias |
| MESSAGING | Mandar mensagens | textos, áudios curtos |

**Métricas**:

| Termo | Campo | Explicação simples |
|---|---|---|
| Latência (tempo de resposta) | predictedAvgRttMs | Tempo que a informação leva para ir e voltar. Quanto menor, mais rápido tudo responde. Em milissegundos (ms): 1000 ms = 1 segundo. |
| Perda de pacotes | predictedPacketLossPct | Parte dos dados que se perde no caminho. 4% = cerca de 4 em cada 100 pedaços. Quanto menor, melhor; perda alta faz a chamada picotar. |
| Jitter (variação) | — | Quanto o tempo de resposta varia de um momento para outro. Atrapalha chamadas e jogos. **Esta previsão não inclui jitter.** |
| Nota estimada | qualityScore | Nota de 0 a 100 calculada pela API. Quanto maior, melhor. |
| Confiança do modelo | modelConfidence | Quanto o modelo confia nesta previsão (0 a 100%). Pode não estar disponível. |
