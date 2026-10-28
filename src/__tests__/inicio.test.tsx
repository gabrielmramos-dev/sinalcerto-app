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

  // "Regular" aparece no cartão e na legenda do relógio: espera pela frase do cartão.
  expect(await screen.findByLabelText(/^Previsão mais próxima\. Qualidade prevista: Regular\./)).toBeOnTheScreen();
  expect(screen.getByText('Previsão para 20 de agosto de 2026, 20:00 (horário de Brasília)')).toBeOnTheScreen();
  // Os dados são de agosto: o app não finge que a previsão é de agora.
  expect(screen.getByText(/^Ainda não temos previsão para agora/)).toBeOnTheScreen();
  expect(screen.getByText('Região escolhida: São Paulo (SP)')).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith(
    expect.stringMatching(/^Região escolhida: São Paulo \(SP\)\. Qualidade prevista: Regular\./),
  );
});

describe('E2: novo Início (D29)', () => {
  const BEST = 'Melhor momento do dia: 19 de agosto, 23:00: Boa. Evite das 15h às 18h (Instável).';
  const CLOCK = '19 e 20 de agosto: 8 horas boas, 13 regulares e 3 instáveis. Melhor momento: 19 de agosto, 23:00.';

  it('nome do app como título em serifa, marcado como cabeçalho; título do relógio com a data real', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    expect(screen.getByRole('header', { name: 'SinalCerto' })).toBeOnTheScreen();
    expect(await screen.findByRole('header', { name: 'Previsão de 19 e 20 de agosto' })).toBeOnTheScreen();
  });

  it('melhor momento e "Evite" calculados dos dados, lidos como uma frase', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByLabelText(BEST)).toBeOnTheScreen();
  });

  it('relógio e barras não aparecem como imagem solta: o relógio é lido pelo resumo em texto', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByLabelText(CLOCK)).toBeOnTheScreen();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('ordem de leitura: título, região, cartão (categoria, frase, data), melhor momento, relógio', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    await screen.findByLabelText(CLOCK);
    const tree = JSON.stringify(screen.toJSON());
    const order = [
      '"SinalCerto"',
      'Região escolhida: São Paulo (SP)',
      'Previsão mais próxima. Qualidade prevista: Regular.',
      BEST,
      'Previsão de 19 e 20 de agosto',
      CLOCK,
    ].map((s) => tree.indexOf(s));
    expect(order.every((pos) => pos >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
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

it('sem a seção "Próximas horas": o cartão e o relógio já mostram até quando vai a previsão (D30)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByLabelText(/^19 e 20 de agosto: 8 horas boas/);
  expect(screen.queryByText('Próximas horas')).toBeNull();
  expect(screen.getByRole('button', { name: 'Ver todas as horas' })).toBeOnTheScreen();
});

it('trocar o local recarrega e anuncia a nova região (D7)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByText('Previsão mais próxima');

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
