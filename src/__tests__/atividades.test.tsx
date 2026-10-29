import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import { clearActivityCache } from '@/hooks/useActivityChecks';

// D34 (wireframe v2): lista de atividades com o status na hora selecionada do app; tocar abre Melhor/Evite.
const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
let check: jest.SpyInstance;

beforeEach(() => {
  clearActivityCache();
  announce.mockClear();
  check = jest.spyOn(forecastSource, 'checkActivity');
});
afterEach(() => check.mockRestore());

const VIDEO = 'Chamada de vídeo, às 20:00: pode falhar';

/** Abre a aba e espera os 6 status da hora selecionada (20:00); zera a contagem de chamadas. */
const open = async () => {
  await renderRouter('src/app', { initialUrl: '/atividades' });
  await screen.findByRole('button', { name: VIDEO }, { timeout: 5000 });
  await waitFor(() => expect(screen.queryAllByLabelText(/: carregando$/)).toHaveLength(0));
  check.mockClear();
  announce.mockClear();
};

it('abre na hora selecionada do app (20:00): título, 6 linhas com status em texto, e o rodapé da hora', async () => {
  await renderRouter('src/app', { initialUrl: '/atividades' });
  expect(await screen.findByRole('header', { name: 'O que você quer fazer?' }, { timeout: 5000 })).toBeOnTheScreen();
  expect(screen.getByText('Toque numa atividade para ver os melhores horários.')).toBeOnTheScreen();
  expect(await screen.findByRole('button', { name: VIDEO })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Mandar mensagens, às 20:00: funciona' })).toBeOnTheScreen();
  expect(screen.getAllByRole('button', { name: /, às 20:00: / })).toHaveLength(6);
  // Status com ícone + texto (não só a cor).
  expect(screen.getAllByText('Pode falhar').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Funciona').length).toBeGreaterThan(0);
  // D6: as 6 consultas usam o predictionFor da hora selecionada (20:00 em Brasília = 23:00 UTC).
  await waitFor(() => expect(check).toHaveBeenCalledTimes(6));
  expect(check.mock.calls.map(([r]) => r.dateTime)).toEqual(Array(6).fill('2026-08-20T23:00:00Z'));
  expect(screen.getByText('Às 20:00 (20/08)')).toBeOnTheScreen();
  // Saíram: faixa, chips, "Para quando?", seletor, períodos e grade.
  expect(screen.queryByRole('adjustable')).toBeNull();
  expect(screen.queryByText('Para quando?')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Mudar horário' })).toBeNull();
});

it('hora Instável escolhida no Início: chamada de vídeo "não deve funcionar"', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  const strip = await screen.findByRole('adjustable', {}, { timeout: 5000 });
  for (let i = 0; i < 5; i++)
    await fireEvent(strip, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
  expect(screen.getByRole('adjustable').props.accessibilityValue).toEqual({ text: '15:00 · Instável' });
  await act(() => router.navigate('/atividades'));
  expect(
    await screen.findByRole('button', { name: 'Chamada de vídeo, às 15:00: não deve funcionar' }),
  ).toBeOnTheScreen();
  expect(screen.getByText('Às 15:00 (20/08)')).toBeOnTheScreen();
});

it('tocar abre a linha: 23 consultas só dela (20:00 já no cache), no máximo 6 por vez; Melhor/Evite anunciados', async () => {
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
  expect(screen.getByRole('button', { name: VIDEO, expanded: true })).toBeOnTheScreen();
  // Carregando: indicador com nome, sem texto com reticências.
  expect(screen.getByLabelText('Carregando horários')).toBeOnTheScreen();

  const spoken = 'Melhor: das 23h às 7h. Evite: o resto do dia.';
  expect(await screen.findByLabelText(spoken, {}, { timeout: 5000 })).toBeOnTheScreen();
  expect(check).toHaveBeenCalledTimes(23);
  expect(new Set(check.mock.calls.map(([r]) => r.activity))).toEqual(new Set(['VIDEO_CALL']));
  expect(peak).toBeLessThanOrEqual(6);
  expect(announce).toHaveBeenCalledWith(`Chamada de vídeo. ${spoken}`);
});

it('uma aberta por vez; "o dia todo" / "nenhum horário"; tocar de novo fecha; voltar não consulta de novo', async () => {
  await open();
  await fireEvent.press(screen.getByRole('button', { name: VIDEO }));
  await screen.findByLabelText('Melhor: das 23h às 7h. Evite: o resto do dia.', {}, { timeout: 5000 });

  const messages = 'Mandar mensagens, às 20:00: funciona';
  await fireEvent.press(screen.getByRole('button', { name: messages }));
  expect(screen.getByRole('button', { name: VIDEO, expanded: false })).toBeOnTheScreen();
  expect(
    await screen.findByLabelText('Melhor: o dia todo. Evite: nenhum horário.', {}, { timeout: 5000 }),
  ).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: messages }));
  expect(screen.getByRole('button', { name: messages, expanded: false })).toBeOnTheScreen();

  const calls = check.mock.calls.length;
  await fireEvent.press(screen.getByRole('button', { name: VIDEO }));
  expect(await screen.findByLabelText('Melhor: das 23h às 7h. Evite: o resto do dia.')).toBeOnTheScreen();
  expect(check).toHaveBeenCalledTimes(calls); // cache (D5)
});

