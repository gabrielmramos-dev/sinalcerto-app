import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

// D36: Escolher local (modal) e Sobre no padrão do wireframe v2.
jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

describe('Escolher local (modal)', () => {
  it('título em serifa como cabeçalho e "Fechar" visível (48 dp), que recebe o foco do leitor de tela ao abrir', async () => {
    const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
    await renderRouter('src/app', { initialUrl: '/local' });
    expect(screen.getByRole('header', { name: 'Escolher local' })).toBeOnTheScreen();
    const close = screen.getByRole('button', { name: 'Fechar' });
    expect(close).toHaveStyle({ minHeight: 48 });
    await waitFor(() => expect(focus).toHaveBeenCalledWith(expect.anything(), 'focus'), { timeout: 2000 });
    focus.mockRestore();
  });

  it('regiões numa lista (linhas de 48 dp), com ✓ e estado selecionado na região atual', async () => {
    await renderRouter('src/app', { initialUrl: '/local' });
    const current = await screen.findByRole('button', { name: 'São Paulo (SP)', selected: true }, { timeout: 5000 });
    expect(current).toHaveStyle({ minHeight: 48 });
    expect(screen.getAllByRole('button', { name: /\([A-Z]{2}\)$/ })).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Manaus (AM)', selected: false })).toBeOnTheScreen();
  });

  it('"Fechar" volta sem trocar a região', async () => {
    await renderRouter('src/app', { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Trocar local' }, { timeout: 5000 }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Fechar' }));
    expect(await screen.findByText('São Paulo (SP)')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'Escolher local' })).toBeNull();
  });
});

describe('Sobre', () => {
  it('título em serifa no conteúdo; seções na ordem, como cabeçalhos', async () => {
    await renderRouter('src/app', { initialUrl: '/sobre' });
    expect(screen.getByRole('header', { name: 'Sobre o SinalCerto' })).toBeOnTheScreen();
    await screen.findByText(/^Modelo A/, {}, { timeout: 5000 });
    const headers = screen.getAllByRole('header').map((h) => h.props.children);
    expect(headers.slice(0, 4)).toEqual([
      'Sobre o SinalCerto',
      'É uma estimativa',
      'De onde vêm os dados',
      expect.any(String),
    ]);
  });
});

it('a região com ✓ no modal é sempre a mostrada no Início (Belo Horizonte, reabrindo o modal)', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await fireEvent.press(await screen.findByRole('button', { name: 'Trocar local' }, { timeout: 5000 }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Belo Horizonte (MG)' }));
  expect(await screen.findByText('Belo Horizonte (MG)')).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: 'Trocar local' }));
  expect(await screen.findByRole('button', { name: 'Belo Horizonte (MG)', selected: true })).toBeOnTheScreen();
  const regions = screen.getAllByRole('button', { name: /\([A-Z]{2}\)$/ });
  expect(regions.filter((b) => b.props.accessibilityState?.selected)).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'São Paulo (SP)', selected: false })).toBeOnTheScreen();
});

it('voltar da tela Sobre diz "Voltar"; nenhum nome interno de rota ("(tabs)") na tela', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await fireEvent.press(await screen.findByRole('link', { name: 'Saiba mais sobre a estimativa' }, { timeout: 5000 }));
  await screen.findByText(/^Modelo A/, {}, { timeout: 5000 });
  // O id interno da tela ("(tabs):0-0") não é visível nem lido; títulos e o voltar, sim.
  const tree = JSON.stringify(screen.toJSON()).replace(/"screenId":"[^"]*"/g, '');
  expect(tree).not.toContain('(tabs)');
  expect(tree).toContain('"backTitle":"Voltar"');
});
