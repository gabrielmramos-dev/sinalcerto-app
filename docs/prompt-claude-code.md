# PAPEL

Você é meu par de programação e revisor neste projeto. Leia tudo antes de agir. Você pode gerar código, mas em passos pequenos e sempre explicando: eu preciso entender e conseguir defender cada parte na Mostra de Tecnologia.

# CONTEXTO

Projeto da faculdade (Braz Cubas, ADS), disciplina Programação para Dispositivos Móveis, em grupo. App SinalCerto (nome a confirmar): mostra a QUALIDADE PREVISTA da conexão de internet em linguagem simples, com foco forte em acessibilidade. Stack obrigatória: React Native + Expo (TypeScript). O código ainda não foi começado.
Prazo: [PREENCHER]. Quem programa: [PREENCHER]. Celular de teste: [Android ou iOS].

AVISO DA PROFESSORA: os protótipos P01, P2 e P3 do documento de requisitos são só ilustrativos e NÃO devem ser replicados. O app precisa ter design original e simplificado, que atenda aos requisitos. Não use o layout, as cores nem os textos deles como referência.
O protótipo da squad, em docs/design/ (telas Início, Detalhes e Atividades, com barra de navegação inferior), é referência APENAS VISUAL: estilo, cores, tipografia e disposição geral. Ele não é fiel ao app final. Conteúdo, textos e comportamento vêm dos requisitos (RQ/RNF) e do que a API realmente entrega. Onde o protótipo mostrar algo que a API não fornece, o app NÃO mostra, ou mostra uma versão honesta.

# FONTES (em docs/)

- Especificação de requisitos (PDF): RQ01-04 e RNF01-09. É a fonte da verdade. Leia a introdução.
- API de referência: documentação Swagger "Internet Quality API 0.2.0" e projeto Java (zip) com data/predictions.csv e data/models.json. A squad tem uma instância no ar: https://internet-quality-api.onrender.com (docs em /docs, esquema completo em /openapi.json, que deve estar salvo em docs/). Ainda não confirmamos com a professora se é a URL oficial, então deixe a URL base em variável de ambiente. Não invente schemas: se faltar algum, leia o openapi.json ou pergunte.
- Materiais de Redes (se estiverem em docs/redes/): conceitos de latência, jitter e perda, para escrever as explicações em linguagem simples.
- FAQ da disciplina: regras de uso de IA e da Mostra de Tecnologia.

# REQUISITOS

Funcionais:

- RQ01: mostrar a condição prevista em categorias compreensíveis.
- RQ02: consultar a qualidade prevista para períodos futuros.
- RQ03: informar quais atividades são adequadas (videoconferência, streaming, jogos online, navegação, envio de arquivos), em linguagem simples.
- RQ04: selecionar horário ou período do dia para verificar a previsão.
  Não funcionais (critérios de aceite):
- RNF01: ABNT NBR 17060 e WCAG 2.2 AA.
- RNF02: tudo utilizável com TalkBack e VoiceOver; todo componente interativo com nome, função, estado e valor.
- RNF03: nenhuma informação só por cor, ícone, formato, posição ou animação; sempre texto equivalente.
- RNF04: contraste de texto >= 4,5:1; texto grande e componentes gráficos >= 3:1.
- RNF05: respeitar o tamanho de fonte do sistema; sem sobreposição, truncamento ou perda de função com texto ampliado.
- RNF06: sem gestos complexos, arrastar ou multitoque; só controles convencionais.
- RNF07: linguagem simples; termos como latência, jitter e perda de pacotes sempre com explicação contextual.
- RNF08: ordem de navegação lógica; ao mudar de tela, abrir diálogo ou atualizar a previsão, mover ou anunciar o foco corretamente.
- RNF09: área de toque mínima 48 x 48 dp.
  O mínimo exigido é atender os requisitos do documento INTEGRALMENTE: nenhum RQ ou RNF pode ser cortado. "Comparar previsões" e "trocar de modelo" NÃO são requisitos: são extras, só se sobrar tempo.

# REGRAS DE USO DE IA (a disciplina exige transparência)

