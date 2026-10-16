import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import activities from '@/data/mock/activities.json';
import { clearActivityCache } from '@/hooks/useActivityChecks';

// O seletor nativo trava no Jest (não há módulo nativo aqui). Trocamos por uma View com os mesmos
// props (onChange, rótulo). O seletor de verdade é verificado à mão no iPhone (ver STATUS.md).
jest.mock('@react-native-community/datetimepicker', () => {
  // Dentro de jest.mock só dá para usar require (a fábrica roda antes dos imports do arquivo).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createElement } = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: object) => createElement(View, props),
    DateTimePickerAndroid: { open: jest.fn() },
  };
});

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
  expect(screen.getByText('Horário usado na previsão: 20 de agosto de 2026, 12:00 (horário de Brasília)')).toBeOnTheScreen();
  // D6: enviou exatamente o predictionFor da timeline (12:00 em Brasília = 15:00 UTC)
  expect(check.mock.calls.map(([r]) => r.dateTime)).toEqual(Array(6).fill('2026-08-20T15:00:00Z'));

  expect(await screen.findByLabelText('Chamada de vídeo, reuniões, aulas on-line: Pode ter problemas.')).toBeOnTheScreen();
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

  expect(screen.getByText('Horário usado na previsão: 20 de agosto de 2026, 15:00 (horário de Brasília)')).toBeOnTheScreen();
  expect(screen.getByText('Você escolheu 15:20; a previsão é por hora.')).toBeOnTheScreen();
  expect(check.mock.calls[0]?.[0].dateTime).toBe('2026-08-20T18:00:00Z');
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
