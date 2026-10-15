// Tipos da Internet Quality API 0.2.0, copiados à mão de docs/api/openapi.json.
// Só o que o app usa. Datas são strings ISO em UTC (ex.: "2026-08-20T15:00:00Z").

export const QUALITIES = ['GOOD', 'MODERATE', 'UNSTABLE'] as const;
export type Quality = (typeof QUALITIES)[number];

export const RECOMMENDATION_CODES = ['NORMAL_USE', 'REDUCE_NETWORK_USAGE', 'PREPARE_OFFLINE'] as const;
export type RecommendationCode = (typeof RECOMMENDATION_CODES)[number];

export const ACTIVITIES = [
  'VIDEO_CALL',
  'AUDIO_CALL',
  'STREAMING',
  'FILE_UPLOAD',
  'WEB_BROWSING',
  'MESSAGING',
] as const;
export type Activity = (typeof ACTIVITIES)[number];

export interface ModelRef {
  id: string;
  name: string;
  version: string;
}

export interface ModelListItem extends ModelRef {
  description: string;
  groupName: string;
  algorithm: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface LocationItem {
  probeId: number;
  countryCode: string;
  asnV4: number | null;
  asnV6: number | null;
  location: GeoPoint;
}

export interface Recommendation {
  code: RecommendationCode;
  /** Texto da API. Não usar na lógica nem na tela: a API manda usar o code. */
  message: string;
}

export interface ProbeForecast {
  model: ModelRef;
  probeId: number;
  location: GeoPoint & { countryCode: string };
  prediction: {
    predictionFor: string;
    predictedAvgRttMs: number;
    predictedPacketLossPct: number;
    modelConfidence?: number | null;
  };
  assessment: { quality: Quality; qualityScore: number };
  recommendation: Recommendation;
}

export interface TimelineItem {
  predictionFor: string;
  predictedAvgRttMs: number;
  predictedPacketLossPct: number;
  quality: Quality;
  qualityScore: number;
}

export interface Timeline {
  model: ModelRef;
  probeId: number;
  items: TimelineItem[];
}

export interface ActivityCheckRequest {
  modelId: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  activity: Activity;
}

export interface ActivityCheck {
  model: ModelRef;
  activity: Activity;
  suitable: boolean;
  forecast: { quality: Quality; predictedAvgRttMs: number; predictedPacketLossPct: number };
  recommendation: Recommendation;
  metadata: { disclaimer: string; locationPrivacy: string };
}
