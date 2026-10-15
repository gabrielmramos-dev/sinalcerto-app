import type { ForecastSource } from './ForecastSource';
import { createMockSource } from './MockSource';

// D4: modelo padrão vem do primeiro item de GET /models; troca de modelo é extra.
export const DEFAULT_MODEL_ID = process.env.EXPO_PUBLIC_DEFAULT_MODEL_ID ?? 'model-a';

// ponytail: só o mock por enquanto. A ApiSource entra no M6, escolhida por EXPO_PUBLIC_DATA_SOURCE=api.
export const forecastSource: ForecastSource = createMockSource();
