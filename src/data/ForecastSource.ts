import type {
  ActivityCheck,
  ActivityCheckRequest,
  LocationItem,
  ModelListItem,
  ProbeForecast,
  Timeline,
} from '@/api/types';

/** "Não há dados" (404 da API: modelo desconhecido ou sem previsão). A tela mostra o estado vazio, não erro. */
export class NoDataError extends Error {}

/** O que o app precisa de uma fonte de dados. MockSource (M1) e ApiSource (M6) seguem este contrato. */
export interface ForecastSource {
  getModels(): Promise<ModelListItem[]>;
  getLocations(): Promise<LocationItem[]>;
  /** Previsão mais próxima de agora (se tudo estiver no passado, a última). */
  getForecast(probeId: number, modelId: string): Promise<ProbeForecast>;
  getTimeline(probeId: number, modelId: string): Promise<Timeline>;
  /** Uma atividade por chamada, como a API. Envie sempre um predictionFor da timeline (D6). */
  checkActivity(req: ActivityCheckRequest): Promise<ActivityCheck>;
}
