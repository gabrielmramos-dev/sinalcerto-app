/**
 * @jest-environment node
 */
// Teste opcional contra a API no ar. Não roda no `npm test` normal (depende de rede e do Render acordado).
// Uso: LIVE_API=1 npx jest src/data/ApiSource.live
// Ambiente "node": no ambiente React Native do jest-expo, o fetch é um substituto que não faz rede.
import { createApiSource } from './ApiSource';
import { NoDataError } from './ForecastSource';

const live = process.env.LIVE_API === '1' ? describe : describe.skip;
const BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://internet-quality-api.onrender.com';

// O setup do React Native troca o fetch global por um que não faz rede, até no ambiente "node".
// Este fetch mínimo usa o https do Node e implementa só o que a ApiSource usa.
const nodeFetch = ((url: string, init?: RequestInit) =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const https = require('node:https') as {
      request: (u: string, o: object, cb: (res: NodeResponse) => void) => NodeRequest;
    };
    const req = https.request(url, { method: init?.method ?? 'GET', headers: init?.headers ?? {} }, (res) => {
      let body = '';
      res.on('data', (chunk: string) => (body += chunk));
      res.on('end', () =>
        resolve({ ok: res.statusCode < 400, status: res.statusCode, json: async () => JSON.parse(body) }),
      );
    });
    req.on('error', reject);
    init?.signal?.addEventListener('abort', () => req.destroy(new Error('aborted')));
    if (init?.body) req.write(String(init.body));
    req.end();
  })) as unknown as typeof fetch;
type NodeResponse = { statusCode: number; on: (e: string, cb: (x: string) => void) => void };
type NodeRequest = { on: (e: string, cb: (e: Error) => void) => void; write: (s: string) => void; end: () => void; destroy: (e: Error) => void };

live('Internet Quality API no ar', () => {
  const api = createApiSource({ baseUrl: BASE, timeoutMs: () => 90_000, fetchFn: nodeFetch });
  jest.setTimeout(180_000);

  it('responde modelos, locais, previsão, timeline e atividade no formato esperado', async () => {
    expect((await api.getModels()).map((m) => m.id)).toContain('model-a');
    const locations = await api.getLocations();
    expect(locations.length).toBeGreaterThan(0);
    const sp = locations[0]!;
    const f = await api.getForecast(sp.probeId, 'model-a');
    expect(['GOOD', 'MODERATE', 'UNSTABLE']).toContain(f.assessment.quality);
    const t = await api.getTimeline(sp.probeId, 'model-a');
    expect(t.items.length).toBeGreaterThan(0);
    const a = await api.checkActivity({
      modelId: 'model-a',
      ...sp.location,
      dateTime: t.items[0]!.predictionFor,
      activity: 'VIDEO_CALL',
    });
    expect(typeof a.suitable).toBe('boolean');
  });

  it('modelo inexistente devolve 404 (NoDataError)', async () => {
    await expect(api.getTimeline(900001, 'modelo-que-nao-existe')).rejects.toBeInstanceOf(NoDataError);
  });
});
