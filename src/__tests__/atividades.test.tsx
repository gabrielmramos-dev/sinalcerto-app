import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import activities from '@/data/mock/activities.json';
import { clearActivityCache } from '@/hooks/useActivityChecks';

// O seletor nativo é trocado por um substituto em jest.setup.ts.
const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
let check: jest.SpyInstance;

beforeEach(() => {
  clearActivityCache();
  announce.mockClear();
  check = jest.spyOn(forecastSource, 'checkActivity');
});
afterEach(() => check.mockRestore());

const open = async () => {
  await renderRouter('src/app', { initialUrl: '/atividades' });
  await screen.findByText('Ou escolha a melhor hora de um período:', {}, { timeout: 5000 });
};

it('antes de escolher o horário: estado vazio e nenhuma chamada (D5)', async () => {
  await open();
  expect(screen.getByText('Escolha um horário para ver o que dá para fazer.')).toBeOnTheScreen();
  expect(check).not.toHaveBeenCalled();
});

it('os 4 períodos mostram a data completa da melhor hora (D17)', async () => {
  await open();
  for (const name of [
    'Madrugada: 20 de agosto, 00:00',
    'Manhã: 20 de agosto, 06:00',
    'Tarde: 20 de agosto, 12:00',
    'Noite: 19 de agosto, 23:00',
  ]) {
    expect(screen.getByRole('button', { name })).toBeOnTheScreen();
  }
});

it('período escolhido: horário usado, 6 cartões da API e anúncio (RQ03, RQ04, D6)', async () => {
  await open();
  await fireEvent.press(screen.getByRole('button', { name: 'Tarde: 20 de agosto, 12:00' }));

  expect(screen.getByRole('button', { name: 'Tarde: 20 de agosto, 12:00', selected: true })).toBeOnTheScreen();
  expect(
    screen.getByText('Horário usado na previsão: 20 de agosto de 2026, 12:00 (horário de Brasília)'),
  ).toBeOnTheScreen();
  // D6: enviou exatamente o predictionFor da timeline (12:00 em Brasília = 15:00 UTC)
  expect(check.mock.calls.map(([r]) => r.dateTime)).toEqual(Array(6).fill('2026-08-20T15:00:00Z'));

  expect(
    await screen.findByLabelText('Chamada de vídeo, reuniões, aulas on-line: Pode ter problemas.'),
  ).toBeOnTheScreen();
  expect(screen.getByLabelText('Mandar mensagens, textos, áudios curtos: Deve funcionar.')).toBeOnTheScreen();
  expect(screen.getByText(/^Dica para este horário: /)).toBeOnTheScreen();

  const saved = activities.byProbe['900001']['2026-08-20T15:00:00Z'];
  const good = Object.values(saved).filter(([suitable]) => suitable).length;
  expect(announce).toHaveBeenCalledWith(`Horário usado: 20 de agosto, 12:00. ${good} de 6 atividades devem funcionar.`);
});

it('seletor do iPhone: 15:20 vira 15:00 e a tela avisa (D6, D18)', async () => {
  await open();
  await fireEvent.press(screen.getByRole('button', { name: 'Mudar horário' }));
  const picked = new Date();
  picked.setHours(15, 20, 0, 0);
  await fireEvent(screen.getByLabelText('Hora da atividade'), 'onChange', { type: 'set' }, picked);
  await fireEvent.press(screen.getByRole('button', { name: 'Usar este horário' }));

  expect(
    screen.getByText('Horário usado na previsão: 20 de agosto de 2026, 15:00 (horário de Brasília)'),
  ).toBeOnTheScreen();
  expect(screen.getByText('Você escolheu 15:20; a previsão é por hora.')).toBeOnTheScreen();
  expect(check.mock.calls[0]?.[0].dateTime).toBe('2026-08-20T18:00:00Z');
});

it('tocar num período com o seletor aberto fecha o seletor; ao reabrir, ele está no horário usado', async () => {
  await open();
  await fireEvent.press(screen.getByRole('button', { name: 'Mudar horário' }));
  const draft = new Date();
  draft.setHours(9, 0, 0, 0);
  await fireEvent(screen.getByLabelText('Hora da atividade'), 'onChange', { type: 'set' }, draft);

  await fireEvent.press(screen.getByRole('button', { name: 'Tarde: 20 de agosto, 12:00' }));
  expect(screen.queryByLabelText('Hora da atividade')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Usar este horário' })).toBeNull();
  expect(
    screen.getByText('Horário usado na previsão: 20 de agosto de 2026, 12:00 (horário de Brasília)'),
  ).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: 'Mudar horário' }));
  expect(screen.getByLabelText('Hora da atividade').props.value.getHours()).toBe(12);
});

it('aviso "Você escolheu 15:20" some quando o horário muda na aba Detalhes', async () => {
  await open();
  await fireEvent.press(screen.getByRole('button', { name: 'Mudar horário' }));
  const picked = new Date();
  picked.setHours(15, 20, 0, 0);
  await fireEvent(screen.getByLabelText('Hora da atividade'), 'onChange', { type: 'set' }, picked);
  await fireEvent.press(screen.getByRole('button', { name: 'Usar este horário' }));
  expect(screen.getByText('Você escolheu 15:20; a previsão é por hora.')).toBeOnTheScreen();

  await act(() => router.navigate('/detalhes'));
  await fireEvent.press(await screen.findByLabelText('18:00 de 20 de agosto: Regular, nota 58 de 100'));
  await act(() => router.navigate('/atividades'));

  expect(
    screen.getByText('Horário usado na previsão: 20 de agosto de 2026, 18:00 (horário de Brasília)'),
  ).toBeOnTheScreen();
  expect(screen.queryByText(/Você escolheu/)).toBeNull();
});

