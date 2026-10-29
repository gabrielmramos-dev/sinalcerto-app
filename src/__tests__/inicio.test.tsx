import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';

// Usa as rotas de verdade de src/app (layout, abas e modal) com a MockSource.
const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

beforeEach(() => announce.mockClear());

const CARD = '20 de agosto, 20:00. Qualidade prevista: Regular. Pode ficar lenta ou dar pequenas pausas.';
const BEST = 'Melhor: das 23h às 7h · Boa. Evite: das 15h às 18h · Instável.';

describe('D34 (wireframe v2): Início, "como está a internet?"', () => {
  it('abre com a última hora (20/08 20:00) selecionada; cartão com data em cima, categoria e frase; anuncia', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    expect(screen.getByText('Carregando a previsão…')).toBeOnTheScreen();
    expect(await screen.findByLabelText(CARD)).toBeOnTheScreen();
    expect(screen.getByText('20 de agosto, 20:00')).toBeOnTheScreen();
    expect(screen.getByRole('adjustable').props.accessibilityValue).toEqual({ text: '20:00 · Regular' });
    expect(announce).toHaveBeenCalledWith(`Região escolhida: São Paulo (SP). ${CARD}`);
  });

  it('sem título grande nem título da faixa nem contagem (contagem vai para Detalhes)', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    await screen.findByLabelText(CARD);
    expect(screen.queryByRole('header', { name: 'SinalCerto' })).toBeNull();
    expect(screen.queryByText('Previsão de 19 e 20 de agosto')).toBeNull();
    expect(screen.queryByText(/horas boas/)).toBeNull();
    expect(screen.queryByText('Melhor momento do dia')).toBeNull();
  });

  it('mudar a seleção na faixa muda o cartão (uma resposta só na tela)', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    const strip = await screen.findByRole('adjustable');
    // 20:00 → 01:00 (Boa): 19 passos para trás, como o VoiceOver faria deslizando.
    for (let i = 0; i < 19; i++)
      await fireEvent(strip, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(screen.getByRole('adjustable').props.accessibilityValue).toEqual({ text: '01:00 · Boa' });
    expect(
      screen.getByLabelText('20 de agosto, 01:00. Qualidade prevista: Boa. A internet deve funcionar sem travar.'),
    ).toBeOnTheScreen();
  });

  it('a hora escolhida na faixa vale para o app inteiro', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Hora anterior' }));
    expect(screen.getByRole('adjustable').props.accessibilityValue).toEqual({ text: '19:00 · Regular' });
    await act(() => router.navigate('/atividades'));
    expect(await screen.findByText('Às 19:00 (20/08)')).toBeOnTheScreen();
  });

  it('região curta com o botão compacto "Trocar" (nome completo para o leitor de tela)', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('São Paulo (SP)')).toBeOnTheScreen();
    expect(screen.getByLabelText('Região escolhida: São Paulo (SP)')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Trocar local' })).toHaveTextContent('Trocar');
  });

  it('Melhor/Evite em duas linhas, lidos como um item; faixa com a data à esquerda; sem imagem solta', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByLabelText(BEST)).toBeOnTheScreen();
    expect(screen.getByText('19 e 20 de agosto', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByText('20:00 · Regular', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('botão "O que dá para fazer?" e aviso em uma linha com "Saiba mais" para a tela Sobre', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByRole('button', { name: 'O que dá para fazer?' })).toBeOnTheScreen();
    expect(screen.getByText('É uma estimativa e pode errar.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ver todas as horas' })).toBeNull();

    await fireEvent.press(screen.getByRole('link', { name: 'Saiba mais sobre a estimativa' }));
    expect(await screen.findByRole('header', { name: 'É uma estimativa' })).toBeOnTheScreen();
    expect(
      screen.getByText(/^É uma estimativa feita a partir de como a internet se comportou antes/),
    ).toBeOnTheScreen();
    expect(screen.getByText(/^A previsão vale para a região escolhida/)).toBeOnTheScreen();
  });

  it('ordem de leitura: região, cartão, faixa, Melhor/Evite, botão, aviso', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    await screen.findByLabelText(BEST);
    const tree = JSON.stringify(screen.toJSON());
    const order = [
      'Região escolhida: São Paulo (SP)',
      CARD,
      'Faixa do dia, hora a hora',
      BEST,
      'O que dá para fazer?',
      'É uma estimativa e pode errar.',
    ].map((x) => tree.indexOf(x));
    expect(order.every((pos) => pos >= 0)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
  });
});

it('sem dados (404) mostra vazio com orientação, não erro', async () => {
  const spy = jest.spyOn(forecastSource, 'getTimeline').mockRejectedValueOnce(new NoDataError('sem dados'));
  await renderRouter('src/app', { initialUrl: '/' });
  expect(
    await screen.findByText('Ainda não há previsão para esta região. Escolha outra no botão Trocar.'),
  ).toBeOnTheScreen();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull();
  spy.mockRestore();
});

it('trocar o local recarrega e anuncia a nova região (D7)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByLabelText(CARD);

  await fireEvent.press(screen.getByRole('button', { name: 'Trocar local' }));
  expect(await screen.findByRole('button', { name: 'São Paulo (SP)', selected: true })).toBeOnTheScreen();

  announce.mockClear();
  await fireEvent.press(screen.getByRole('button', { name: 'Manaus (AM)' }));
  expect(await screen.findByText('Manaus (AM)')).toBeOnTheScreen();
  await screen.findByRole('adjustable'); // a faixa da região nova carregou
  expect(announce).toHaveBeenCalledWith(expect.stringMatching(/^Região escolhida: Manaus \(AM\)\. /));
});

it('tela Sobre: bastidores com linguagem técnica (D26)', async () => {
  await renderRouter('src/app', { initialUrl: '/sobre' });
  expect(
    await screen.findByText(/^Modelo A \(Grupo 1, Regressão Linear \(Linear Regression\), versão 1\.0\)/),
  ).toBeOnTheScreen();
  expect(
    screen.getByText(/^A previsão disponível vai de 19 de agosto de 2026, 21:00 a 20 de agosto de 2026, 20:00/),
  ).toBeOnTheScreen();
  expect(screen.getAllByText(/RIPE Atlas/).length).toBeGreaterThan(0); // origem e regiões
  expect(screen.getByLabelText('Regular, no app, equivale a Risco, em Redes')).toBeOnTheScreen();
  expect(
    screen.getByText(/^Latência \(RTT médio previsto\): excelente, menos de 20 ms; bom, 20 a 50 ms/),
  ).toBeOnTheScreen();
  expect(screen.getByText(/^Jitter: estável, menos de 20 ms/)).toBeOnTheScreen();
});

it('aviso e "Saiba mais" um embaixo do outro, centralizados; "Saiba mais" com alvo de 48', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  const link = await screen.findByRole('link', { name: 'Saiba mais sobre a estimativa' });
  const box = screen.getByText('É uma estimativa e pode errar.').parent!;
  expect(box.props.style).toMatchObject({ alignItems: 'center' });
  expect(box.props.style.flexDirection ?? 'column').toBe('column');
  expect(link).toHaveStyle({ minHeight: 48, paddingHorizontal: 0 });
});
