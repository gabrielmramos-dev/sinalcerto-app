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

## D29 — Marco de design, E2: novo Início (2026-10-28)
- **Decisão:** cabeçalho nativo da aba Início escondido; no topo, "SinalCerto" em serifa, marcado
  como cabeçalho, respeitando a área segura. Ordem da tela e da leitura: aviso de conexão, título,
  região + "Trocar local", cartão de topo, "Melhor momento do dia", seção "Previsão de 19 e 20 de
  agosto" com o relógio de 24 horas e o resumo, próximas horas (D22), aviso de estimativa e botões.
  - **Cartão de topo:** o único gradiente do app (`react-native-svg`), na cor da categoria; categoria
    em texto (serifa grande) + forma (`StatusIcon`) + cor + barras de sinal (4, 2 ou 1 cheias). Todo
    texto do cartão usa `text`: ele passa 4,5:1 nos dois extremos de cada gradiente, nos dois modos.
    O cinza secundário ficaria abaixo de 4,5:1 no extremo escuro e não é usado ali.
  - **Melhor momento:** a hora de maior `qualityScore` da previsão (empate: a mais cedo) e "Evite"
    com as horas Instáveis seguidas, calculadas dos dados (`data/forecastSummary.ts`). Hoje, em SP:
    "19 de agosto, 23:00: Boa" e "Evite das 15h às 18h (Instável)". A janela diz o fim da última
    hora ("às 18h" cobre a hora das 17h); o planejador da E3 usa a mesma regra.
  - **Relógio de 24 horas** (elemento assinatura): uma fatia por hora no relógio de Brasília, 00h
    no topo; liso = Boa, pontilhado = Regular, quadriculado = Instável, com legenda em texto; ponto e
    centro na hora do cartão. Título com a data real ("Previsão de 19 e 20 de agosto", de `dayRange`),
    em vez de "Próximas 24 horas". Resumo em texto com as contagens reais (8 boas, 13 regulares, 3
    instáveis em SP).
- **Leitor de tela:** cartão, melhor momento e relógio são grupos lidos como uma frase cada; o
  relógio, as barras, os ícones e as amostras da legenda ficam escondidos (`accessible={false}`) e
  a informação está no texto do grupo. Teste automatizado confere a ordem de leitura e que não há
  imagem solta.
- **Skills usadas:** `mobile-redesign-app` (etapa da tela Início do plano; manteve conteúdo e
  navegação e só trocou o visual); `frontend-design` (sem rótulo em maiúsculas acima do título, sem
  ponto no meio em "19 de agosto, 23:00: Boa", o relógio como única peça de destaque);
  `mobile-design-system` (tokens do gradiente com os pares no teste de contraste, sombra do cartão
  com `elevation`); `mobile-taste` (um gradiente só; sem seta no cartão do melhor momento, porque ele
  não leva a outra tela).
- **Descartada:** dados dos prints ("06:00", "9 horas boas", "Próximas 24 horas"); seta ">" no cartão
  do melhor momento; texto da categoria e da hora dentro do relógio como texto escalável.
- **Limitações:** o centro e os rótulos 00h/06h/12h/18h do relógio são desenho (não crescem com o
  texto do sistema); a mesma informação está no resumo em texto, que cresce. O relógio tem no
  máximo 300 pontos de largura.

## D30 — Marco de design, E2: ajustes depois do teste no iPhone (2026-10-28)
- **Relógio "deslocado em uma hora":** os dados estavam certos (a API e a reserva dão 23:00 do dia
  19 = Boa, nota 92), mas cada fatia ficava **centrada** no ângulo da hora e ia de meia hora antes
  a meia hora depois. O verde começava antes do "00h" e terminava depois do "06h", o que parece um
  deslocamento. **Decisão:** como num relógio de verdade, a fatia da hora h **começa** no ângulo de
  h:00 e termina em h+1 (`DayClock.slice`); o marcador fica no meio da fatia. Assim a fatia logo à
  esquerda do "00h" é a das 23h, e o verde vai do "23h" ao "07h", a mesma regra de fim das janelas
  ("das 23h às 7h", D29/E3).