- Registre cada interação relevante em docs/prompts-ia.md: data, o que pedi, resumo da sua resposta e o que usei. Atualize ao fim de cada sessão. Esse arquivo é entregue junto com o projeto.
- Antes de cada bloco de código, diga em 2-4 linhas o que vai fazer e por quê. Depois, explique os trechos não triviais.
- Nunca gere o app inteiro de uma vez. Trabalhe um marco por vez, pare e espere meu OK antes do próximo.
- Ao fim de cada marco, faça 3 perguntas de revisão sobre o que foi feito para eu responder (preparação para a Mostra). Corrija minhas respostas.
- Mantenha docs/DECISOES.md: cada decisão técnica, a alternativa descartada, o motivo e as limitações conhecidas.
- Mantenha docs/MOSTRA.md: roteiro curto com o problema, as decisões e seus motivos, dificuldades, limitações, melhorias possíveis e como o app se relaciona com o ODS 9 e o ODS 10. Afirme só o que estiver implementado.
- Se eu pedir algo que contrarie essas regras, avise.

# DESIGN (protótipo da squad, em docs/design/)

Use o protótipo da squad só como guia visual. Ele é um rascunho inicial gerado, ainda não revisado, e o app final pode ter telas diferentes. Antes de codar, olhe as imagens e me devolva: (1) a lista de telas e o fluxo entre elas, (2) uma tabela RQ01-04 e RNF01-09 -> onde cada um aparece no protótipo, marcando o que falta, (3) os problemas abaixo, com uma proposta de solução para cada. Só codamos depois do meu OK.
Problemas que já vi no protótipo (confirme e resolva comigo):

- Texto cortado com reticências ("WhatsApp, Telegram, ...", "YouTube, filmes e ...", "Navegação e Mensa"): viola o RNF05. Texto sem truncamento.
- Logo com imagem quebrada (aparece o texto alternativo "Logo"). Defina logo ou remova, e dê alt/label correto.
- Ícone de perfil/conta no cabeçalho: não há conta nem dado pessoal nos requisitos e o app não coleta dados. Pergunte se fica.
- "Ao Vivo" e "Atualizado há 5 min": a API entrega PREVISÃO (predictionFor), não medição ao vivo, e não há campo de "atualizado em" nem de "válido até". Não invente esses dados. Proponha texto honesto com o que a API devolve.
- "Vila Madalena, São Paulo": /locations devolve probeId, país, ASN e coordenadas, sem nome de bairro. Não invente o nome. Proponha uma referência honesta (probe e distância) ou uma lista de locais definida por nós.
- "Previsão exata" e "Não medimos...": a previsão é estimada e vem de um modelo, e o app não mede. Corrija o texto para não prometer precisão nem dizer que medimos.
- "Horários sugeridos" em lista com rolagem horizontal: o RNF06 não permite arrastar como único caminho, e não há endpoint que sugira horários. Proponha derivar da timeline (RQ02) e oferecer alternativa por botão.
- Estado do item selecionado (atividade) só por cor e ícone: acrescente texto ou estado acessível equivalente.
- Texto branco sobre foto e textos secundários pequenos e cinza: verifique o contraste com a função utilitária, sem confiar no olho.
- Alguns textos são idênticos aos do protótipo ilustrativo da professora ("Planejar uma atividade", "O que esta previsão representa"). Sugira alternativas originais.
- Os rótulos por atividade ("Estável", "Pode travar", "Muito bom") são outro vocabulário de status. Veja a seção do glossário.
  Esses pontos são diferenças entre o protótipo e o que os requisitos e a API permitem. Em caso de dúvida, valem os requisitos e a API, não o protótipo.

# GLOSSÁRIO

Proponha src/i18n/glossary.ts como fonte única dos termos de qualidade e das explicações (latência, perda de pacotes, jitter) em linguagem simples. Nosso protótipo usa "Boa" e "Regular" (o RQ01 acrescenta "Instável"; o RNF03 cita "Ruim"; a API usa GOOD/MODERATE/UNSTABLE; Redes usa OK/Risco/Falha). Proponha Boa / Regular / Instável, com o mapeamento GOOD->Boa, MODERATE->Regular, UNSTABLE->Instável em um único lugar, e me peça confirmação. Os rótulos por atividade do protótipo ("Estável", "Pode travar", "Muito bom") são outro vocabulário: me pergunte se devem seguir o mesmo glossário.

