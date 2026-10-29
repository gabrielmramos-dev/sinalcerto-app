// Fonte única dos textos do app (D9, D26). Toda tela pega os textos daqui.
// D26: fora da tela "Sobre", nada de API, modelo, probe, dados salvos, faixas de Redes ou OK/Risco/Falha.
import type { Activity, Quality, RecommendationCode } from '@/api/types';
import { InvalidRequestError } from '@/data/ForecastSource';

export type Tone = 'good' | 'moderate' | 'unstable';

export const quality: Record<Quality, { label: string; sentence: string; tone: Tone; redes: string }> = {
  GOOD: { label: 'Boa', sentence: 'A internet deve funcionar sem travar.', tone: 'good', redes: 'OK' },
  MODERATE: {
    label: 'Regular',
    sentence: 'Pode ficar lenta ou dar pequenas pausas.',
    tone: 'moderate',
    redes: 'Risco',
  },
  UNSTABLE: {
    label: 'Instável',
    sentence: 'Pode travar ou cair com frequência.',
    tone: 'unstable',
    redes: 'Falha',
  },
};

export const recommendation: Record<RecommendationCode, string> = {
  NORMAL_USE: 'Pode usar a internet normalmente.',
  REDUCE_NETWORK_USAGE: 'Prefira atividades leves; vídeos e chamadas podem falhar.',
  PREPARE_OFFLINE: 'A conexão pode cair. Baixe antes o que for precisar.',
};

// Status por atividade vem de `suitable` (outra pergunta: "dá para fazer isto?").
export const suitability = {
  true: { label: 'Deve funcionar', tone: 'good' },
  false: { label: 'Pode ter problemas', tone: 'moderate' },
} as const satisfies Record<'true' | 'false', { label: string; tone: Tone }>;

export const activity: Record<Activity, { name: string; examples: string }> = {
  VIDEO_CALL: { name: 'Chamada de vídeo', examples: 'reuniões, aulas on-line' },
  AUDIO_CALL: { name: 'Chamada de voz', examples: 'ligação pelo WhatsApp' },
  STREAMING: { name: 'Ver vídeos e séries', examples: 'YouTube, filmes' },
  FILE_UPLOAD: { name: 'Enviar arquivos', examples: 'fotos, documentos' },
  WEB_BROWSING: { name: 'Navegar na internet', examples: 'sites, notícias' },
  MESSAGING: { name: 'Mandar mensagens', examples: 'textos, áudios curtos' },
};

export const metric = {
  latency: {
    term: 'Tempo de resposta (latência)',
    explanation:
      'Tempo que a informação leva para ir e voltar. Quanto menor, mais rápido tudo responde. Medida em milissegundos (ms): 1000 ms é 1 segundo.',
    rttNote:
      'Um tempo de resposta alto, sozinho, não quer dizer problema: às vezes é só a distância. O que mais atrapalha é a informação perdida.',
  },
  packetLoss: {
    term: 'Informação perdida (perda de pacotes)',
    explanation: 'Parte da informação que se perde no caminho e precisa ser enviada de novo. Quanto menor, melhor.',
  },
  score: {
    term: 'Nota estimada',
    // Feedback do stakeholder na Sprint 5 (D24).
    explanation:
      'Uma nota geral desta hora, de 0 a 100. Ela mistura todas as medidas; por isso, uma hora Regular pode ter nota maior que uma hora Boa. Para decidir, olhe a categoria (Boa, Regular ou Instável).',
  },
  confidence: {
    term: 'Confiança da previsão',
    explanation: 'Quanto a previsão está segura deste resultado, de 0 a 100%.',
  },
} as const;

/**
 * D23: faixas dos materiais de Redes (profa. Denise). D26: na tela, só escolhem a frase de consequência
 * (`effect`); o nome e a faixa aparecem só na tela "Sobre". Nunca reclassificam a categoria.
 * `max` com `strict` = "menor que"; sem `strict` = "até, inclusive". A primeira faixa que couber vale.
 */
export interface Band {
  max: number;
  strict?: boolean;
  label: string;
  range: string;
  effect?: string;
}

