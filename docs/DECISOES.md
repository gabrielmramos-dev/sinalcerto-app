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

## D17 — Botões de período: Madrugada, Manhã, Tarde e Noite (2026-10-16)
- **Decisão:** 4 botões, com cortes de relógio no horário de Brasília: Madrugada 00–05, Manhã
  06–11, Tarde 12–17, Noite 18–23. Cada botão usa o item da timeline com o maior `qualityScore`
  do período (empate: o mais cedo) e mostra a data completa no rótulo (ex.: "Noite: 19 de
  agosto, 23:00").
- **Descartada:** "horários sugeridos" com rolagem horizontal (protótipo); um limiar de
  qualidade próprio do app.
- **Motivo:** os cortes são convenção de relógio, não regra de qualidade. Achar o maior valor de
  um campo que a API já calculou não reimplementa a classificação.
- **Limitações:** como os dados vão de 19/08 21:00 a 20/08 20:00, a Noite junta duas datas
  (19/08 21–23 e 20/08 18–20). A data no rótulo deixa isso claro.

## D18 — Seletor só de hora, lida como horário de Brasília (2026-10-16)
- **Decisão:** `@react-native-community/datetimepicker` 9.1.0 (incluído no Expo Go do SDK 57), só
  no modo hora. Android: diálogo nativo. iPhone: seletor de rolagem na tela, com os botões "Usar
  este horário" e "Cancelar". A hora é arredondada para a hora cheia e convertida no item da
  timeline (`itemAtClock`, D6). Se houver arredondamento, a tela avisa.
- **Descartada:** seletor de data e hora; seletor feito por nós.
- **Motivo:** a timeline cobre 24 horas seguidas, então cada hora do relógio aparece uma vez só
  e a hora sozinha já define o item. O seletor nativo já é acessível.
- **Limitações:** se a API passar a ter vários dias, vai ser preciso escolher a data também. A
  hora do relógio do aparelho é lida como horário de Brasília. Nos testes automatizados, o
  seletor nativo é trocado por um substituto simples (ele trava no Jest), definido em
  `jest.setup.ts` para todos os testes; o seletor de verdade é verificado à mão.

## D19 — Timeout de 15 s nas consultas de atividade (2026-10-16)
- **Decisão:** cada uma das 6 chamadas a POST /activity/check tem 15 s de limite. Passado o
  limite, só aquele cartão mostra erro e "Tentar de novo".
- **Descartada:** timeout longo (como o da primeira chamada) ou nenhum timeout.
- **Motivo:** as atividades só são consultadas depois que a timeline carregou. Ou seja, o
  servidor (plano gratuito do Render, que pode levar dezenas de segundos para acordar) já
  respondeu. A partir daí as respostas levam menos de 1 s (medido: 0,3 a 0,7 s).
- **Limitações:** o timeout generoso da primeira chamada (servidor acordando) fica para a
  ApiSource, no M6.

## D20 — Conselho mostrado uma vez quando é igual para as 6 atividades (2026-10-16)
- **Decisão:** se todas as respostas que chegaram trazem o mesmo `recommendation.code`, a tela
  mostra "Dica para este horário: ..." uma vez, acima dos cartões. Se algum dia vierem codes
  diferentes, cada cartão mostra o seu.
- **Descartada:** repetir o mesmo conselho nos 6 cartões (era o plano do M0).
- **Motivo:** nos dados reais (240 horários = 10 probes x 24 horas), o code foi igual para as 6
  atividades em 100% dos casos. Repetir a mesma frase 6 vezes aumenta a carga cognitiva e o
  tempo de leitura no VoiceOver (RNF07). A API não garante isso, por isso o app volta a mostrar
  o conselho por cartão quando houver diferença.
- **Limitações:** a dica só aparece depois que as 6 consultas terminam.

## D21 — Limite de 20 s por teste no Jest (2026-10-16)
- **Decisão:** `testTimeout: 20000` no `package.json` (o padrão do Jest é 5 s). Só vale para os
  testes automatizados, não para o app.
- **Descartada:** manter 5 s; aumentar o limite só num teste.
- **Motivo:** o primeiro teste de tela de cada arquivo carrega o expo-router, as telas e o mock, e
  leva 6 a 7 s no Windows. Com 5 s ele falhava por tempo, não por erro de lógica, e derrubava os
  testes seguintes do arquivo.
- **Limitações:** um teste que travar de verdade demora 20 s para falhar, em vez de 5 s.

## D22 — Prévia "Próximas horas" no Início (2026-10-22)
- **Decisão:** abaixo do cartão, a seção "Próximas horas" mostra até 3 horas da timeline depois da
  hora do cartão. Com os dados atuais, o cartão já é a última hora (20/08 20:00), e a seção diz:
  "Não há previsões depois de 20 de agosto, 20:00: os dados disponíveis terminam aí", com o botão
  "Ver todas as horas" (aba Detalhes).
- **Descartada:** mostrar a melhor hora de cada período (é outra informação, não uma prévia do
  que vem depois); esconder a seção quando não há horas seguintes.
- **Motivo:** honesto com os dados de hoje e sem retrabalho: quando a API tiver horas futuras, elas
  aparecem sozinhas.
- **Limitações:** com os dados atuais, a seção nunca mostra horas. O caso com horas é coberto só
  por teste automatizado (previsão simulada às 15:00 UTC).

## D23 — Faixas de Redes como contexto educativo, sem reclassificar (2026-10-27)
- **Decisão:** a seção "Como ler os números" (aba Detalhes) mostra, ao lado da latência e da
  perda, a faixa dos materiais de Redes (profa. Denise). Latência: excelente < 20 ms, bom 20–50,
  médio > 50–100, ruim > 100. Perda: estável 0–0,5%, risco > 0,5–2%, falha > 2%. Jitter: estável
  < 20 ms, risco 20–50, falha > 50, só como texto, porque a API não prevê jitter. As faixas e os
  limites ficam juntos no `glossary.ts` (`redesBands`), e `bandFor` (`data/metrics.ts`) acha a
  faixa.
- **Descartada:** usar as faixas para recalcular a categoria; colorir as faixas.
- **Motivo:** RNF07 pede explicação contextual dos termos, e o documento de requisitos pede
  alinhar os termos com Redes. A categoria (Boa/Regular/Instável) continua vindo da API: o app não
  reimplementa regra. As faixas aparecem só em texto, para não virar uma segunda "cor de status".
- **Limitações:** os materiais definem "< 20" e "21–50" (latência) e "0–0,5" e "0,5–2" (perda),
  com buracos e sobreposições nas bordas. Escolhemos: 20 ms já é "bom"; 0,5% ainda é "estável";
  50 e 100 ms e 2% ficam na faixa de baixo (escolha confirmada pela equipe em 2026-10-28). A faixa de Redes e a categoria da API podem divergir
  (ex.: SP às 20:00, perda 3,9% = "falha" em Redes, mas a API diz Regular). A tela mostra as duas
  e diz de onde vem cada uma.

## D24 — Valores da hora escolhida, nota explicada e confiança só quando a API manda (2026-10-27)
- **Decisão:** a seção usa a hora escolhida (D6); sem escolha, a previsão mais próxima, a mesma do
  Início, com um aviso. A nota é explicada como média calculada pela API, que pode ser maior numa
  hora Regular do que numa Boa porque a categoria olha a pior medida; a categoria é a informação
  principal (feedback do stakeholder na Sprint 5). A confiança do modelo aparece só quando
  `/forecasts` traz `modelConfidence` para aquela mesma hora.
- **Descartada:** esconder a nota; mostrar a confiança da previsão mais próxima em qualquer hora.
- **Motivo:** a nota já aparece nas linhas da timeline e pode confundir sem explicação. A timeline
  não traz confiança, e mostrar a de outra hora seria inventar dado.
- **Limitações:** com os dados atuais, a confiança só aparece para 20/08 20:00. Os valores aparecem
  no formato brasileiro ("73,2 ms") e são lidos por extenso ("73,2 milissegundos").

## D25 — Upgrade do Expo SDK 57 para o 58, forçado pelo Expo Go (2026-10-27)
- **Decisão:** atualizar o projeto para o SDK 58 (Expo 58.0.20, React Native 0.88.0, React
  19.3.0, expo-router 58, datetimepicker 9.2.1, react-native-svg 15.16.0, Jest 30.5, ESLint 9.39
  com eslint-config-expo 58), na branch `sdk-58`, antes do teste do M5.
- **Descartada:** continuar no SDK 57. O Expo Go do iPhone foi atualizado para o SDK 58 e só abre
  projetos SDK 58; as notas de versão dizem que o novo Expo Go aceita só o SDK 58. Sem o upgrade,
  não há como testar no aparelho.
- **Motivo:** o teste manual no iPhone é a verificação principal de acessibilidade do projeto.
- **O que mudou no código:** só `src/app/local.tsx` ganhou `contentInsetAdjustmentBehavior=
  "automatic"`. No iOS 26+, o cabeçalho do Stack do SDK 58 fica transparente, e sem isso a lista de
  regiões poderia passar por baixo dele (guia oficial de migração do expo-router). Os testes já
  usavam `await renderRouter` e a testing-library v14, que o SDK 58 exige.
- **Como foi feito:** `npx expo install expo@^58.0.0` e depois `npx expo install --fix`. O `--fix`
  falhou por conflito com uma cópia antiga de `expo-symbols` (dependência do expo-router 57 que
  virou opcional no 58), registrada no `package-lock.json`. Solução: pôr no `package.json` as
  versões que o `expo install --check` pedia e regenerar o `package-lock.json` (instalação limpa).
- **Limitações:** a primeira execução dos testes depois da instalação limpa demorou 146 s e 2 testes
  passaram do limite de 20 s (D21), por falta de cache do Jest. Na execução seguinte, os 101 testes
  passaram em 26 s. O plugin de acessibilidade do ESLint continua declarando só o ESLint 8 e segue
  funcionando pelo `overrides` (D12). O Android não foi testado.

## Limitação de dados
Os dados cobrem só 2026-08-20 00:00–23:00 UTC (19/08 21:00 a 20/08 20:00 em Brasília). O app
nunca apresenta a previsão como sendo de "agora".