# DADOS E REGRAS DE NEGÓCIO

- Acesso aos dados por uma interface ForecastSource: MockSource (JSON local gerado a partir de predictions.csv) e ApiSource (a API no ar). Alternar por variável de ambiente EXPO*PUBLIC*\*. Comece pelo mock para andar rápido, mas ligue a ApiSource cedo: o app tem de funcionar contra a API real, e o mock fica como reserva se o servidor cair na Mostra.
- A API de referência devolve classificação e recomendação; o app TRADUZ o resultado para texto, ícone e cor e não reimplementa regra. Se a API final não trouxer esses campos, me avise.
- Os limiares da API são experimentais. Na interface, apresente como previsão estimada, sem sugerir padrão científico.
- Datas vêm em UTC; exibir em America/Sao_Paulo. Os dados cobrem só 20/08/2026 (00:00 a 23:00 UTC): use a "previsão mais próxima" e mostre a data real, não assuma dados para "agora".
- Privacidade: sem rastreamento e sem dados pessoais. NÃO use GPS do aparelho; o usuário escolhe um local de uma lista (GET /locations).

# CONTRATO DA API (versão 0.2.0; fonte da verdade: docs/openapi.json)

Já testado no ar: /health, /models, /locations, /forecasts/probes/{id} e /timeline respondem. Não testados: /nearby, /compare e POST /activity/check.
Fatos verificados: 4 modelos (model-a a model-d, algoritmos diferentes); 10 probes, todas no Brasil, sem nome de cidade; as previsões da timeline começam em 2026-08-20T00:00Z e vão de hora em hora, e a "previsão mais próxima" hoje devolve 2026-08-20T23:00Z, porque tudo está no passado. Ou seja, os dados cobrem um dia só, em agosto: o app NÃO pode fingir que "hoje, 15:00" existe. Mostre a data e a hora reais da previsão e trate isso como limitação de dados.
Enums: activity = VIDEO_CALL, AUDIO_CALL, STREAMING, FILE_UPLOAD, WEB_BROWSING, MESSAGING. quality = GOOD, MODERATE, UNSTABLE. recommendation.code = NORMAL_USE, REDUCE_NETWORK_USAGE, PREPARE_OFFLINE. A API manda usar o CODE na lógica e não o texto de message: mapeie o code para textos nossos, em linguagem simples, no glossário.
O servidor está no plano gratuito do Render e pode demorar dezenas de segundos na primeira chamada depois de parado: use timeout generoso, estado de carregamento com texto e tentativa de novo.
Base: /api/v1. Fluxo: GET /models -> usuário escolhe model_id -> GET /locations -> usuário escolhe uma probe -> consultas.

- GET /models: items[{id, name, description, groupName, algorithm, version}], total.
- GET /locations: items[{probeId, countryCode, asnV4, asnV6, location{latitude, longitude}}], total. Sem nome de cidade ou bairro.
- GET /forecasts/probes/{probe_id}?model_id=: previsão mais próxima. Traz model, probeId, location, prediction{predictionFor (UTC), predictedAvgRttMs, predictedPacketLossPct, modelConfidence (pode ser null)}, assessment{quality (GOOD|MODERATE|UNSTABLE), qualityScore 0-100}, recommendation{code, message}. Se todas as previsões estão no passado, devolve a última.
- GET /forecasts/probes/{probe_id}/timeline?model_id=&from=&to=&limit=: items[{predictionFor, predictedAvgRttMs, predictedPacketLossPct, quality, qualityScore}]; limit padrão 24, máximo 100. Base do RQ02.
- GET /forecasts/probes/{probe_id}/compare?prediction_for=: compara os modelos ativos (extra).
- GET /forecasts/nearby?lat=&lon=&model_id=&radius_km=: probe mais próxima de uma coordenada; traz matchedProbe.distanceKm e metadata (disclaimer, locationPrivacy).
- POST /activity/check: corpo {modelId, latitude, longitude, dateTime, activity}; resposta {model, activity, suitable, forecast{quality, predictedAvgRttMs, predictedPacketLossPct}, recommendation, metadata}. Uma chamada por atividade.
- Erros: 404 (modelo desconhecido ou sem dados), 422 (validação), 400 (from > to).
  ATENÇÃO, conflito com a privacidade: o POST /activity/check EXIGE latitude e longitude. Proposta (me confirme): enviar as coordenadas da PROBE escolhida na lista, nunca as do aparelho. A tela deve dizer que a previsão é de uma probe de referência, como o próprio metadata da API diz.
  As telas Início e Atividades mostram o status de várias atividades ao mesmo tempo. A API só avalia uma atividade por chamada: me diga o custo (quantas chamadas) e proponha uma solução, sem reimplementar a regra de adequação no app.

