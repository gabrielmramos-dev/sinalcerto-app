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

describe('O que esperar neste horário (RNF07, D23, D24, D26)', () => {
  it('sem hora escolhida: cada número vira consequência prática, sem termos de bastidor', async () => {
    await open();
    expect(screen.getByRole('header', { name: 'O que esperar neste horário' })).toBeOnTheScreen();
    expect(screen.getByText('Valores de 20 de agosto, 20:00 (horário de Brasília).')).toBeOnTheScreen();
    expect(screen.getByText(/^Nenhuma hora escolhida: mostrando a previsão mais próxima/)).toBeOnTheScreen();

    // latência: sem decimal, com consequência (a faixa "médio" de Redes escolhe a frase, mas não aparece)
    expect(screen.getByRole('header', { name: 'Tempo de resposta (latência)' })).toBeOnTheScreen();
    expect(screen.getByLabelText('73 milissegundos: as páginas podem demorar um pouco para abrir.')).toHaveTextContent(
      '73 ms: as páginas podem demorar um pouco para abrir.',
    );
    expect(screen.getByText(/O que mais atrapalha é a informação perdida\.$/)).toBeOnTheScreen();
    // perda: uma casa decimal, em "pedaços de informação", seguida da consequência
    expect(screen.getByRole('header', { name: 'Informação perdida (perda de pacotes)' })).toBeOnTheScreen();
    expect(
      screen.getByLabelText('3,9 por cento (cerca de 4 em cada 100 pedaços de informação se perdem)'),
    ).toHaveTextContent('3,9% (cerca de 4 em cada 100 pedaços de informação se perdem)');
    expect(screen.getByText('Chamadas e vídeos devem travar ou picotar.')).toBeOnTheScreen();
    // a categoria continua a da API (Regular): nada é reclassificado
    expect(screen.getAllByLabelText('Qualidade prevista: Regular').length).toBeGreaterThan(0);
    // nota (feedback da Sprint 5)
    expect(screen.getByText('63 de 100')).toBeOnTheScreen();
    expect(screen.getByText(/Para decidir, olhe a categoria/)).toBeOnTheScreen();
    // confiança: existe para esta hora
    expect(await screen.findByLabelText('80 por cento')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Confiança da previsão' })).toBeOnTheScreen();
    // o que o app não tem, não mostra; o que é bastidor foi para a tela Sobre
    expect(screen.queryByText(/jitter/i)).toBeNull();
    expect(screen.queryByText(/Redes/)).toBeNull();
    expect(screen.queryByLabelText(/equivale a/)).toBeNull();
  });

  it('hora escolhida: valores daquela hora e sem confiança (só existe para a mais próxima)', async () => {
    await open();
    await screen.findByLabelText('80 por cento');
    await fireEvent.press(screen.getByRole('button', { name: '15:00 de 20 de agosto: Instável, nota 55 de 100' }));

    expect(screen.getByText('Valores de 20 de agosto, 15:00 (horário de Brasília).')).toBeOnTheScreen();
    expect(screen.queryByText(/^Nenhuma hora escolhida/)).toBeNull();
    expect(screen.getByLabelText('86 milissegundos: as páginas podem demorar um pouco para abrir.')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('5,1 por cento (cerca de 5 em cada 100 pedaços de informação se perdem)'),
    ).toBeOnTheScreen();
    expect(screen.getByText('55 de 100')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'Confiança da previsão' })).toBeNull();
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
  expect(screen.getByText('Nossa previsão não tem horas neste período.')).toBeOnTheScreen();
  spy.mockRestore();
});
