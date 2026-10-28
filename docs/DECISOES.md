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
- **Atualização (2026-10-28, MD/E1):** limite elevado para 60 s. Com o SDK 58 (React Native 0.88,
  D25), a primeira execução depois de limpar o cache do Jest leva cerca de 140 s no arquivo que
  roda primeiro, porque ele compila o React Native e o router; com 20 s, o primeiro teste desse
  arquivo falhava por tempo e derrubava os seguintes. Isso acontecia na primeira execução de
  qualquer pessoa da equipe. Com o cache pronto, a suíte inteira roda em cerca de 30 s. Um teste
  travado de verdade agora demora 60 s para falhar.

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

## D26 — Linguagem para leigos; bastidores na tela "Sobre o SinalCerto" (2026-10-28)
- **Decisão:** fora da tela "Sobre", nenhum texto visível ou lido pelo leitor de tela usa API,
  modelo, probe, endpoint, dados salvos/mock, "faixas de Redes" ou OK/Risco/Falha. A origem vira
  "nossa previsão" ou "estimativa". O que o app não tem, ele não mostra: o jitter saiu da tela de
  valores. A seção de Detalhes passou a se chamar "O que esperar neste horário", e cada número vira
  consequência prática ("73 ms: as páginas podem demorar um pouco para abrir"; "3,9% (cerca de 4 em
  cada 100 pedaços de informação se perdem)" + "Chamadas e vídeos devem travar ou picotar."). As
  faixas de Redes (D23) continuam escolhendo a frase, mas não aparecem. Fora da lista de escolha, a
  região aparece só pelo nome ("Região escolhida: São Paulo (SP)"). A tela "Sobre o SinalCerto"
  (link discreto no fim do Início e de Detalhes) reúne, em linguagem técnica: origem dos dados
  (RIPE Atlas → modelos → Internet Quality API 0.2.0), modelo usado, período coberto, regiões
  (probes), categorias GOOD/MODERATE/UNSTABLE = Boa/Regular/Instável = OK/Risco/Falha, faixas de
  Redes (latência, perda e jitter, com o aviso de que a previsão não traz jitter), nota e
  confiança. Modelo e período são lidos da fonte de dados, não escritos fixos.
- **Descartada:** manter os termos técnicos com explicação ao lado (a versão do M5).
- **Motivo:** o app é uma previsão para leigos (RNF07 e o público do documento de requisitos); os
  termos técnicos falavam com o desenvolvedor. A equipe confirmou a tabela antes/depois em
  2026-10-28: latência sem decimal, perda com uma casa, "nota" continua, "latência" e "perda de
  pacotes" ficam entre parênteses nos subtítulos, porque são os termos que a disciplina de Redes
  procura.
- **Também:** os ~30 textos que estavam escritos direto nas telas foram para o `glossary.ts`
  (objeto `ui`), cumprindo a regra da D9. A faixa da latência passa a usar o valor arredondado, o
  mesmo da tela, para nunca mostrar "20 ms" com duas frases diferentes. Abaixo de 0,5% de perda, o
  texto diz "menos de 1 em cada 100". `AppButton` ganhou a variante `link` (papel "link", sublinhado,
  área de 48).
- **Como é garantido:** `src/__tests__/vocabulario.test.tsx` varre Início, Escolher local,
  Atividades e Detalhes (textos e rótulos de acessibilidade, inclusive anúncios) e falha se
  aparecer um termo proibido; ele também confere que pega o termo na tela Sobre.
- **Jitter:** a previsão não traz jitter, então ele não aparece nas telas principais (o que o app
  não tem, ele não mostra). A explicação do termo e a faixa de Redes ficam na tela "Sobre", junto
  do aviso de que a previsão não o inclui. O RNF07 continua atendido: ele pede explicação contextual
  quando o termo **é apresentado**, e o jitter só é apresentado na tela Sobre, onde está explicado.
- **Algoritmo:** na tela Sobre, o nome que a API manda aparece traduzido, com o original entre
  parênteses ("Regressão Linear (Linear Regression)"); a tradução fica no `glossary.ts`.
- **Limitações:** "latência" e "perda de pacotes" continuam visíveis entre parênteses. O guarda de
  vocabulário cobre as telas nos estados testados, não todas as combinações possíveis.

## D27 — API real como fonte padrão, com reserva automática (2026-10-28)
- **Decisão:** a fonte padrão é a Internet Quality API (`ApiSource`, URL em
  `EXPO_PUBLIC_API_BASE_URL`, padrão `https://internet-quality-api.onrender.com`). A
  `FallbackSource` tenta a API; se ela não puder responder (sem rede, tempo esgotado ou 5xx), usa a
  reserva (a `MockSource`, com respostas reais gravadas em 15/10/2026) e o app mostra "Sem conexão:
  mostrando a previsão guardada no app", com "Tentar de novo". Enquanto estiver sem conexão, usa só a
  reserva e não tenta a API a cada tela; só tenta de novo quando o usuário toca no botão.
  `EXPO_PUBLIC_DATA_SOURCE=mock` força só a reserva (testes e emergência); nesse modo o aviso diz
  "Mostrando a previsão guardada no app". O texto diz "guardada no app" (e não "última previsão
  salva") porque a reserva é a cópia que vem com o app, não a última consulta do usuário (ajuste da
  equipe em 2026-10-28). 404, 400 e 422 vêm da própria API e não usam a reserva: 404
  continua sendo o estado vazio, e 400/422 têm mensagens simples no glossário.