# ARQUITETURA

- Expo + TypeScript estrito + expo-router (ou react-navigation, se justificar).
- src/api: cliente HTTP tipado; URL base via EXPO_PUBLIC_API_BASE_URL.
- src/data: ForecastSource, MockSource, ApiSource.
- src/components: componentes acessíveis reutilizáveis, definidos no design.
- src/theme: tokens de cor, espaçamento e tipografia; paleta PRÓPRIA, definida comigo. Verifique o contraste de cada par com uma função utilitária testada.
- Estados obrigatórios em toda tela: carregando, erro (mensagem simples e "Tentar de novo") e vazio.
- README: como rodar no celular físico (use o IP da rede local; no emulador Android, 10.0.2.2).

# ACESSIBILIDADE (desde a primeira tela)

- accessibilityRole, accessibilityLabel, accessibilityState e accessibilityHint em todo controle; agrupe os cartões para o leitor de tela ler na ordem lógica.
- minHeight e minWidth 48 em tudo que é tocável.
- Texto sem altura fixa; allowFontScaling ligado; testar com fonte grande.
- Categoria de qualidade SEMPRE com texto + ícone + cor.
- AccessibilityInfo.announceForAccessibility e setAccessibilityFocus ao carregar resultado, trocar de tela e abrir diálogo.
- Data e hora com seletor nativo (@react-native-community/datetimepicker).
- Nada de gesto de arrastar como único caminho.
- Adicione um lint de acessibilidade (eslint-plugin-react-native-a11y) e justifique em uma linha.

# MARCOS (ordem, sem datas fixas; me diga a estimativa de cada um)

M0: plano, design e glossário aprovados.
M1: scaffold, tema, componentes base, MockSource.
M2: tela da previsão atual (RQ01).
M3: escolha de horário e de atividade (RQ03, RQ04).
M4: previsões para períodos futuros (RQ02).
M5: explicações das métricas em linguagem simples (RNF07).
M6: ApiSource, erros e carregamento.
M7: passada final de acessibilidade, testes, README, STATUS.md e MOSTRA.md.
Extras (só se sobrar tempo): comparar previsões e trocar de modelo.

# TESTES

Jest + @testing-library/react-native: componentes (papel, label, estado, tamanho mínimo), mapeamento dados -> UI e função de contraste. Rode lint e typecheck antes de cada entrega.

# STATUS.md (verdade primeiro)

Mantenha uma tabela RQ01-04 e RNF01-09: estado (não iniciado / implementado / testado), onde está no código e como foi verificado. Nunca marque "testado" sem teste automatizado ou verificação manual descrita. Isso alimenta um artigo acadêmico: precisa ser verdadeiro.

# ESTILO

- Primeiro explore docs/ e me devolva: (a) resumo do que entendeu, (b) até 8 dúvidas, (c) PLAN.md com os marcos e critérios de aceite. Espere meu OK.
- Não invente endpoints, campos ou textos. Se não souber, pergunte ou marque PENDENTE.
- Textos da interface em português do Brasil; identificadores de código em inglês; comentários só onde o porquê não é óbvio.
- Commits pequenos, com mensagens claras. A cada marco, diga como rodar e o que testar no celular.
- Sem dependências desnecessárias; justifique cada nova biblioteca em uma linha.