it('erro em uma atividade: só aquele cartão, com "Tentar de novo" identificado', async () => {
  check.mockImplementationOnce(() => Promise.reject(new Error('fora do ar'))); // VIDEO_CALL
  await open();
  await fireEvent.press(screen.getByRole('button', { name: 'Manhã: 20 de agosto, 06:00' }));
  const retry = await screen.findByRole('button', { name: 'Tentar de novo: Chamada de vídeo' });
  expect(await screen.findByLabelText(/^Mandar mensagens, textos, áudios curtos: /)).toBeOnTheScreen();

  await fireEvent.press(retry);
  expect(await screen.findByLabelText(/^Chamada de vídeo, reuniões, aulas on-line: /)).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith(expect.stringContaining('1 não puderam ser consultadas.'));
});

describe('E3: planejador (D31)', () => {
  const VIDEO = /^Chamada de vídeo, reuniões, aulas on-line/;

  it('título em serifa como cabeçalho; sem tocar numa atividade, o planejador não consulta nada', async () => {
    await open();
    expect(screen.getByRole('header', { name: 'Atividades' })).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Toque numa atividade abaixo para ver no relógio as horas em que ela deve funcionar.'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: VIDEO, selected: true })).toBeNull();
    expect(screen.getByRole('button', { name: VIDEO, selected: false })).toBeOnTheScreen();
    expect(check).not.toHaveBeenCalled();
  });

  it('tocar numa atividade: 24 consultas só dela, no máximo 6 ao mesmo tempo, frase anunciada e ✓ selecionado', async () => {
    let inFlight = 0;
    let peak = 0;
    check.mockRestore();
    const original = forecastSource.checkActivity.bind(forecastSource);
    check = jest.spyOn(forecastSource, 'checkActivity').mockImplementation(async (req) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 1));
      try {
        return await original(req);
      } finally {
        inFlight--;
      }
    });
    await open();
    await fireEvent.press(screen.getByRole('button', { name: VIDEO }));

    const sentence = 'Chamada de vídeo: melhor das 23h às 7h';
    expect(await screen.findByLabelText(sentence, {}, { timeout: 5000 })).toBeOnTheScreen();
    expect(check).toHaveBeenCalledTimes(24);
    expect(new Set(check.mock.calls.map(([r]) => r.activity))).toEqual(new Set(['VIDEO_CALL']));
    expect(new Set(check.mock.calls.map(([r]) => r.dateTime)).size).toBe(24);
    expect(peak).toBeLessThanOrEqual(6);
    expect(announce).toHaveBeenCalledWith(sentence);
    expect(screen.getByRole('button', { name: VIDEO, selected: true })).toBeOnTheScreen();
    expect(screen.getByLabelText(sentence)).toBeOnTheScreen(); // grupo do relógio lido pela frase
  });

  it('cache (D5): as horas já consultadas não saem de novo; voltar a uma atividade não consulta nada', async () => {
    await open();
    await fireEvent.press(screen.getByRole('button', { name: 'Tarde: 20 de agosto, 12:00' }));
    await screen.findByLabelText('Chamada de vídeo, reuniões, aulas on-line: Pode ter problemas.');
    expect(check).toHaveBeenCalledTimes(6);

    await fireEvent.press(screen.getByRole('button', { name: VIDEO }));
    await screen.findByLabelText('Chamada de vídeo: melhor das 23h às 7h', {}, { timeout: 5000 });
    expect(check).toHaveBeenCalledTimes(6 + 23); // 12:00 já estava no cache

    await fireEvent.press(screen.getByRole('button', { name: /^Mandar mensagens,/ }));
    expect(
      await screen.findByLabelText(
        'Mandar mensagens: deve funcionar em todas as horas da previsão',
        {},
        { timeout: 5000 },
      ),
    ).toBeOnTheScreen();
    const calls = check.mock.calls.length;
    await fireEvent.press(screen.getByRole('button', { name: VIDEO }));
    expect(await screen.findByLabelText('Chamada de vídeo: melhor das 23h às 7h')).toBeOnTheScreen();
    expect(check).toHaveBeenCalledTimes(calls);
  });

  it('erro numa hora: avisa, oferece "Tentar de novo" identificado e completa depois', async () => {
    check.mockRejectedValueOnce(new Error('falhou'));
    await open();
    await fireEvent.press(screen.getByRole('button', { name: VIDEO }));
    expect(
      await screen.findByLabelText(
        'Não foi possível consultar todas as horas de Chamada de vídeo.',
        {},
        { timeout: 5000 },
      ),
    ).toBeOnTheScreen();
    expect(check).toHaveBeenCalledTimes(24);

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo: horas de Chamada de vídeo' }));
    expect(
      await screen.findByLabelText('Chamada de vídeo: melhor das 23h às 7h', {}, { timeout: 5000 }),
    ).toBeOnTheScreen();
    expect(check).toHaveBeenCalledTimes(25); // só a hora que faltava
  });
});
