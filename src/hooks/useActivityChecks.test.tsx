import { act, renderHook } from '@testing-library/react-native';

import { forecastSource } from '@/data';
import { ACTIVITY_TIMEOUT_MS, clearActivityCache, useActivityChecks, type CheckParams } from './useActivityChecks';

const SP: CheckParams = {
  probeId: 900001,
  latitude: -23.5505,
  longitude: -46.6333,
  modelId: 'model-a',
  predictionFor: '2026-08-20T18:00:00Z',
};

let spy: jest.SpyInstance;
beforeEach(() => {
  jest.useFakeTimers();
  clearActivityCache();
  spy = jest.spyOn(forecastSource, 'checkActivity');
});
afterEach(() => {
  spy.mockRestore();
  jest.useRealTimers();
});

const settle = () => act(async () => jest.advanceTimersByTimeAsync(1000)); // passa o atraso de 400 ms do mock
const statuses = (r: { current: ReturnType<typeof useActivityChecks> }) => r.current.cards.map((c) => c.state.status);

it('sem horário escolhido, não chama a API', async () => {
  await renderHook(() => useActivityChecks(null));
  expect(spy).not.toHaveBeenCalled();
});

it('dispara as 6 em paralelo com o predictionFor exato (D5, D6)', async () => {
  const { result } = await renderHook(() => useActivityChecks(SP));
  expect(spy).toHaveBeenCalledTimes(6);
  expect(spy.mock.calls.every(([req]) => req.dateTime === SP.predictionFor)).toBe(true);
  expect(statuses(result)).toEqual(Array(6).fill('loading'));
  await settle();
  expect(statuses(result)).toEqual(Array(6).fill('ok'));
});

it('uma falha só afeta o seu cartão; "Tentar de novo" repete só ela', async () => {
  spy.mockImplementationOnce(() => Promise.reject(new Error('fora do ar'))); // a 1ª é VIDEO_CALL
  const { result } = await renderHook(() => useActivityChecks(SP));
  await settle();
  expect(statuses(result)).toEqual(['error', 'ok', 'ok', 'ok', 'ok', 'ok']);

  spy.mockClear();
  await act(async () => result.current.retry('VIDEO_CALL'));
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy.mock.calls[0]?.[0].activity).toBe('VIDEO_CALL');
  await settle();
  expect(statuses(result)).toEqual(Array(6).fill('ok'));
});

it('timeout de 15 s vira erro só naquele cartão', async () => {
  spy.mockImplementationOnce(() => new Promise(() => {})); // nunca responde
  const { result } = await renderHook(() => useActivityChecks(SP));
  await settle();
  expect(result.current.cards[0]?.state.status).toBe('loading');
  await act(async () => jest.advanceTimersByTimeAsync(ACTIVITY_TIMEOUT_MS));
  expect(statuses(result)).toEqual(['error', 'ok', 'ok', 'ok', 'ok', 'ok']);
});

it('voltar a um horário já visto não chama a API (cache)', async () => {
  const { rerender } = await renderHook((p: CheckParams) => useActivityChecks(p), { initialProps: SP });
  await settle();
  await rerender({ ...SP, predictionFor: '2026-08-20T19:00:00Z' });
  await settle();
  spy.mockClear();
  const back = await renderHook(() => useActivityChecks(SP));
  expect(spy).not.toHaveBeenCalled();
  expect(statuses(back.result)).toEqual(Array(6).fill('ok'));
});

it('erro que chega depois de trocar o horário é descartado: ao voltar, consulta de novo', async () => {
  let failLate!: () => void;
  spy.mockImplementationOnce(() => new Promise((_, reject) => (failLate = () => reject(new Error('atrasada'))))); // VIDEO_CALL das 15:00
  const { result, rerender } = await renderHook((p: CheckParams) => useActivityChecks(p), { initialProps: SP });
  await rerender({ ...SP, predictionFor: '2026-08-20T19:00:00Z' }); // usuário vai para as 16:00
  await act(async () => failLate()); // o erro das 15:00 chega agora
  await settle();

  spy.mockClear();
  await rerender(SP); // volta para as 15:00
  expect(result.current.cards[0]?.state.status).toBe('loading'); // não mostra o erro velho
  expect(spy).toHaveBeenCalledTimes(1); // só a que não está no cache
  await settle();
  expect(statuses(result)).toEqual(Array(6).fill('ok'));
});

it('resposta atrasada do horário antigo não vira erro no horário novo', async () => {
  spy.mockImplementationOnce(() => Promise.reject(new Error('atrasada')));
  const { result, rerender } = await renderHook((p: CheckParams) => useActivityChecks(p), { initialProps: SP });
  await rerender({ ...SP, predictionFor: '2026-08-20T19:00:00Z' }); // troca antes da resposta
  await settle();
  expect(statuses(result)).toEqual(Array(6).fill('ok'));
});
