// Respostas reais da API salvas por scripts/save-mock.mjs (D1). Só o model-a.
import type { ActivityCheck, LocationItem, ModelListItem, ProbeForecast, RecommendationCode, Timeline } from '@/api/types';
import { NoDataError, type ForecastSource } from './ForecastSource';
import { nearestItem } from './time';

import activitiesJson from './mock/activities.json';
import forecastsJson from './mock/forecasts.json';
import locationsJson from './mock/locations.json';
import modelsJson from './mock/models.json';
import timelinesJson from './mock/timelines.json';

type Saved = [suitable: boolean, code: RecommendationCode, message: string];
const activities = activitiesJson as unknown as Pick<ActivityCheck, 'model' | 'metadata'> & {
  byProbe: Record<string, Record<string, Record<string, Saved>>>;
};
const forecasts = forecastsJson as unknown as Record<string, ProbeForecast>;
const timelines = timelinesJson as unknown as Record<string, Timeline>;

const MOCK_MODEL = 'model-a';

function noData(what: string): never {
  throw new NoDataError(`Sem dados no modo de teste: ${what}`);
}

export function createMockSource(delayMs = 400): ForecastSource {
  // Atraso artificial para o estado "carregando" aparecer no celular.
  const reply = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), delayMs));

  const timeline = (probeId: number, modelId: string) =>
    (modelId === MOCK_MODEL && timelines[probeId]) || noData(`probe ${probeId}, modelo ${modelId}`);

  return {
    getModels: () => reply(modelsJson.items as ModelListItem[]),
    getLocations: () => reply(locationsJson.items as LocationItem[]),

    async getForecast(probeId, modelId) {
      timeline(probeId, modelId);
      return reply(forecasts[probeId] ?? noData(`previsão da probe ${probeId}`));
    },

    async getTimeline(probeId, modelId) {
      return reply(timeline(probeId, modelId));
    },

    async checkActivity(req) {
      const location = (locationsJson.items as LocationItem[]).find(
        (l) => l.location.latitude === req.latitude && l.location.longitude === req.longitude,
      );
      // ponytail: a API acha a probe mais próxima da coordenada; aqui, só coordenada exata de probe (o app só envia essas, D7).
      if (!location) return noData(`coordenada ${req.latitude}, ${req.longitude}`);
      // Como a API real: arredonda para a previsão mais próxima sem avisar (D6).
      const item = nearestItem(timeline(location.probeId, req.modelId).items, new Date(req.dateTime));
      const saved = item && activities.byProbe[location.probeId]?.[item.predictionFor]?.[req.activity];
      if (!item || !saved) return noData(`atividade ${req.activity}`);
      const [suitable, code, message] = saved;
      return reply<ActivityCheck>({
        model: activities.model,
        activity: req.activity,
        suitable,
        forecast: {
          quality: item.quality,
          predictedAvgRttMs: item.predictedAvgRttMs,
          predictedPacketLossPct: item.predictedPacketLossPct,
        },
        recommendation: { code, message },
        metadata: activities.metadata,
      });
    },
  };
}
