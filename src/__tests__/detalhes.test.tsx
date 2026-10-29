import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';

// D35 (wireframe v2): "Hora a hora". Lista das 24 horas por dia; tocar abre o que esperar naquela hora.
const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
beforeEach(() => announce.mockClear());

// Linhas: o nome acessível é "HH:MM, Categoria".
const ROW = /^\d\d:\d\d, (Boa|Regular|Instável)$/;

const open = async () => {
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  await screen.findByRole('button', { name: '20:00, Regular' }, { timeout: 5000 });
};

it('topo: "Hora a hora" + região e contagem; sem filtros de período nem "Mostrando"', async () => {
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  expect(screen.getByText('Carregando as horas…')).toBeOnTheScreen();
  expect(await screen.findByRole('header', { name: 'Hora a hora' }, { timeout: 5000 })).toBeOnTheScreen();
  expect(await screen.findByText('São Paulo (SP) · 8 boas, 13 regulares, 3 instáveis')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Todas' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Madrugada' })).toBeNull();
  expect(screen.queryByText(/^Mostrando \d+ horas/)).toBeNull();
});

it('24 linhas agrupadas por dia; linha com hora e categoria, sem nota; a hora do app vem selecionada', async () => {
  await open();
  expect(screen.getAllByRole('button', { name: ROW })).toHaveLength(24);
  expect(screen.getByRole('header', { name: '19 de agosto' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: '20 de agosto' })).toBeOnTheScreen();
  // Sem nota na linha (D24/D35).
  expect(screen.queryByText(/^nota \d+/)).toBeNull();
  expect(screen.getByRole('button', { name: '20:00, Regular', selected: true, expanded: false })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: '21:00, Regular', selected: false })).toBeOnTheScreen();
});

it('tocar abre a linha (uma por vez), escolhe a hora do app e anuncia', async () => {
  await open();
  await fireEvent.press(screen.getByRole('button', { name: '15:00, Instável' }));
  expect(screen.getByRole('button', { name: '15:00, Instável', expanded: true, selected: true })).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith(
    'Horário escolhido: 20 de agosto, 15:00, Instável. Vale também para a aba Atividades.',
  );

  await fireEvent.press(screen.getByRole('button', { name: '01:00, Boa' }));
  expect(screen.getByRole('button', { name: '15:00, Instável', expanded: false })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: '01:00, Boa', expanded: true })).toBeOnTheScreen();
  expect(screen.getAllByRole('header', { name: 'O que esperar neste horário' })).toHaveLength(1);

  // Tocar na aberta fecha; a hora escolhida continua.
  await fireEvent.press(screen.getByRole('button', { name: '01:00, Boa' }));
  expect(screen.getByRole('button', { name: '01:00, Boa', expanded: false, selected: true })).toBeOnTheScreen();

  await act(() => router.navigate('/atividades'));
  expect(await screen.findByText('Às 01:00 (20/08)')).toBeOnTheScreen();
});

describe('O que esperar neste horário (RNF07, D23, D24, D35)', () => {
  it('uma linha por métrica (nome, valor e efeito), lidas em ordem; nota e confiança secundárias no fim', async () => {
    await open();
    await fireEvent.press(screen.getByRole('button', { name: '20:00, Regular' }));

    expect(screen.getByText('Tempo de resposta · 73 ms')).toBeOnTheScreen();
    expect(screen.getByText('Informação perdida · 3,9%')).toBeOnTheScreen();
    const latency = 'Tempo de resposta: 73 milissegundos. As páginas podem demorar um pouco para abrir.';
    const loss = 'Informação perdida: 3,9 por cento. Chamadas e vídeos devem travar ou picotar.';
    const score = 'Nota 63 de 100. Confiança 80 por cento';
    // A confiança vem de outra consulta (D24) e pode chegar depois da lista.
    expect(await screen.findByLabelText(score)).toBeOnTheScreen();
    expect(screen.getByText('Nota 63 de 100 · Confiança 80%')).toBeOnTheScreen();

    // Ordem de leitura: tempo de resposta, informação perdida, nota e confiança.
    const tree = JSON.stringify(screen.toJSON());
    const order = [latency, loss, score].map((s) => tree.indexOf(s));
    expect(order.every((p) => p >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);

    // Nada de bastidor: sem jitter, Redes ou equivalências.
    expect(screen.queryByText(/jitter/i)).toBeNull();
    expect(screen.queryByText(/Redes/)).toBeNull();
  });

  it('explicação só sob demanda: "O que é isso?" (48 dp) abre e fecha o texto longo', async () => {
    await open();
    await fireEvent.press(screen.getByRole('button', { name: '20:00, Regular' }));
    expect(screen.queryByText(/^Tempo que a informação leva para ir e voltar/)).toBeNull();

    const what = screen.getByRole('button', { name: 'O que é isso? Tempo de resposta', expanded: false });
    // Na mesma linha do nome e do valor; o alvo de 48 vem do hitSlop (texto de ~20 + 14 + 14), sem vão.
    expect(screen.getByText('Tempo de resposta · 73 ms').parent!.props.style).toMatchObject({
      flexDirection: 'row',
      justifyContent: 'space-between',
    });
    expect(what.props.hitSlop).toEqual({ top: 14, bottom: 14, left: 8, right: 8 });
    await fireEvent.press(what);
    expect(screen.getByText(/^Tempo que a informação leva para ir e voltar/)).toBeOnTheScreen();
    expect(screen.getByText(/O que mais atrapalha é a informação perdida\.$/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'O que é isso? Informação perdida' }));
    expect(screen.getByText('Cerca de 4 em cada 100 pedaços de informação se perdem.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'O que é isso? Nota e confiança' }));
    expect(screen.getByText(/^Uma nota geral desta hora, de 0 a 100\..*olhe a categoria/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'O que é isso? Tempo de resposta', expanded: true }));
    expect(screen.queryByText(/^Tempo que a informação leva para ir e voltar/)).toBeNull();
  });

  it('outra hora: valores dela e sem confiança (só existe para a hora da previsão mais próxima)', async () => {
    await open();
    await fireEvent.press(screen.getByRole('button', { name: '15:00, Instável' }));
    expect(screen.getByText('Tempo de resposta · 86 ms')).toBeOnTheScreen();
    expect(screen.getByText('Informação perdida · 5,1%')).toBeOnTheScreen();
    expect(screen.getByText('Nota 55 de 100')).toBeOnTheScreen();
    expect(screen.queryByText(/Confiança/)).toBeNull();
  });
});

it('link "Sobre o SinalCerto" no fim', async () => {
  await open();
  expect(screen.getByRole('link', { name: 'Sobre o SinalCerto' })).toBeOnTheScreen();
});

it('sem dados (404): estado vazio com orientação', async () => {
  const spy = jest.spyOn(forecastSource, 'getTimeline').mockRejectedValueOnce(new NoDataError('sem dados'));
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  expect(
    await screen.findByText('Ainda não há previsão para esta região. Escolha outra no botão Trocar, no Início.'),
  ).toBeOnTheScreen();
  spy.mockRestore();
});

it('falha de rede: erro com "Tentar de novo" que recarrega', async () => {
  const spy = jest.spyOn(forecastSource, 'getTimeline').mockRejectedValueOnce(new Error('fora do ar'));
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  await fireEvent.press(await screen.findByRole('button', { name: 'Tentar de novo' }));
  expect(await screen.findByRole('button', { name: '20:00, Regular' })).toBeOnTheScreen();
  spy.mockRestore();
});
