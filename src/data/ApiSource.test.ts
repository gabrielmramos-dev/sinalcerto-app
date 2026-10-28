import { createApiSource } from './ApiSource';
import { InvalidRequestError, NoDataError, SourceUnavailableError } from './ForecastSource';
import forecasts from './mock/forecasts.json';
import locations from './mock/locations.json';
import timelines from './mock/timelines.json';

const BASE = 'https://exemplo.test/';
const json = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as Response);

function setup(respond: (url: string, init?: RequestInit) => Promise<Response>, timeout = 15_000) {
  const fetchFn = jest.fn(respond) as unknown as jest.Mock & typeof fetch;
  return { fetchFn, api: createApiSource({ baseUrl: BASE, timeoutMs: () => timeout, fetchFn }) };
}

it('API respondendo: monta a URL certa e devolve o mesmo formato da reserva', async () => {
  const { fetchFn, api } = setup((url) =>
    url.endsWith('/locations') ? json(locations) : json(timelines['900001']),
  );
  expect(await api.getLocations()).toHaveLength(10);
  const t = await api.getTimeline(900001, 'model-a');
  expect(t.items).toHaveLength(24);
  expect(fetchFn.mock.calls.map(([u]) => u)).toEqual([
    'https://exemplo.test/api/v1/locations',
    'https://exemplo.test/api/v1/forecasts/probes/900001/timeline?model_id=model-a&limit=100',
  ]);
});

it('previsão e atividade: GET com model_id e POST com o corpo da API', async () => {
  const { fetchFn, api } = setup(() => json(forecasts['900001']));
  await api.getForecast(900001, 'model-a');
  expect(fetchFn.mock.calls[0]?.[0]).toBe('https://exemplo.test/api/v1/forecasts/probes/900001?model_id=model-a');

  const req = { modelId: 'model-a', latitude: -23.5505, longitude: -46.6333, dateTime: '2026-08-20T15:00:00Z', activity: 'VIDEO_CALL' as const };
  await api.checkActivity(req);
  const [url, init] = fetchFn.mock.calls[1]!;
  expect(url).toBe('https://exemplo.test/api/v1/activity/check');
  expect(init.method).toBe('POST');
  expect(JSON.parse(init.body)).toEqual(req);
});

it.each([
  [404, NoDataError],
  [400, InvalidRequestError],
  [422, InvalidRequestError],
  [500, SourceUnavailableError],
  [503, SourceUnavailableError],
])('HTTP %i vira %p', async (status, ErrorClass) => {
  const { api } = setup(() => json({ detail: 'x' }, status));
  await expect(api.getModels()).rejects.toBeInstanceOf(ErrorClass);
});

it('400 e 422 guardam o código (para a mensagem certa)', async () => {
  const { api } = setup(() => json({}, 422));
  await expect(api.getModels()).rejects.toMatchObject({ status: 422 });
});

it('sem rede vira SourceUnavailableError', async () => {
  const { api } = setup(() => Promise.reject(new TypeError('Network request failed')));
  await expect(api.getLocations()).rejects.toThrow(/sem rede/);
});

it('tempo esgotado cancela a chamada e vira SourceUnavailableError', async () => {
  jest.useFakeTimers();
  const { api } = setup(
    (_url, init) =>
      new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))),
    60_000,
  );
  const pending = expect(api.getModels()).rejects.toThrow(/tempo esgotado/);
  await jest.advanceTimersByTimeAsync(60_000);
  await pending;
  jest.useRealTimers();
});

it('o tempo limite é lido a cada chamada (primeira longa, depois curta)', async () => {
  let timeout = 60_000;
  const seen: number[] = [];
  const spy = jest.spyOn(globalThis, 'setTimeout');
  const api = createApiSource({ baseUrl: BASE, timeoutMs: () => timeout, fetchFn: (() => json(locations)) as typeof fetch });
  await api.getLocations();
  timeout = 15_000;
  await api.getLocations();
  for (const call of spy.mock.calls) if (call[1] === 60_000 || call[1] === 15_000) seen.push(call[1]);
  expect(seen).toEqual([60_000, 15_000]);
  spy.mockRestore();
});
