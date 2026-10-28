import { SourceUnavailableError, type ForecastSource } from './ForecastSource';
import type { SourceStatusStore } from './sourceStatus';

/**
 * D27: tenta a API; se ela não puder responder (sem rede, tempo esgotado, 5xx), responde com a reserva
 * salva e marca "sem conexão". Enquanto estiver sem conexão, usa só a reserva (não espera o tempo
 * limite a cada tela) até alguém tocar em "Tentar de novo".
 * 404, 400 e 422 não caem para a reserva: são respostas da própria API.
 */
export function createFallbackSource(
  primary: ForecastSource,
  backup: ForecastSource,
  status: SourceStatusStore,
): ForecastSource {
  const wrap =
    <A extends unknown[], R>(pick: (s: ForecastSource) => (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
      const s = status.get();
      if (s.mode === 'offline' && !s.retrying) return pick(backup)(...args);
      try {
        const result = await pick(primary)(...args);
        status.markOnline();
        return result;
      } catch (error) {
        if (!(error instanceof SourceUnavailableError)) {
          status.markOnline(); // a API respondeu (404/400/422)
          throw error;
        }
        status.markOffline();
        return pick(backup)(...args);
      }
    };

  return {
    getModels: wrap((s) => s.getModels),
    getLocations: wrap((s) => s.getLocations),
    getForecast: wrap((s) => s.getForecast),
    getTimeline: wrap((s) => s.getTimeline),
    checkActivity: wrap((s) => s.checkActivity),
  };
}
