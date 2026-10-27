import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import timelines from '@/data/mock/timelines.json';
import type { Timeline } from '@/api/types';

const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
beforeEach(() => announce.mockClear());

// Linhas da timeline: o nome acessível começa com "HH:MM de D de mês: ".
const ROW = /^\d\d:\d\d de \d+ de agosto: /;

const open = async () => {
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  await screen.findByText(/^Mostrando \d+ horas/, {}, { timeout: 5000 });
};

it('mostra as 24 horas em lista textual, com cabeçalho a cada dia (RQ02)', async () => {
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  expect(screen.getByText('Carregando as horas…')).toBeOnTheScreen();
  await screen.findByText(/^Mostrando 24 horas/, {}, { timeout: 5000 });

  expect(screen.getAllByLabelText(ROW)).toHaveLength(24);
  expect(screen.getByRole('header', { name: '19 de agosto' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: '20 de agosto' })).toBeOnTheScreen();
  // texto + ícone + cor + nota, e o nome completo para o leitor de tela
  expect(screen.getByRole('button', { name: '21:00 de 19 de agosto: Regular, nota 68 de 100' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Todas', selected: true })).toBeOnTheScreen();
});

it('filtro Noite: 6 horas em duas datas, com selected e anúncio', async () => {
  await open();
  await fireEvent.press(screen.getByRole('button', { name: 'Noite' }));

  expect(screen.getByRole('button', { name: 'Noite', selected: true })).toBeOnTheScreen();
  expect(screen.getAllByLabelText(ROW)).toHaveLength(6);
  expect(screen.getByRole('header', { name: '19 de agosto' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: '20 de agosto' })).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith('Mostrando 6 horas: Noite');

  await fireEvent.press(screen.getByRole('button', { name: 'Tarde' }));
  expect(screen.queryByRole('header', { name: '19 de agosto' })).toBeNull();
});

it('tocar numa hora escolhe o horário para o app inteiro e anuncia (D6)', async () => {
  await open();
  const row = screen.getByRole('button', { name: '15:00 de 20 de agosto: Instável, nota 55 de 100' });
  await fireEvent.press(row);

  expect(screen.getByRole('button', { name: '15:00 de 20 de agosto: Instável, nota 55 de 100', selected: true })).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith(
    'Horário escolhido: 20 de agosto, 15:00, Instável. Vale também para a aba Atividades.',
  );

  await act(() => router.navigate('/atividades'));
  expect(
    await screen.findByText('Horário usado na previsão: 20 de agosto de 2026, 15:00 (horário de Brasília)'),
  ).toBeOnTheScreen();
});

describe('Como ler os números (RNF07, D23, D24)', () => {
  it('sem hora escolhida: valores da previsão mais próxima, faixas de Redes, nota e confiança', async () => {
    await open();
    expect(screen.getByRole('header', { name: 'Como ler os números' })).toBeOnTheScreen();
    expect(screen.getByText('Valores de 20 de agosto, 20:00 (horário de Brasília).')).toBeOnTheScreen();
    expect(screen.getByText(/^Nenhuma hora escolhida: mostrando a previsão mais próxima/)).toBeOnTheScreen();

    // latência: valor no formato brasileiro, falado por extenso, e a faixa de Redes ao lado
    expect(screen.getByLabelText('73,2 milissegundos')).toHaveTextContent('73,2 ms');
    expect(screen.getByText('Pela tabela de Redes: médio (mais de 50 até 100 ms).')).toBeOnTheScreen();
    expect(screen.getByText(/^Latência alta sozinha não quer dizer defeito/)).toBeOnTheScreen();
    // perda: faixa "falha" de Redes, mas a categoria continua a da API (Regular): nada é reclassificado
    expect(screen.getByLabelText('3,9 por cento')).toHaveTextContent('3,9%');
    expect(screen.getByText('Pela tabela de Redes: falha (mais de 2%).')).toBeOnTheScreen();
    expect(screen.getAllByLabelText('Qualidade prevista: Regular').length).toBeGreaterThan(0);
    // jitter sem valor, com aviso
    expect(screen.getByText('A previsão da API não inclui jitter, então não há valor para mostrar.')).toBeOnTheScreen();
    // nota (feedback da Sprint 5)
    expect(screen.getByText('63 de 100')).toBeOnTheScreen();
    expect(screen.getByText(/A categoria é a informação principal\.$/)).toBeOnTheScreen();
    // confiança: a API mandou 0,8 para esta hora
    expect(await screen.findByLabelText('80 por cento')).toBeOnTheScreen();
    // equivalência com Redes
    expect(screen.getByLabelText('Boa, no app, equivale a OK, em Redes')).toBeOnTheScreen();
    expect(screen.getByLabelText('Regular, no app, equivale a Risco, em Redes')).toBeOnTheScreen();
    expect(screen.getByLabelText('Instável, no app, equivale a Falha, em Redes')).toBeOnTheScreen();
  });

  it('hora escolhida: valores daquela hora e sem confiança (a API só manda para a mais próxima)', async () => {
    await open();
    await screen.findByLabelText('80 por cento');
    await fireEvent.press(screen.getByRole('button', { name: '15:00 de 20 de agosto: Instável, nota 55 de 100' }));

    expect(screen.getByText('Valores de 20 de agosto, 15:00 (horário de Brasília).')).toBeOnTheScreen();
    expect(screen.queryByText(/^Nenhuma hora escolhida/)).toBeNull();
    expect(screen.getByLabelText('86 milissegundos')).toBeOnTheScreen();
    expect(screen.getByLabelText('5,1 por cento')).toBeOnTheScreen();
    expect(screen.getByText('55 de 100')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'Confiança do modelo' })).toBeNull();
  });
});

it('sem dados (404): estado vazio com orientação', async () => {
  const spy = jest.spyOn(forecastSource, 'getTimeline').mockRejectedValueOnce(new NoDataError('sem dados'));
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  expect(
    await screen.findByText('Ainda não há previsão para esta região. Escolha outra em Trocar local, no Início.'),
  ).toBeOnTheScreen();
  spy.mockRestore();
});

it('falha de rede: erro com "Tentar de novo" que recarrega', async () => {
  const spy = jest.spyOn(forecastSource, 'getTimeline').mockRejectedValueOnce(new Error('fora do ar'));
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  await fireEvent.press(await screen.findByRole('button', { name: 'Tentar de novo' }));
  expect(await screen.findByText(/^Mostrando 24 horas/)).toBeOnTheScreen();
  spy.mockRestore();
});

it('filtro sem horas nos dados: mensagem de vazio', async () => {
  const tarde = timelines['900001'] as Timeline;
  const onlyAfternoon = { ...tarde, items: tarde.items.filter((i) => i.predictionFor === '2026-08-20T18:00:00Z') };
  const spy = jest.spyOn(forecastSource, 'getTimeline').mockResolvedValueOnce(onlyAfternoon);
  await open();
  await fireEvent.press(screen.getByRole('button', { name: 'Manhã' }));
  expect(screen.getByText('Não há previsões neste período nos dados disponíveis.')).toBeOnTheScreen();
  spy.mockRestore();
});
