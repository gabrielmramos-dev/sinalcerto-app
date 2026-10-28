import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import forecasts from '@/data/mock/forecasts.json';
import type { ProbeForecast } from '@/api/types';

// Usa as rotas de verdade de src/app (layout, abas e modal) com a MockSource.
const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

beforeEach(() => announce.mockClear());

it('mostra a previsão mais próxima com data real e anuncia (RQ01, RNF08)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  expect(screen.getByText('Carregando a previsão…')).toBeOnTheScreen();

  expect(await screen.findByText('Regular')).toBeOnTheScreen();
  expect(screen.getByText('Previsão para 20 de agosto de 2026, 20:00 (horário de Brasília)')).toBeOnTheScreen();
  // Os dados são de agosto: o app não finge que a previsão é de agora.
  expect(screen.getByText(/^Ainda não temos previsão para agora/)).toBeOnTheScreen();
  expect(screen.getByText('Região escolhida: São Paulo (SP)')).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith(
    expect.stringMatching(/^Região escolhida: São Paulo \(SP\)\. Qualidade prevista: Regular\./),
  );
});

it('o cartão é lido como um item só, com a frase completa', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  expect(await screen.findByLabelText(/^Previsão mais próxima\. Qualidade prevista: Regular\. .*horário de Brasília\./)).toBeOnTheScreen();
});

it('sem dados (404) mostra vazio com orientação, não erro', async () => {
  const spy = jest.spyOn(forecastSource, 'getForecast').mockRejectedValueOnce(new NoDataError('sem dados'));
  await renderRouter('src/app', { initialUrl: '/' });
  expect(
    await screen.findByText('Ainda não há previsão para esta região. Escolha outra em Trocar local.'),
  ).toBeOnTheScreen();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull();
  spy.mockRestore();
});

it('próximas horas com os dados reais: diz até quando vai a previsão (D22, D26)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  expect(await screen.findByText('Nossa previsão vai só até 20 de agosto, 20:00.')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Ver todas as horas' })).toBeOnTheScreen();
});

it('próximas horas quando há horas depois do cartão: mostra até 3 (D22)', async () => {
  const real = forecasts['900001'] as ProbeForecast; // resposta real salva (20/08 20:00)
  const earlier = { ...real, prediction: { ...real.prediction, predictionFor: '2026-08-20T15:00:00Z' } };
  const spy = jest.spyOn(forecastSource, 'getForecast').mockResolvedValueOnce(earlier);
  await renderRouter('src/app', { initialUrl: '/' });

  expect(await screen.findByLabelText('13:00 de 20 de agosto: Regular, nota 60 de 100')).toBeOnTheScreen();
  expect(screen.getByLabelText('14:00 de 20 de agosto: Regular, nota 57 de 100')).toBeOnTheScreen();
  expect(screen.getByLabelText('15:00 de 20 de agosto: Instável, nota 55 de 100')).toBeOnTheScreen();
  expect(screen.queryByLabelText(/^16:00 de 20 de agosto/)).toBeNull();
  spy.mockRestore();
});

it('trocar o local recarrega e anuncia a nova região (D7)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByText('Regular');

  await fireEvent.press(screen.getByRole('button', { name: 'Trocar local' }));
  expect(await screen.findByRole('button', { name: 'Região de São Paulo (SP)', selected: true })).toBeOnTheScreen();

  announce.mockClear();
  await fireEvent.press(screen.getByRole('button', { name: 'Região de Manaus (AM)' }));
  expect(await screen.findByText('Região escolhida: Manaus (AM)')).toBeOnTheScreen();
  await screen.findByText('Previsão mais próxima');
  expect(announce).toHaveBeenCalledWith(expect.stringMatching(/^Região escolhida: Manaus \(AM\)\. Qualidade prevista:/));
});

it('link discreto "Sobre o SinalCerto" abre os bastidores, com linguagem técnica (D26)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await fireEvent.press(await screen.findByRole('link', { name: 'Sobre o SinalCerto' }));

  expect(
    await screen.findByText(/^Modelo A \(Grupo 1, Regressão Linear \(Linear Regression\), versão 1\.0\)/),
  ).toBeOnTheScreen();
  expect(
    screen.getByText(/^A previsão disponível vai de 19 de agosto de 2026, 21:00 a 20 de agosto de 2026, 20:00/),
  ).toBeOnTheScreen();
  expect(screen.getAllByText(/RIPE Atlas/).length).toBeGreaterThan(0); // origem e regiões
  expect(screen.getByLabelText('Regular, no app, equivale a Risco, em Redes')).toBeOnTheScreen();
  expect(screen.getByText(/^Latência \(RTT médio previsto\): excelente, menos de 20 ms; bom, 20 a 50 ms/)).toBeOnTheScreen();
  expect(screen.getByText(/^Jitter: estável, menos de 20 ms/)).toBeOnTheScreen();
});
