import { createApiSource } from './ApiSource';
import { createFallbackSource } from './FallbackSource';
import type { ForecastSource } from './ForecastSource';
import { createMockSource } from './MockSource';
import { sourceStatus } from './sourceStatus';

// D4: modelo padrão vem do primeiro item de GET /models; troca de modelo é extra.
export const DEFAULT_MODEL_ID = process.env.EXPO_PUBLIC_DEFAULT_MODEL_ID ?? 'model-a';

// D27: a API real é a fonte padrão; EXPO_PUBLIC_DATA_SOURCE=mock força só a reserva (testes e emergência).
export const DATA_SOURCE: 'auto' | 'mock' = process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock' ? 'mock' : 'auto';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://internet-quality-api.onrender.com';

/** Primeira consulta: o plano gratuito do Render pode levar dezenas de segundos para acordar. */
export const FIRST_TIMEOUT_MS = 60_000;
/** Depois que a API respondeu uma vez (mesmo valor das atividades, D19). */
export const NEXT_TIMEOUT_MS = 15_000;

const mock = createMockSource();

export const forecastSource: ForecastSource =
  DATA_SOURCE === 'mock'
    ? mock
    : createFallbackSource(
        createApiSource({
          baseUrl: API_BASE_URL,
          timeoutMs: () => (sourceStatus.get().connectedOnce ? NEXT_TIMEOUT_MS : FIRST_TIMEOUT_MS),
        }),
        mock,
        sourceStatus,
      );
