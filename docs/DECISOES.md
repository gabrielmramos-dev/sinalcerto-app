# Decisões técnicas

Formato: decisão · alternativa descartada · motivo · limitações conhecidas.

## D1 — Mock a partir de respostas reais da API (2026-10-15)
- **Decisão:** a MockSource usa respostas reais salvas da API no ar.
- **Descartada:** gerar o mock a partir de predictions.csv do projeto Java.
- **Motivo:** o formato fica idêntico ao da API e não precisamos do zip.
- **Limitações:** o mock só cobre as consultas que salvarmos.

## D2 — Jitter só explicado (2026-10-15)
- **Decisão:** o glossário explica jitter e diz que a previsão não o inclui.
- **Descartada:** omitir o termo.
- **Motivo:** o RNF07 cita jitter, e a API não tem esse campo.
- **Limitações:** o usuário não vê nenhum valor de jitter.

## D3 — Só as 6 atividades da API (2026-10-15)
- **Decisão:** usar VIDEO_CALL, AUDIO_CALL, STREAMING, FILE_UPLOAD, WEB_BROWSING e MESSAGING.
- **Descartada:** mostrar "jogos online" com regra própria.
- **Motivo:** o enum ActivityType não tem jogos, e o app não reimplementa regra de adequação.
- **Limitações:** o RQ03 cita jogos online. Diferença levada à professora: aguardando resposta.

## D4 — Modelo padrão model-a, em variável de ambiente (2026-10-15)
- **Decisão:** `EXPO_PUBLIC_DEFAULT_MODEL_ID=model-a`.
- **Descartada:** escolha do modelo pelo usuário (fica como extra).
- **Motivo:** é o primeiro item de GET /models e o algoritmo mais simples de explicar (regressão
  linear).
- **Limitações:** os 4 modelos discordam entre si (ex.: 15:00Z → A e C dizem MODERATE, B e D
  dizem UNSTABLE). O usuário só vê o modelo A.

## D5 — Atividades: 6 chamadas em paralelo com cache (2026-10-15)
- **Decisão:** depois de escolher o horário, disparar as 6 chamadas a POST /activity/check em
  paralelo, com timeout curto, erro individual e cache por probe + horário + modelo.
- **Descartada:** uma chamada por toque; avaliar adequação no app.
- **Motivo:** mostra tudo de uma vez sem reimplementar regra.
- **Limitações:** 6 requisições por horário novo.

## D6 — Horário sempre ancorado na timeline (2026-10-15)
- **Decisão:** o app só consulta horários que existem na timeline. O horário do seletor é
  aproximado para o item mais próximo, e a tela mostra qual foi usado.
- **Descartada:** enviar o horário livre do seletor.
- **Motivo:** POST /activity/check arredonda sozinho e não devolve o horário usado (testado:
  15:30 → 15:00; 2026-10-15 → 23:00Z).
- **Limitações:** a granularidade é de 1 hora.