- **Tempo limite:** a primeira consulta espera até 60 s, com o texto "Carregando a previsão. Na
  primeira vez, pode levar até 1 minuto." (o plano gratuito do Render "dorme"; medido hoje: 32 s para
  acordar). Depois que a API respondeu uma vez, 15 s, o mesmo das atividades (D19).
- **Aviso:** fica no topo das 5 telas, em linguagem de usuário (sem API, mock ou servidor). O
  anúncio para o leitor de tela sai do `sourceStatus`, uma vez por mudança, mesmo com várias telas
  abertas: anuncia ao cair para a reserva e ao voltar dela; a primeira resposta boa não é anunciada,
  para não poluir a abertura do app. "Tentar de novo" muda uma versão, e todas as telas e as
  consultas de atividade recarregam.
- **Descartada:** tentar a API a cada chamada mesmo sem conexão (cada tela esperaria até 15 s);
  cair para a reserva também em 404 (esconderia uma resposta real da API); a reserva só por
  variável, sem troca automática.
- **Motivo:** o app precisa funcionar contra a API real e continuar útil na Mostra se a rede ou o
  servidor falharem.
- **Testes:** `ApiSource.test.ts` (fetch falso: URL, POST, 404/400/422/5xx, sem rede, tempo
  esgotado, tempo limite por chamada), `FallbackSource.test.ts` (API respondendo, fora do ar, sem
  conexão sem esperar a API, "Tentar de novo" voltando e não voltando, 404 sem reserva),
  `__tests__/aviso.test.tsx` (aviso nas 5 telas, mudança e anúncio, recarga, carregamento lento) e o
  guarda de vocabulário com "servidor". `ApiSource.live.test.ts` roda contra a API real só com
  `LIVE_API=1`; passou em 2026-10-28. No Jest, o `fetch` é um substituto do React Native, então esse
  teste usa um `fetch` mínimo com o `https` do Node.
- **Limitações:** o modo "sem conexão" só sai pelo botão (não detecta sozinho a volta da rede). A
  reserva só tem o model-a. Uma resposta 404 da reserva (região sem dados) não acontece com os dados
  atuais.

## D28 — Marco de design, E1: tema claro e escuro, fontes e ícones (2026-10-28)
- **Decisão:** tema seguindo o sistema (`userInterfaceStyle: automatic`, sem botão), com os mesmos
  nomes de tokens desde o M1 e valores claros e escuros (`palettes.light` / `palettes.dark`).
  Paleta nova a partir dos prints do Figma Make: fundo off-white, acento único verde-floresta,
  cores de categoria recalibradas. Todos os pares passam no teste de contraste **nos dois modos**.
  Títulos em DM Serif Display e texto em Manrope (`expo-font` + `@expo-google-fonts`), com a tela
  de abertura segurada até as fontes carregarem. Ícones Lucide (`lucide-react-native`) nas abas,
  com o texto embaixo. Cantos por papel (8/12/16/pílula) e elevação com sombra do iOS e
  `elevation` do Android juntas. Proposta completa, com os riscos, em `docs/MOBILE-DESIGN.md`.
- **Skills usadas:** `mobile-design-review` (revisão inicial: nota B, linha de base em
  `design-baseline.json`; mudou a decisão ao apontar a falta do modo escuro e do fechar no modal);
  `frontend-design` (crítica dos prints: tirou os rótulos em maiúsculas, o ponto no meio e o cartão
  escuro da nota, e escolheu o relógio como único elemento de destaque); `mobile-design-system`
  (proposta SAFE/RISK e tokens; mudou a decisão ao exigir os dois modos desde já e ao registrar o
  fundo creme como risco de "cara de IA", compensado pelo acento verde).
- **Descartada:** tema só claro; botão de modo escuro; fontes do sistema; ícones desenhados à mão;
  `expo-linear-gradient` (o gradiente da E2 usa o `react-native-svg`, que já existe).
- **Motivo:** fidelidade à referência visual aprovada, sem perder acessibilidade.
- **Como:** `createThemedStyles` monta os estilos dos dois modos uma vez; `useColors` dá as cores
  do modo atual. As 14 telas e componentes passaram de cores fixas para o tema.
- **Ícones um a um:** importados por arquivo (`lucide-react-native/icons/house`). O Metro não
  descarta código não usado: o índice da biblioteca levaria todos os ~1.900 ícones para o app e
  deixava o primeiro teste de cada arquivo lento demais (passava do limite de 20 s).
- **Limitações:** a DM Serif Display só tem um peso. O modo escuro ainda não foi visto no aparelho.
  O cabeçalho nativo das 3 abas só é escondido nas etapas de cada tela (E2 a E4).

## Limitação de dados
Os dados cobrem só 2026-08-20 00:00–23:00 UTC (19/08 21:00 a 20/08 20:00 em Brasília). O app
nunca apresenta a previsão como sendo de "agora".
