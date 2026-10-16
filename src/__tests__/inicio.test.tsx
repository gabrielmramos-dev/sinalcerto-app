import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';

// Usa as rotas de verdade de src/app (layout, abas e modal) com a MockSource.
const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

beforeEach(() => announce.mockClear());

it('mostra a previsão mais próxima com data real e anuncia (RQ01, RNF08)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  expect(screen.getByText('Carregando a previsão…')).toBeOnTheScreen();

  expect(await screen.findByText('Regular')).toBeOnTheScreen();
  expect(screen.getByText('Previsão para 20 de agosto de 2026, 20:00 (horário de Brasília)')).toBeOnTheScreen();
  // Os dados são de agosto: o app não finge que a previsão é de agora.
  expect(screen.getByText(/Não há previsão para agora/)).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith(expect.stringMatching(/^Região de São Paulo \(SP\)\. Qualidade prevista: Regular\./));
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

it('trocar o local recarrega e anuncia a nova região (D7)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByText('Regular');

  await fireEvent.press(screen.getByRole('button', { name: 'Trocar local' }));
  expect(await screen.findByRole('button', { name: 'Região de São Paulo (SP)', selected: true })).toBeOnTheScreen();

  announce.mockClear();
  await fireEvent.press(screen.getByRole('button', { name: 'Região de Manaus (AM)' }));
  expect(await screen.findByText('Região de Manaus (AM)')).toBeOnTheScreen();
  await screen.findByText('Previsão mais próxima');
  expect(announce).toHaveBeenCalledWith(expect.stringMatching(/^Região de Manaus \(AM\)\. Qualidade prevista:/));
});
