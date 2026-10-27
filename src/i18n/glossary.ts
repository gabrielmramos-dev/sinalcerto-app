// Fonte única dos termos do app (D9). Toda tela pega os textos daqui.
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
    term: 'Latência (tempo de resposta)',
    explanation:
      'Tempo que a informação leva para ir e voltar. Quanto menor, mais rápido tudo responde. Medida em milissegundos (ms): 1000 ms é 1 segundo.',
    rttNote:
      'Latência alta sozinha não quer dizer defeito: pode ser só um caminho longo até o servidor. Quando a conexão piora de verdade, isso aparece na perda de pacotes e no jitter.',
  },
  packetLoss: {
    term: 'Perda de pacotes',
    explanation:
      'Parte dos dados que se perde no caminho. 4% quer dizer cerca de 4 em cada 100 pedaços. Quanto menor, melhor; perda alta faz a chamada picotar.',
  },
  jitter: {
    term: 'Jitter (variação)',
    explanation: 'Quanto o tempo de resposta varia de um momento para outro. Atrapalha chamadas e jogos.',
    notInForecast: 'A previsão da API não inclui jitter, então não há valor para mostrar.',
  },
  score: {
    term: 'Nota estimada',
    // Feedback do stakeholder na Sprint 5 (D24).
    explanation:
      'Nota de 0 a 100 calculada pela API: uma média das medidas. Por isso uma hora Regular pode ter nota maior que uma hora Boa: a categoria olha a pior medida, e a nota mistura todas. A categoria é a informação principal.',
  },
  confidence: {
    term: 'Confiança do modelo',
    explanation: 'Quanto o modelo confia nesta previsão, de 0 a 100%. A API nem sempre informa.',
  },
} as const;

/**
 * D23: faixas dos materiais de Redes (profa. Denise), só como contexto para aprender.
 * Nunca reclassificam nada: a categoria continua vindo da API.
 * `max` com `strict` = "menor que"; sem `strict` = "até, inclusive". A primeira faixa que couber vale.
 */
export interface Band {
  max: number;
  strict?: boolean;
  label: string;
  range: string;
}

export const redesBands = {
  intro:
    'As faixas abaixo vêm da disciplina de Redes e servem só para entender cada número. A categoria (Boa, Regular ou Instável) continua vindo da API, que usa regras próprias e experimentais.',
  latency: [
    { max: 20, strict: true, label: 'excelente', range: 'menos de 20 ms' },
    { max: 50, label: 'bom', range: '20 a 50 ms' },
    { max: 100, label: 'médio', range: 'mais de 50 até 100 ms' },
    { max: Infinity, label: 'ruim', range: 'mais de 100 ms' },
  ],
  packetLoss: [
    { max: 0.5, label: 'estável', range: '0 a 0,5%' },
    { max: 2, label: 'risco', range: 'mais de 0,5% até 2%' },
    { max: Infinity, label: 'falha', range: 'mais de 2%' },
  ],
  jitter: [
    { max: 20, strict: true, label: 'estável', range: 'menos de 20 ms' },
    { max: 50, label: 'risco', range: '20 a 50 ms' },
    { max: Infinity, label: 'falha', range: 'mais de 50 ms' },
  ],
} satisfies Record<'latency' | 'packetLoss' | 'jitter', Band[]> & { intro: string };

export const numbersSection = {
  title: 'Como ler os números',
  valuesFor: (when: string) => `Valores de ${when} (horário de Brasília).`,
  nearestNote: 'Nenhuma hora escolhida: mostrando a previsão mais próxima. Toque numa hora acima para ver outra.',
  bandOf: (band: Band) => `Pela tabela de Redes: ${band.label} (${band.range}).`,
  jitterBands: 'Na tabela de Redes: estável com menos de 20 ms, risco de 20 a 50 ms, falha com mais de 50 ms.',
  equivalenceTitle: 'Categorias do app e de Redes',
  equivalenceIntro: 'Na disciplina de Redes, as mesmas situações se chamam OK, Risco e Falha.',
};

export const disclaimer =
  'Estimativa feita por um modelo a partir do histórico da rede. Pode errar. O app não mede a sua internet.';