export const redesBands = {
  latency: [
    { max: 20, strict: true, label: 'excelente', range: 'menos de 20 ms', effect: 'tudo responde na hora.' },
    { max: 50, label: 'bom', range: '20 a 50 ms', effect: 'as páginas abrem rápido.' },
    {
      max: 100,
      label: 'médio',
      range: 'mais de 50 até 100 ms',
      effect: 'as páginas podem demorar um pouco para abrir.',
    },
    {
      max: Infinity,
      label: 'ruim',
      range: 'mais de 100 ms',
      effect: 'chamadas e jogos podem ter atraso perceptível.',
    },
  ],
  packetLoss: [
    { max: 0.5, label: 'estável', range: '0 a 0,5%', effect: 'Quase nada se perde no caminho.' },
    {
      max: 2,
      label: 'risco',
      range: 'mais de 0,5% até 2%',
      effect: 'Chamadas de vídeo podem falhar de vez em quando.',
    },
    { max: Infinity, label: 'falha', range: 'mais de 2%', effect: 'Chamadas e vídeos devem travar ou picotar.' },
  ],
  jitter: [
    { max: 20, strict: true, label: 'estável', range: 'menos de 20 ms' },
    { max: 50, label: 'risco', range: '20 a 50 ms' },
    { max: Infinity, label: 'falha', range: 'mais de 50 ms' },
  ],
} satisfies Record<'latency' | 'packetLoss' | 'jitter', Band[]>;

/** D35: o que a perda quer dizer, na explicação sob demanda de Detalhes. Abaixo de 0,5%, "menos de 1". */
export const lossMeaning = (pct: number) => {
  const n = Math.round(pct);
  if (n < 1) return 'Menos de 1 em cada 100 pedaços de informação se perde.';
  return `Cerca de ${n} em cada 100 pedaços de informação se ${n === 1 ? 'perde' : 'perdem'}.`;
};

export const disclaimer =
  'É uma estimativa feita a partir de como a internet se comportou antes. Pode errar. O app não mede a sua conexão.';