- **Teste novo** (`components/DayClock.test.tsx`): lê os caminhos SVG que o componente desenha (não
  uma cópia da conta) e confere que cada uma das 24 fatias começa no ângulo da sua hora de Brasília
  e tem a categoria dessa hora; que a fatia à esquerda do 00h (23h) é Boa e a das 22h é Regular; e
  que o marcador de 3 horas diferentes cai dentro da fatia certa. Esse teste falharia no desenho
  anterior.
- **"Próximas horas" sai do Início** ("menos é mais"): o cartão diz a hora da previsão e o relógio
  mostra o dia inteiro. Substitui a D22 no Início; a lista de todas as horas continua em Detalhes,
  pelo botão "Ver todas as horas". Os 4 textos `nextHours*` saíram do glossário.
- **Faixa na área segura do topo:** sem o cabeçalho nativo, o conteúdo rolava por baixo da barra de
  status (o "Evite das 15h às 18h" aparecia em cima do relógio do iPhone). Uma faixa na cor
  `background` do tema, com a altura da área segura, fica por cima da rolagem, nos dois modos. O
  conteúdo continua começando abaixo dela.
- **Skills usadas:** `mobile-redesign-app` (ajuste dentro da etapa, sem mexer em navegação);
  `frontend-design` ("menos é mais": tirar a seção repetida em vez de reestilizá-la); `mobile-taste`
  (área segura: nada de conteúdo sob a barra de status com o cabeçalho escondido).

## D31 — Marco de design, E3: Atividades com o planejador (2026-10-28)
- **Cabeçalho:** o nativo fica escondido; "Atividades" em serifa, marcado como cabeçalho, e a região
  logo abaixo. A área segura e a faixa da D30 viraram um componente só (`TabScreen`), usado no
  Início e em Atividades (e na E4, em Detalhes).
- **Planejador (sem tela nova):** o relógio fica no topo da aba, com o título "Melhor horário para
  cada atividade". Tocar num cartão de atividade escolhe essa atividade:
  - **Destaque:** o relógio destaca só as horas em que ela deve funcionar (`suitable` da API). Elas
    ficam com o padrão da categoria e um contorno. As outras ficam **apagadas**, com listras finas
    neutras e opacidade de 55%, e a legenda ganha "Não deve funcionar". O destaque não depende só da
    cor (RNF03).
  - **Frase:** segue a regra de janelas do relógio (D30), "Chamada de vídeo: melhor das 23h às 7h".
    Ela aparece embaixo do relógio, é o nome do grupo do relógio para o leitor de tela, aparece no
    cartão escolhido e é anunciada quando as 24 horas chegam (RNF08). Casos sem janela têm frase
    própria: todas as horas ("Mandar mensagens: deve funcionar em todas as horas da previsão") e
    nenhuma hora.
  - **Seleção:** o cartão escolhido mostra ✓ e borda no acento, e o VoiceOver lê "selecionado"
    (`accessibilityState.selected`). Os cartões agora são botões com dica.
  - **Sem horário escolhido:** os cartões aparecem sem status, só com o nome, e servem ao
    planejador. O horário continua sendo escolhido logo abaixo ("Para quando?"), como antes.
- **Custo, como no plano:** `usePlanner` faz 24 chamadas por atividade e região, no máximo 6 ao
  mesmo tempo, só quando a pessoa toca na atividade, e usa o mesmo cache da D5. A hora já consultada
  pelos cartões não sai de novo, e voltar a uma atividade já vista não consulta nada. Trocar de
  atividade para a fila antiga, e as respostas atrasadas entram no cache sem mexer na tela. Se uma
  hora falha, aparece o aviso com "Tentar de novo: horas de <atividade>", que consulta só o que
  faltou.
- **Carregamento:** um esboço do layout (anel do relógio e 3 cartões, em `primarySoft`, sem
  animação) aparece no lugar do indicador giratório, junto do texto "Carregando os horários…".
  O esboço é escondido do leitor de tela.
- **Cartões:** novo visual, com ícone Lucide por atividade num quadradinho `primarySoft`,
  superfície com sombra (`elevation.card`) e borda de 2 sempre presente, que muda só de cor ao
  selecionar, para nada pular de lugar. O par `primary` × `primarySoft` (ícone, 3:1) entrou no teste
  de contraste.
