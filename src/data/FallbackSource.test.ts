import { AccessibilityInfo } from 'react-native';

import { ui } from '@/i18n/glossary';
import { createFallbackSource } from './FallbackSource';
import { NoDataError, SourceUnavailableError, type ForecastSource } from './ForecastSource';
import { createSourceStatus } from './sourceStatus';

const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

function fakeSource(name: string): ForecastSource & { calls: string[] } {
  const calls: string[] = [];
  const answer = (method: string) => async () => {
    calls.push(method);
    return [name] as never;
  };
  return {
    calls,
    getModels: answer('getModels'),
    getLocations: answer('getLocations'),
    getForecast: answer('getForecast'),
    getTimeline: answer('getTimeline'),
    checkActivity: answer('checkActivity'),
  };
}

function setup() {
  const api = fakeSource('api');
  const backup = fakeSource('reserva');
  const status = createSourceStatus();
  return { api, backup, status, source: createFallbackSource(api, backup, status) };
}

beforeEach(() => announce.mockClear());

it('API respondendo: usa a API e marca "atualizada", sem anunciar a primeira resposta', async () => {
  const { source, status } = setup();
  expect(await source.getModels()).toEqual(['api']);
  expect(status.get()).toMatchObject({ mode: 'online', connectedOnce: true });
  expect(announce).not.toHaveBeenCalled();
});

it('API fora do ar: responde com a reserva, marca "sem conexão" e anuncia', async () => {
  const { source, status, api } = setup();
  api.getModels = async () => {
    throw new SourceUnavailableError('sem rede');
  };
  expect(await source.getModels()).toEqual(['reserva']);
  expect(status.get().mode).toBe('offline');
  expect(announce).toHaveBeenCalledWith(ui.source.offline);
});

it('sem conexão: as próximas chamadas vão direto para a reserva, sem esperar a API', async () => {
  const { source, status, api, backup } = setup();
  status.markOffline();
  api.calls.length = 0;
  await source.getTimeline(900001, 'model-a');
  expect(api.calls).toEqual([]);
  expect(backup.calls).toEqual(['getTimeline']);
});

it('"Tentar de novo": a próxima chamada tenta a API; se responder, volta e anuncia "atualizada"', async () => {
  const { source, status, api } = setup();
  status.markOffline();
  announce.mockClear();
  status.retry();
  expect(status.get()).toMatchObject({ retrying: true, version: 1 });
  expect(await source.getForecast(900001, 'model-a')).toEqual(['api']);
  expect(api.calls).toEqual(['getForecast']);
  expect(status.get()).toMatchObject({ mode: 'online', retrying: false });
  expect(announce).toHaveBeenCalledWith(ui.source.online);
});

it('"Tentar de novo" com a API ainda fora: continua na reserva, sem anunciar de novo', async () => {
  const { source, status, api } = setup();
  api.getModels = async () => {
    throw new SourceUnavailableError('5xx');
  };
  await source.getModels();
  announce.mockClear();
  status.retry();
  expect(await source.getModels()).toEqual(['reserva']);
  expect(status.get()).toMatchObject({ mode: 'offline', retrying: false });
  expect(announce).not.toHaveBeenCalled();
});

it('404 vem da própria API: não cai na reserva e conta como conectado', async () => {
  const { source, status, api, backup } = setup();
  api.getTimeline = async () => {
    throw new NoDataError('404');
  };
  await expect(source.getTimeline(1, 'model-a')).rejects.toBeInstanceOf(NoDataError);
  expect(backup.calls).toEqual([]);
  expect(status.get().mode).toBe('online');
});
