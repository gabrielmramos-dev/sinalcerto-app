// Fonte única dos termos do app (D9). Toda tela pega os textos daqui.
import type { Activity, Quality, RecommendationCode } from '@/api/types';

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
    term: 'Latência (tempo de resposta)',
    explanation:
      'Tempo que a informação leva para ir e voltar. Quanto menor, mais rápido tudo responde. Medida em milissegundos (ms): 1000 ms é 1 segundo.',
  },
  packetLoss: {
    term: 'Perda de pacotes',
    explanation:
      'Parte dos dados que se perde no caminho. 4% quer dizer cerca de 4 em cada 100 pedaços. Quanto menor, melhor; perda alta faz a chamada picotar.',
  },
  jitter: {
    term: 'Jitter (variação)',
    explanation:
      'Quanto o tempo de resposta varia de um momento para outro. Atrapalha chamadas e jogos. Esta previsão não inclui jitter.',
  },
  score: {
    term: 'Nota estimada',
    explanation: 'Nota de 0 a 100 calculada pela API. Quanto maior, melhor.',
  },
  confidence: {
    term: 'Confiança do modelo',
    explanation: 'Quanto o modelo confia nesta previsão, de 0 a 100%. Nem sempre está disponível.',
  },
} as const;

export const disclaimer =
  'Estimativa feita por um modelo a partir do histórico da rede. Pode errar. O app não mede a sua internet.';
