import { NoDataError } from './ForecastSource';
import { createMockSource } from './MockSource';

const source = createMockSource(0);
const SP = { latitude: -23.5505, longitude: -46.6333 };

it('lista 4 modelos e 10 probes', async () => {
  expect(await source.getModels()).toHaveLength(4);
  expect(await source.getLocations()).toHaveLength(10);
});

it('timeline tem 24 horas de 20/08 UTC', async () => {
  const { items } = await source.getTimeline(900001, 'model-a');
  expect(items).toHaveLength(24);
  expect(items[0]?.predictionFor).toBe('2026-08-20T00:00:00Z');
  expect(items[23]?.predictionFor).toBe('2026-08-20T23:00:00Z');
});

it('previsão "mais próxima" é a última, como na API', async () => {
  const f = await source.getForecast(900001, 'model-a');
  expect(f.prediction.predictionFor).toBe('2026-08-20T23:00:00Z');
});

it('atividade reproduz a resposta real salva (15:00Z, São Paulo)', async () => {
  const base = { modelId: 'model-a', ...SP, dateTime: '2026-08-20T15:00:00Z' };
  const video = await source.checkActivity({ ...base, activity: 'VIDEO_CALL' });
  expect(video.suitable).toBe(false);
  expect(video.recommendation.code).toBe('REDUCE_NETWORK_USAGE');
  expect(video.forecast).toEqual({ quality: 'MODERATE', predictedAvgRttMs: 69.2, predictedPacketLossPct: 3.8 });
  expect((await source.checkActivity({ ...base, activity: 'MESSAGING' })).suitable).toBe(true);
});

it('arredonda o horário como a API (15:30 -> 15:00)', async () => {
  const r = await source.checkActivity({ modelId: 'model-a', ...SP, dateTime: '2026-08-20T15:30:00Z', activity: 'VIDEO_CALL' });
  expect(r.forecast.predictedAvgRttMs).toBe(69.2);
});

it('modelo sem dados no mock falha como o 404 da API', async () => {
  await expect(source.getTimeline(900001, 'model-b')).rejects.toBeInstanceOf(NoDataError);
  await expect(source.getTimeline(123, 'model-a')).rejects.toBeInstanceOf(NoDataError);
});
