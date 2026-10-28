// Internet Quality API 0.2.0 no ar (M6, D27). Mesmo contrato da MockSource.
import type { ActivityCheck, LocationItem, ModelListItem, ProbeForecast, Timeline } from '@/api/types';
import { InvalidRequestError, NoDataError, SourceUnavailableError, type ForecastSource } from './ForecastSource';

interface Options {
  /** Ex.: https://internet-quality-api.onrender.com (sem /api/v1). */
  baseUrl: string;
  /** Tempo limite da próxima chamada, em ms. Lido a cada chamada: a primeira espera mais (servidor acordando). */
  timeoutMs: () => number;
  /** Trocável nos testes. */
  fetchFn?: typeof fetch;
}

export function createApiSource({ baseUrl, timeoutMs, fetchFn = fetch }: Options): ForecastSource {
  const root = `${baseUrl.replace(/\/+$/, '')}/api/v1`;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs());
    let res: Response;
    try {
      res = await fetchFn(root + path, { ...init, signal: controller.signal });
    } catch {
      throw new SourceUnavailableError(controller.signal.aborted ? `tempo esgotado em ${path}` : `sem rede em ${path}`);
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 404) throw new NoDataError(`404 em ${path}`);
    if (res.status === 400 || res.status === 422) throw new InvalidRequestError(res.status, `${res.status} em ${path}`);
    if (!res.ok) throw new SourceUnavailableError(`${res.status} em ${path}`);
    try {
      return (await res.json()) as T;
    } catch {
      throw new SourceUnavailableError(`resposta ilegível em ${path}`);
    }
  }

  const q = encodeURIComponent;
  return {
    getModels: async () => (await request<{ items: ModelListItem[] }>('/models')).items,
    getLocations: async () => (await request<{ items: LocationItem[] }>('/locations')).items,
    getForecast: (probeId, modelId) => request<ProbeForecast>(`/forecasts/probes/${probeId}?model_id=${q(modelId)}`),
    getTimeline: (probeId, modelId) =>
      request<Timeline>(`/forecasts/probes/${probeId}/timeline?model_id=${q(modelId)}&limit=100`),
    checkActivity: (req) =>
      request<ActivityCheck>('/activity/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      }),
  };
}
