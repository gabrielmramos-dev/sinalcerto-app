// Fonte única dos textos do app (D9, D26). Toda tela pega os textos daqui.
// D26: fora da tela "Sobre", nada de API, modelo, probe, dados salvos, faixas de Redes ou OK/Risco/Falha.
import type { Activity, Quality, RecommendationCode } from '@/api/types';
import type { PeriodId } from '@/data/periods';

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

export const period: Record<PeriodId, string> = {
  madrugada: 'Madrugada',
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
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

/** Seção da aba Detalhes (D24, D26). */
export const numbersSection = {
  title: 'O que esperar neste horário',
  valuesFor: (when: string) => `Valores de ${when} (horário de Brasília).`,
  nearestNote: 'Nenhuma hora escolhida: mostrando a previsão mais próxima. Toque numa hora acima para ver outra.',
  latencyValue: (ms: number, effect: string) => `${ms} ms: ${effect}`,
  latencySpoken: (ms: number, effect: string) => `${ms} milissegundos: ${effect}`,
  /** "3,9% (cerca de 4 em cada 100 pedaços de informação se perdem)". Abaixo de 0,5%, "menos de 1". */
  lossValue: (pctText: string, pct: number) => {
    const n = Math.round(pct);
    if (n < 1) return `${pctText}% (menos de 1 em cada 100 pedaços de informação se perde)`;
    return `${pctText}% (cerca de ${n} em cada 100 pedaços de informação se ${n === 1 ? 'perde' : 'perdem'})`;
  },
  lossSpoken: (spokenValue: string) => spokenValue.replace(/(\d+(,\d+)?)%/, '$1 por cento'),
  scoreValue: (score: number) => `${score} de 100`,
  confidenceValue: (pct: number) => `${pct}%`,
  confidenceSpoken: (pct: number) => `${pct} por cento`,
};

export const disclaimer =
  'É uma estimativa feita a partir de como a internet se comportou antes. Pode errar. O app não mede a sua conexão.';

/** Textos das telas e componentes (D26: antes ficavam espalhados no código das telas). */
export const ui = {
  tabs: { home: 'Início', activities: 'Atividades', details: 'Detalhes' },
  common: {
    qualityContext: 'Qualidade prevista',
    loading: 'Carregando a previsão…',
    retry: 'Tentar de novo',
    region: (name: string) => `Região escolhida: ${name}`,
    noDataForRegion: 'Ainda não há previsão para esta região. Escolha outra em Trocar local, no Início.',
  },
  home: {
    changeLocation: 'Trocar local',
    changeLocationHint: 'Abre a lista de regiões',
    noDataForRegion: 'Ainda não há previsão para esta região. Escolha outra em Trocar local.',
    loadError: 'Não foi possível carregar a previsão.',
    cardTitle: 'Previsão mais próxima',
    forecastFor: (when: string) => `Previsão para ${when} (horário de Brasília)`,
    forecastForSpoken: (when: string) => `Previsão para ${when}, horário de Brasília.`,
    pastNote: 'Ainda não temos previsão para agora. Esta é a nossa previsão mais recente.',
    regionNote: 'A previsão vale para a região escolhida, não exatamente para onde você está.',
    seeActivities: 'Ver o que dá para fazer',
    seeActivitiesHint: 'Abre a aba Atividades',
    seeAllHours: 'Ver todas as horas',
    seeAllHoursHint: 'Abre a aba Detalhes',
    nextHoursTitle: 'Próximas horas',
    nextHoursLoading: 'Carregando as próximas horas…',
    nextHoursError: 'Não foi possível carregar as próximas horas.',
    nextHoursNone: (when: string) => `Nossa previsão vai só até ${when}.`,
  },
  location: {
    title: 'Escolher local',
    intro: 'A previsão vale para a região, não exatamente para o seu celular. O app não usa a sua localização.',
    loading: 'Carregando as regiões…',
    loadError: 'Não foi possível carregar as regiões.',
    empty: 'Nenhuma região disponível no momento.',
    pickHint: 'Usa esta região na previsão e volta para o início',
  },
  activities: {
    title: 'Para quando?',
    loading: 'Carregando os horários…',
    loadError: 'Não foi possível carregar os horários.',
    chooseFirst: 'Escolha um horário para ver o que dá para fazer.',
    resultsTitle: 'O que dá para fazer neste horário',
    sharedTip: (tip: string) => `Dica para este horário: ${tip}`,
    summary: (when: string, good: number, failed: number) =>
      `Horário usado: ${when}. ${good} de 6 atividades devem funcionar.${failed ? ` ${failed} não puderam ser consultadas.` : ''}`,
    cardError: 'Não foi possível consultar esta atividade.',
    cardRetry: (name: string) => `Tentar de novo: ${name}`,
    cardLoading: 'Consultando…',
    cardLoadingSpoken: (name: string) => `${name}: consultando.`,
  },
  timeChooser: {
    used: (when: string) => `Horário usado na previsão: ${when} (horário de Brasília)`,
    none: 'Nenhum horário escolhido ainda.',
    rounded: (picked: string) => `Você escolheu ${picked}; a previsão é por hora.`,
    pickerLabel: 'Hora da atividade',
    pickerHint: 'Escolha a hora e depois toque em Usar este horário',
    usePicked: 'Usar este horário',
    cancel: 'Cancelar',
    cancelHint: 'Fecha o seletor sem mudar o horário',
    change: 'Mudar horário',
    changeHint: 'Abre o seletor de hora',
    periodsTitle: 'Ou escolha a melhor hora de um período:',
    periodHint: 'Usa a hora com a melhor nota prevista neste período',
  },
  details: {
    title: 'Previsão por hora',
    loading: 'Carregando as horas…',
    loadError: 'Não foi possível carregar as horas.',
    all: 'Todas',
    allHint: 'Mostra todas as horas',
    periodHint: 'Mostra só as horas deste período',
    emptyPeriod: 'Nossa previsão não tem horas neste período.',
    showing: (n: number) => `Mostrando ${n} horas. Toque numa hora para usá-la no app.`,
    showingSpoken: (n: number, periodName?: string) => `Mostrando ${n} horas${periodName ? `: ${periodName}` : ''}`,
    chosen: (when: string, qualityLabel: string) =>
      `Horário escolhido: ${when}, ${qualityLabel}. Vale também para a aba Atividades.`,
    rowHint: 'Usa este horário no app inteiro',
    row: (clock: string, day: string, qualityLabel: string, score: number) =>
      `${clock} de ${day}: ${qualityLabel}, nota ${score} de 100`,
    rowScore: (score: number) => `nota ${score}`,
  },
  aboutLink: 'Sobre o SinalCerto',
  aboutLinkHint: 'Abre informações sobre de onde vem a previsão',
};

/** D26: tela "Sobre o SinalCerto". Aqui a linguagem pode ser técnica. */
export const about = {
  title: 'Sobre o SinalCerto',
  intro: 'Esta tela mostra os bastidores da previsão, com os termos técnicos.',
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
  scoreTitle: 'Nota e confiança',
  score:
    'A nota (qualityScore, de 0 a 100) é calculada pela API como uma média das métricas. A categoria usa a pior métrica, por isso nota e categoria podem divergir. A confiança (modelConfidence) vem do modelo e só é informada para a previsão mais próxima.',
};