/** Textos das telas e componentes (D26: antes ficavam espalhados no código das telas). */
export const ui = {
  tabs: { home: 'Início', activities: 'Atividades', details: 'Detalhes' },
  common: {
    // D36: nunca expor nome de rota ("(tabs)") no botão voltar
    appName: 'SinalCerto',
    back: 'Voltar',
    qualityContext: 'Qualidade prevista',
    loading: 'Carregando a previsão…',
    retry: 'Tentar de novo',
    region: (name: string) => `Região escolhida: ${name}`,
    noDataForRegion: 'Ainda não há previsão para esta região. Escolha outra no botão Trocar, no Início.',
  },
  home: {
    changeLocation: 'Trocar local',
    changeLocationHint: 'Abre a lista de regiões',
    noDataForRegion: 'Ainda não há previsão para esta região. Escolha outra no botão Trocar.',
    loadError: 'Não foi possível carregar a previsão.',
    regionNote: 'A previsão vale para a região escolhida, não exatamente para onde você está.',
    // D34 (wireframe v2)
    seeActivities: 'O que dá para fazer?',
    seeActivitiesHint: 'Abre a aba Atividades',
    changeShort: 'Trocar',
    // D34: estimativa em uma linha; o texto completo fica na tela Sobre
    estimate: 'É uma estimativa e pode errar.',
    learnMore: 'Saiba mais',
    learnMoreLabel: 'Saiba mais sobre a estimativa',
    learnMoreHint: 'Abre a tela Sobre o SinalCerto',
  },
  // D34: linhas Melhor/Evite (Início e Atividades)
  hours: {
    best: 'Melhor',
    avoid: 'Evite',
    all: 'o dia todo',
    none: 'nenhum horário',
    rest: 'o resto do dia',
    mostly: 'quase o dia todo',
    withQuality: (when: string, qualityLabel: string) => `${when} · ${qualityLabel}`,
    spoken: (best: string, avoid: string) => `Melhor: ${best}. Evite: ${avoid}.`,
  },
  // D33: faixa do dia (Início, Atividades e, depois, Detalhes)
  strip: {
    label: 'Faixa do dia, hora a hora',
    hint: 'Deslize para cima ou para baixo para mudar a hora',
    // D34: "01:00 · Boa", igual na tela e no leitor de tela
    value: (clock: string, qualityLabel: string) => `${clock} · ${qualityLabel}`,
    none: 'Nenhuma hora escolhida',
    prev: 'Hora anterior',
    prevHint: 'Escolhe a hora anterior na faixa do dia',
    next: 'Próxima hora',
    nextHint: 'Escolhe a próxima hora na faixa do dia',
  },
  location: {
    title: 'Escolher local',
    intro: 'A previsão vale para a região, não exatamente para o seu celular. O app não usa a sua localização.',
    loading: 'Carregando as regiões…',
    loadError: 'Não foi possível carregar as regiões.',
    empty: 'Nenhuma região disponível no momento.',
    pickHint: 'Usa esta região na previsão e volta para o início',
    // D36
    close: 'Fechar',
    closeHint: 'Fecha sem trocar a região',
  },
  activities: {
    // D34 (wireframe v2): "O que você quer fazer?"
    title: 'O que você quer fazer?',
    intro: 'Toque numa atividade para ver os melhores horários.',
    loading: 'Carregando os horários…',
    loadError: 'Não foi possível carregar os horários.',
    summary: (when: string, good: number, failed: number) =>
      `Horário usado: ${when}. ${good} de 6 atividades devem funcionar.${failed ? ` ${failed} não puderam ser consultadas.` : ''}`,
    status: { works: 'Funciona', mayFail: 'Pode falhar', wontWork: 'Não deve funcionar' },
    statusLoading: 'carregando',
    statusError: 'Sem resposta',
    rowLabel: (name: string, clock: string, status: string) => `${name}, às ${clock}: ${status}`,
    rowHint: 'Mostra os melhores horários desta atividade',
    cardRetry: (name: string) => `Tentar de novo: ${name}`,
    planLoading: 'Carregando horários',
    planError: (name: string) => `Não foi possível consultar todas as horas de ${name}.`,
    planRetry: (name: string) => `Tentar de novo: horas de ${name}`,
    at: (clock: string, day: string) => `Às ${clock} (${day})`,
    changeHour: 'Trocar hora',
    changeHourHint: 'Abre o Início, na faixa do dia, para escolher outra hora',
  },
  details: {
    // D35 (wireframe v2): "Hora a hora"
    title: 'Hora a hora',
    subtitle: (region: string, good: number, moderate: number, unstable: number) =>
      `${region} · ${good} ${good === 1 ? 'boa' : 'boas'}, ${moderate} ${moderate === 1 ? 'regular' : 'regulares'}, ${unstable} ${unstable === 1 ? 'instável' : 'instáveis'}`,
    loading: 'Carregando as horas…',
    loadError: 'Não foi possível carregar as horas.',
    chosen: (when: string, qualityLabel: string) =>
      `Horário escolhido: ${when}, ${qualityLabel}. Vale também para a aba Atividades.`,
    row: (clock: string, qualityLabel: string) => `${clock}, ${qualityLabel}`,
    rowHint: 'Usa este horário no app inteiro e mostra o que esperar',
    expect: 'O que esperar neste horário',
    latencyName: 'Tempo de resposta',
    lossName: 'Informação perdida',
    metricLine: (name: string, value: string) => `${name} · ${value}`,
    whatIsIt: 'O que é isso?',
    whatIsItLabel: (name: string) => `O que é isso? ${name}`,
    whatIsItHint: 'Mostra ou esconde a explicação',
    score: (score: number) => `Nota ${score} de 100`,
    confidence: (pct: number) => `Confiança ${pct}%`,
    confidenceSpoken: (pct: number) => `Confiança ${pct} por cento`,
    scoreName: 'Nota e confiança',
  },
  /** D27: aviso da fonte, em linguagem de usuário (sem API, mock ou servidor). */
  source: {
    online: 'Previsão atualizada',
    // "Guardada no app": a reserva é a cópia que vem com o app, não a última consulta do usuário.
    offline: 'Sem conexão: mostrando a previsão guardada no app',
    savedOnly: 'Mostrando a previsão guardada no app',
    retry: 'Tentar de novo',
    retryA11y: 'Tentar de novo: buscar a previsão atualizada',
    retryHint: 'Tenta buscar a previsão atualizada',
    firstLoading: 'Carregando a previsão. Na primeira vez, pode levar até 1 minuto.',
  },
  /** Respostas 400 e 422: mensagens simples (404 vira o estado vazio de cada tela). */
  errors: {
    badRequest: 'O horário escolhido não é válido. Escolha outro.',
    invalid: 'Não foi possível consultar com essa escolha. Tente escolher de novo.',
  },
  aboutLink: 'Sobre o SinalCerto',
  aboutLinkHint: 'Abre informações sobre de onde vem a previsão',
};

/** Mensagem simples para um erro de carregamento (400/422 têm texto próprio; o resto usa a da tela). */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof InvalidRequestError) return error.status === 400 ? ui.errors.badRequest : ui.errors.invalid;
  return fallback;
}