- **Skills usadas:** `mobile-redesign-app` (etapa 3 do plano, sem tela nova e sem mexer na
  navegação); `frontend-design` (o relógio continua sendo a única peça de destaque, e o destaque
  vem do contorno e do apagado, não de mais cor; frase curta no padrão das janelas);
  `mobile-design-system` (padrão novo `dim` e par de contraste do quadradinho do ícone);
  `mobile-taste` (esboço do layout no carregamento em vez do indicador; seleção com ✓ e estado
  acessível; borda fixa para evitar salto de layout; sem animação, porque o movimento é só de
  resposta ao toque).
- **Descartada:** uma lista separada de atividades só para o planejador (repetiria os 6 cartões) e a
  rolagem automática até o relógio ao tocar num cartão. A frase aparece no próprio cartão e é
  anunciada.

## D32 — Marco de design, E4 (Detalhes): pausada (2026-10-28)
A E4 foi interrompida antes do commit para a revisão da D33. O trabalho ficou guardado em
`git stash` ("E4 pausada") e será retomado com a faixa do dia, depois do teste do Início e de
Atividades.

## D33 — Faixa do dia no lugar do relógio; uma pergunta por tela (2026-10-28)
Bases: `docs/fundamentacao-design.md`, itens 1, 2 e 4.
- **Troca:** o relógio de 24 horas (D29–D31) sai, e entra a **faixa do dia**, com 24 barras
  verticais em ordem de tempo, uma por hora. É o mesmo componente (`DayStrip`) em Início,
  Atividades e, depois, Detalhes.
  - **Cleveland e McGill (1984):** posição numa escala comum e comprimento são lidos com mais
    precisão que ângulo, e a cor sozinha é a codificação menos precisa.
  - **Waldner et al. (2019):** com leigos e dados de 24 horas, o gráfico de barras linear foi o mais
    preciso e o mais rápido em todas as tarefas, e o relógio não melhorou a compreensão do padrão
    diário.
- **Codificação:**
  - **Altura:** a nota da previsão, com o eixo começando em 0.
  - **Categoria:** cor e padrão (liso = Boa, pontilhado = Regular, quadriculado = Instável), como antes.
  - **Rótulos:** a cada 3 horas, com a data na virada do dia.
  - **Ordem:** a do tempo, de 19/08 21h a 20/08 20h, para a janela "das 23h às 7h" ficar inteira.
- **Troca consciente (FINDING-003):** com a altura pela nota, a nota fica mais visível na faixa,
  embora a D24 diga que a categoria é a informação principal. A categoria continua vindo da API, sem
  reclassificação, e é a cor, o padrão e o texto do resumo. A nota aparece só como altura.
- **Escolha da hora:** a hora escolhida tem contorno e o horário escrito acima da barra. A faixa
  inteira é uma área de toque só, e o toque escolhe a barra mais próxima (cada barra tem uns 14 pt,
  menos que os 48 dp do RNF09). Os botões "Hora anterior" e "Próxima hora" (48 dp) fazem o ajuste
  fino. A escolha vale para o app inteiro, inclusive no Início.
- **VoiceOver:** a faixa é ajustável (deslizar para cima ou para baixo muda a hora) e lê "20 de
  agosto, 20:00: Regular". O resumo em texto fica logo abaixo.
- **Planejador (D31):** continua com as horas acesas e as apagadas com listras e opacidade. A frase
  fica logo abaixo da faixa, uma vez só.
- **Uma pergunta por tela** (Nielsen Norman Group: hierarquia visual e revelação progressiva):
  - **Início, "como está e quando é melhor?":**
    - região curta ("Curitiba (PR)") com o botão compacto "Trocar";
    - cartão de topo com a categoria, o ícone, as barras de sinal e uma frase, mais a linha
      "Última previsão disponível: 20 de agosto, 20:00";
    - saem "Previsão mais próxima", o conselho, a data longa e o aviso "Ainda não temos previsão
      para agora…";
    - o melhor momento fica só no cartão dele, e o resumo da faixa só tem a contagem.
  - **Atividades, "quando posso fazer isto?":** chips de atividade no topo, a faixa com o
    planejador, "Para quando?" e os cartões de status em grade de 2 colunas (1 coluna com
    `fontScale` ≥ 1,3). Os cartões voltam a ser só informação.
  - **Números:** concentrados em Detalhes.