## D7 — Local por lista, com rótulo de região (2026-10-15)
- **Decisão:** o usuário escolhe uma das 10 probes de /locations. O rótulo ("Região de São Paulo
  (SP)") é nosso, derivado da coordenada. POST /activity/check recebe as coordenadas da probe,
  nunca as do aparelho.
- **Descartada:** GPS do aparelho; mostrar só o número da probe.
- **Motivo:** privacidade (sem dados pessoais) e linguagem simples.
- **Limitações:** a coordenada da probe é aproximada (aviso `locationPrivacy` da API). Não
  mostramos distância.

## D8 — expo-router com 3 abas (2026-10-15)
- **Decisão:** abas Início, Atividades e Detalhes; timeline no topo de Detalhes e prévia no Início.
- **Descartada:** react-navigation direto; aba própria para a timeline.
- **Motivo:** é o padrão atual do Expo, com rotas por arquivo e menos configuração.
- **Limitações:** nenhuma conhecida.

## D9 — Vocabulário do glossário (2026-10-15)
- **Decisão:** as categorias aparecem como Boa / Regular / Instável (GOOD / MODERATE / UNSTABLE),
  com equivalência a OK / Risco / Falha (Redes) registrada no glossário. O status por atividade
  usa outro vocabulário: "Deve funcionar" / "Pode ter problemas", a partir de `suitable`.
  Sempre texto + ícone + cor.
- **Descartada:** mostrar OK / Risco / Falha; reaproveitar as categorias de qualidade nas
  atividades.
- **Motivo:** termos mais claros para quem não é técnico. A pergunta "dá para fazer isto?" é
  diferente da pergunta "como está a conexão?".
- **Limitações:** a equivalência com Redes ainda vai ser confirmada pela equipe com a professora.

## D10 — Cabeçalho sem perfil e sem "?" (2026-10-15)
- **Decisão:** sem ícone de perfil e sem ícone de ajuda; as explicações ficam na aba Detalhes.
- **Descartada:** manter os dois ícones do protótipo.
- **Motivo:** não há conta nem dado pessoal; a ajuda repetiria a aba Detalhes.
- **Limitações:** nenhuma.

## D11 — Ícones de qualidade desenhados com react-native-svg (2026-10-15)
- **Decisão:** 3 formas próprias (círculo ✓, triângulo !, octógono ✕) em `StatusIcon`.
- **Descartada:** `@expo/vector-icons` (marcado para descontinuação no SDK 57) e outras fontes de
  ícones.
- **Motivo:** são só 3 ícones; o react-native-svg já vem no Expo Go. Forma diferente por
  categoria ajuda quem não distingue cores (RNF03).
- **Limitações:** as abas ficaram só com texto, sem ícone.

## D12 — Lint de acessibilidade com eslint-plugin-react-native-a11y (2026-10-15)
- **Decisão:** todas as 14 regras ligadas.
- **Descartada:** não ter lint de a11y.
- **Motivo:** pega controle sem nome, papel ou estado já no editor (RNF02).
- **Limitações:** o plugin declara suporte só até o ESLint 8; o `overrides` do package.json faz
  ele usar o ESLint 9 do Expo. A regra `has-accessibility-hint` foi desligada só no
  `StatusBadge`: é texto estático, e uma dica de toque enganaria o leitor de tela.

## D13 — Fuso de Brasília com deslocamento fixo de -3h (2026-10-15)
- **Decisão:** `formatBrasilia` subtrai 3 horas do UTC.
- **Descartada:** `Intl.DateTimeFormat` com `timeZone: 'America/Sao_Paulo'`.
- **Motivo:** o Brasil não tem horário de verão desde 2019. Assim o resultado não depende do
  suporte a fuso do motor JavaScript do celular, e o teste é determinístico.
- **Limitações:** se o horário de verão voltar, é preciso trocar a função.

## D14 — Mock de atividades em formato compacto (2026-10-15)
- **Decisão:** para as 1.440 respostas de atividade, salvar só `suitable`, `code` e `message`; o
  `forecast` é remontado a partir da timeline.
- **Descartada:** salvar as 1.440 respostas inteiras (≈1 MB, quase tudo repetido).
- **Motivo:** o script confere, nas 1.440, que o `forecast` é idêntico ao item da timeline, e
  aborta se não for. O mock final tem ≈200 KB.
- **Limitações:** só o model-a.

## D15 — Prévia das próximas horas no Início vai para o M4 (2026-10-16)
- **Decisão:** o Início do M2 não mostra a prévia das próximas horas; ela entra junto com a
  timeline, no M4.
- **Descartada:** fazer a prévia já no M2.
- **Motivo:** a prévia depende da timeline (RQ02, M4). Além disso, a previsão mostrada no Início
  é a última dos dados (20/08, 20:00), então ainda não haveria "próximas horas" para mostrar. Isso
  só faz sentido quando o usuário puder escolher um horário (M3/M4).
- **Limitações:** até o M4, o Início leva para a aba Detalhes pelo botão "Ver as próximas horas".

## D16 — Testes ficam em src/__tests__, nunca em src/app (2026-10-16)
- **Decisão:** testes de tela ficam em `src/__tests__/`; testes de módulo podem ficar ao lado do
  arquivo (ex.: `src/theme/contrast.test.ts`), **fora de `src/app/`**.
- **Descartada:** teste ao lado da tela em `src/app/`.
- **Motivo:** o expo-router transforma todo arquivo de `src/app/` em rota e o coloca no bundle.
  Um teste ali quebrou o app no iPhone (importava código que só existe no Node). O teste
  `src/__tests__/routes.test.ts` falha se isso voltar a acontecer.
- **Limitações:** nenhuma.

## Limitação de dados
Os dados cobrem só 2026-08-20 00:00–23:00 UTC (19/08 21:00 a 20/08 20:00 em Brasília). O app
nunca apresenta a previsão como sendo de "agora".