/** D26: tela "Sobre o SinalCerto". Aqui a linguagem pode ser técnica. */
export const about = {
  title: 'Sobre o SinalCerto',
  intro: 'Esta tela mostra os bastidores da previsão, com os termos técnicos.',
  estimateTitle: 'É uma estimativa',
  sourceTitle: 'De onde vêm os dados',
  source:
    'Medições históricas da rede RIPE Atlas foram usadas para treinar modelos de previsão (turma de Estrutura de Dados). A Internet Quality API 0.2.0 entrega as previsões já calculadas. O app não mede a sua conexão e não executa nenhum modelo.',
  modelTitle: 'Modelo usado',
  model: (name: string, group: string, algorithm: string, version: string) =>
    `${name} (${group}, ${about.algorithmName(algorithm)}, versão ${version}). A troca de modelo ainda não está disponível no app.`,
  /** Tradução dos algoritmos que GET /models devolve; sem tradução conhecida, fica o nome original. */
  algorithms: {
    'Linear Regression': 'Regressão Linear',
    'Random Forest': 'Floresta Aleatória',
    'Decision Tree': 'Árvore de Decisão',
  } as Record<string, string>,
  algorithmName: (en: string) => (about.algorithms[en] ? `${about.algorithms[en]} (${en})` : en),
  modelLoading: 'Carregando as informações do modelo…',
  modelUnknown: (id: string) => `Modelo ${id}.`,
  periodTitle: 'Período coberto',
  period: (from: string, to: string) =>
    `A previsão disponível vai de ${from} a ${to} (horário de Brasília). É um único dia de dados; por isso o app nunca chama a previsão de "agora" e sempre mostra a data real.`,
  regionsTitle: 'Regiões',
  regions:
    'Cada região é uma probe do RIPE Atlas. A API informa só coordenadas aproximadas, por privacidade; o nome da região foi dado pela equipe a partir delas. O app não usa GPS nem coleta dados pessoais.',
  categoriesTitle: 'Categorias',
  categories:
    'A API classifica cada hora como GOOD, MODERATE ou UNSTABLE, com regras experimentais (não são padrões científicos nem classificações do RIPE Atlas). O app mostra Boa, Regular e Instável. Na disciplina de Redes, equivalem a:',
  equivalence: (label: string, redes: string) => `${label}, no app, equivale a ${redes}, em Redes`,
  equivalenceVisible: (redes: string) => `= ${redes} (Redes)`,
  bandsTitle: 'Faixas de referência (disciplina de Redes)',
  bands:
    'Faixas dos materiais da profa. Denise. No app, elas só escolhem a frase de cada número em "O que esperar neste horário"; nunca mudam a categoria, que vem da API.',
  bandList: (name: string, bands: readonly Band[]) =>
    `${name}: ${bands.map((b) => `${b.label}, ${b.range}`).join('; ')}.`,
  latencyName: 'Latência (RTT médio previsto)',
  lossName: 'Perda de pacotes',
  jitterName: 'Jitter',
  jitterNote: 'A previsão da API não inclui jitter; a faixa fica aqui só como referência.',
  sourcesTitle: 'Fontes de dados do app',
  sources: (baseUrl: string, savedAt: string) =>
    `Fonte principal: a Internet Quality API em ${baseUrl}. A primeira consulta espera até 60 segundos (o plano gratuito do Render pode estar "dormindo"); as seguintes, 15 segundos. Se a API não responder (sem rede, tempo esgotado ou erro 5xx), o app passa a usar a reserva: respostas reais da mesma API, gravadas em ${savedAt} (MockSource), e mostra "Sem conexão". Enquanto isso, não tenta a API a cada tela; só quando o usuário toca em "Tentar de novo". Respostas 404, 400 e 422 vêm da própria API e não usam a reserva. A variável EXPO_PUBLIC_DATA_SOURCE=mock força só a reserva (testes e emergência).`,
  sourceNow: (mode: string) => `Agora: ${mode}.`,
  sourceModes: {
    unknown: 'consultando a API pela primeira vez',
    online: 'usando a API',
    offline: 'usando a reserva (a API não respondeu)',
    'saved-only': 'usando só a reserva, forçada por EXPO_PUBLIC_DATA_SOURCE=mock',
  } as Record<string, string>,
  scoreTitle: 'Nota e confiança',
  score:
    'A nota (qualityScore, de 0 a 100) é calculada pela API como uma média das métricas. A categoria usa a pior métrica, por isso nota e categoria podem divergir. A confiança (modelConfidence) vem do modelo e só é informada para a previsão mais próxima.',
};