## D34 — Início e Atividades alinhados ao wireframe v2 (2026-10-28)
Referência: `docs/design/wireframe-v2.md`. Substitui os pedidos de ajuste anteriores. Bases em
`docs/fundamentacao-design.md`, mais as fontes indicadas pela equipe para esta revisão:
- **Lei de Jakob:** seguir o padrão dos apps de previsão do tempo.
- **NN/g, Horizontal Scrolling:** a faixa inteira visível, sem rolagem lateral.
- **NN/g, accordions no mobile:** a linha tocada abre os detalhes, uma por vez.
- **Sivle / yr.no:** mostrar ao leigo a consequência.
- **Cleveland & McGill:** barras de altura igual.

Skills: `mobile-taste` (hierarquia, alvos de toque, uma resposta por tela) e `mobile-design-review`
(revisão dos prints e das trocas abaixo).

**Início ("como está a internet?"):** só mudaram o layout e o texto; a lógica já tinha sido aprovada no
iPhone.
- **Topo:** sem o título grande "SinalCerto". "Previsão atualizada" já era uma linha pequena e
  discreta e ficou como estava. A primeira linha é "São Paulo (SP)" com "Trocar".
- **Ordem:** cartão, faixa, Melhor/Evite, botão e linha do aviso.
- **Cartão:** a data e a hora em cima ("20 de agosto, 20:00"), depois o ícone e a categoria grande,
  depois a frase. Segue sempre a hora selecionada na faixa.
- **Faixa:** saíram o título "Previsão de 19 e 20 de agosto" e a frase de contagem, que vai para
  Detalhes. Acima das barras, "19 e 20 de agosto" à esquerda (secundário) e "20:00 · Regular" à
  direita (negrito, Text fora do SVG, que cresce com a fonte). "Hora anterior" e "Próxima hora"
  continuam (RNF06), com a legenda compacta.
- **Melhor/Evite:** cartão simples, sem sol e sem título, em duas linhas com divisória: "Melhor"
  (verde) "das 23h às 7h · Boa" e "Evite" (vermelho) "das 15h às 18h · Instável". Os dois tons passam
  4,5:1 sobre a superfície nos dois modos (pares novos no teste de contraste).
- **Botão e aviso:** botão "O que dá para fazer?" e a linha "É uma estimativa e pode errar. Saiba
  mais", que leva à seção "É uma estimativa" da tela Sobre.

**Atividades ("o que você quer fazer?"):**
- **Topo:** título "O que você quer fazer?" e a linha "Toque numa atividade para ver os melhores
  horários.".
- **O que saiu:** a faixa, os chips, "Para quando?", "Mudar horário", os períodos, a grade de cartões,
  a "Dica para este horário" e o aviso longo. Os componentes `TimeChooser`, `ActivityCard` e
  `ActivityChips` foram apagados.
- **Linhas:** uma coluna, uma linha por atividade (alvo ≥ 48), com o ícone, o nome e, à direita, o
  status na hora selecionada, com ícone e texto: "Funciona", "Pode falhar" ou "Não deve funcionar".
  O nome falado é "Chamada de vídeo, às 20:00: pode falhar".
- **Status, só com campos da API:** `suitable` → "Funciona". Não adequada numa hora Instável
  (`forecast.quality`) → "Não deve funcionar". Nos outros casos → "Pode falhar".
- **Linha aberta:** tocar abre a linha (uma por vez, borda verde, `accessibilityState.expanded`) com
  "Melhor" e "Evite" no mesmo componente do Início (`BestAvoid`). Enquanto as 24 horas carregam,
  aparece um indicador com o nome "Carregando horários", sem texto com reticências. O custo é o do
  plano: 24 chamadas por atividade, no máximo 6 por vez, com cache.