it('erro numa hora da linha aberta: avisa e "Tentar de novo" consulta só o que faltou', async () => {
  await open();
  check.mockRejectedValueOnce(new Error('falhou'));
  await fireEvent.press(screen.getByRole('button', { name: VIDEO }));
  expect(
    await screen.findByText('Não foi possível consultar todas as horas de Chamada de vídeo.', {}, { timeout: 5000 }),
  ).toBeOnTheScreen();
  expect(check).toHaveBeenCalledTimes(23);
  await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo: horas de Chamada de vídeo' }));
  expect(await screen.findByLabelText('Melhor: das 23h às 7h. Evite: o resto do dia.')).toBeOnTheScreen();
  expect(check).toHaveBeenCalledTimes(24);
});

it('erro no status de uma atividade: só aquela linha, com "Tentar de novo" identificado', async () => {
  check.mockImplementationOnce(() => Promise.reject(new Error('fora do ar'))); // VIDEO_CALL às 20:00
  await renderRouter('src/app', { initialUrl: '/atividades' });
  const retry = await screen.findByRole('button', { name: 'Tentar de novo: Chamada de vídeo' }, { timeout: 5000 });
  expect(screen.getByRole('button', { name: 'Chamada de vídeo, às 20:00: Sem resposta' })).toBeOnTheScreen();
  expect(await screen.findByRole('button', { name: 'Mandar mensagens, às 20:00: funciona' })).toBeOnTheScreen();
  await fireEvent.press(retry);
  expect(await screen.findByRole('button', { name: VIDEO })).toBeOnTheScreen();
  expect(announce).toHaveBeenCalledWith(expect.stringContaining('1 não puderam ser consultadas.'));
});

it('"Trocar hora" leva ao Início e põe o foco do leitor de tela na faixa', async () => {
  const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
  await open();
  await fireEvent.press(screen.getByRole('link', { name: 'Trocar hora' }));
  const strip = await screen.findByRole('adjustable');
  await waitFor(() => expect(focus).toHaveBeenCalledWith(expect.anything(), 'focus'));
  expect(strip).toBeOnTheScreen();
  focus.mockRestore();
});

it('"Às 20:00 (20/08)" e "Trocar hora" um embaixo do outro, centralizados; link com alvo de 48', async () => {
  await open();
  const box = screen.getByText('Às 20:00 (20/08)').parent!;
  expect(box.props.style).toMatchObject({ alignItems: 'center' });
  expect(box.props.style.flexDirection ?? 'column').toBe('column');
  expect(screen.getByRole('link', { name: 'Trocar hora' })).toHaveStyle({ minHeight: 48, paddingHorizontal: 0 });
});