- **Frases de horário** (`src/lib/hourPhrases.ts`, com testes): horas seguidas viram faixas, em
  ordem, sem nunca dar a volta do fim para o começo dos dados. Só a minoria é listada, e a outra
  linha vira "o resto do dia". Quando cabe, aparecem "o dia todo" e "nenhum horário". Exemplos em
  SP: chamada de vídeo, "Melhor: das 23h às 7h / Evite: o resto do dia"; enviar arquivos, "Melhor: o
  resto do dia / Evite: das 15h às 18h"; mandar mensagens, "Melhor: o dia todo / Evite: nenhum
  horário".
- **Rodapé:** "Às 20:00 (20/08)" com o link "Trocar hora", que leva ao Início e põe o foco do leitor
  de tela na faixa. A hora é a mesma do app inteiro.

**Mantido da revisão anterior (prints do iPhone):**
1. **Hora selecionada única no app.** O app abre na hora mais próxima de agora, que com os dados
   atuais é a última (20/08 20:00), e o cartão mostra sempre a hora selecionada (`useChosenHour`).
   - **Por quê:** no print, o cartão dizia "Regular, 20:00" e a faixa marcava "01:00", que é Boa.
     Duas respostas na mesma tela fazem o leigo duvidar de ambas (NN/g: um único foco previsível).
2. **Rótulo "01:00 · Boa" em texto.**
   - **Por quê:** WCAG 2.2, critério 1.4.1 (não só a cor), e Kay et al. 2016 (resultado discreto
     escrito). Cresce com a fonte (critério 1.4.4, NBR 17060).
3. **Barras com altura igual.**
   - **Por quê:** a categoria vem da pior métrica, e a nota é uma média. Uma barra Regular mais alta
     que uma Boa seria lida como "melhor" (Cleveland & McGill 1984). Waldner et al. 2019: a vantagem
     do formato linear vem da posição no tempo. Isso resolve a troca consciente da D33
     (FINDING-003).
4. **Melhor momento como faixa de horas Boas seguidas** (`src/lib/bestPeriod.ts`). A janela termina
   no fim da última hora (regra da D30, a mesma do "Evite"), por isso "às 7h".
5. **Aviso de estimativa em uma linha**, com o texto completo na tela Sobre (revelação progressiva).
   Saíram "Ver todas as horas", que repetia a aba Detalhes, e o link "Sobre o SinalCerto" do Início,
   que repetia o "Saiba mais".
6. **"Hora anterior" e "Próxima hora" compactos**, com seta e texto. O alvo ficou em 48, o mínimo
   do projeto (RNF09), que cumpre os 44pt pedidos.

**Ajuste de alinhamento (bug de layout):**
- **Início:** "É uma estimativa e pode errar." e "Saiba mais" ficam um embaixo do outro, centralizados
  (pedido no iPhone; antes, à esquerda), sem space-between.
- **Atividades:** "Às 20:00 (20/08)" e "Trocar hora" seguem o mesmo padrão.
- **Links (`AppButton` link):** sem recuo lateral. O link se alinha à esquerda por padrão; nos dois
  blocos, uma View em volta é que fica no centro. O alvo de 48
  de altura continua. Também vale para "Sobre o SinalCerto" em Detalhes.

**Efeitos e pendências:**
- **"Jogos online" (RQ03):** não foi adicionado. A API (0.2.0, no ar e no `openapi.json`) só aceita
  VIDEO_CALL, AUDIO_CALL, STREAMING, FILE_UPLOAD, WEB_BROWSING e MESSAGING, e um teste com
  `ONLINE_GAMING` volta erro 422. Sem a atividade na API, não há de onde tirar o status. Está parado
  até a equipe decidir.
- **RQ04 (escolha de horário):** agora a escolha é feita pela faixa do Início e pela lista de
  Detalhes. O seletor nativo de hora e os botões de período (D17, D18) saíram, junto com os testes
  deles.
- **Atividades:** consulta os 6 status da hora selecionada ao abrir a aba (antes, só depois de
  escolher um horário; muda a D5).
- **Leitor de tela:** com o título grande fora, o Início não tem mais um cabeçalho para navegar por
  títulos. A tela é anunciada pelo nome da aba.

## Limitação de dados
Os dados cobrem só 2026-08-20 00:00–23:00 UTC (19/08 21:00 a 20/08 20:00 em Brasília). O app
nunca apresenta a previsão como sendo de "agora".
