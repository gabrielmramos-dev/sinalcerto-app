import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import { sourceStatus } from '@/data/sourceStatus';
import { ui } from '@/i18n/glossary';

// D26: fora da tela "Sobre", nenhum texto visível ou lido pelo leitor de tela usa termos de bastidor.
// Varre a árvore inteira da tela (textos e rótulos de acessibilidade).
jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
const announced = AccessibilityInfo.announceForAccessibility as jest.Mock;

const FORBIDDEN = [
  /\bAPI\b/i,
  /\bmodelo\b/i,
  /\bprobe\b/i,
  /\bendpoint\b/i,
  /\bmock\b/i,
  /dados salvos/i,
  /\bservidor\b/i, // D27: o aviso de conexão não fala em servidor
  /\bRedes\b/,
  /\bOK\b/,
  /\bRisco\b/,
  /\bFalha\b/,
];

function forbiddenOnScreen(): string[] {
  const tree = JSON.stringify(screen.toJSON());
  const spoken = announced.mock.calls.map(([s]) => String(s)).join(' ');
  return FORBIDDEN.filter((re) => re.test(tree) || re.test(spoken)).map(String);
}

beforeEach(() => announced.mockClear());

it('Início sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByText('20 de agosto, 20:00', {}, { timeout: 5000 });
  await screen.findByLabelText(/^Melhor: /); // espera a timeline (Melhor/Evite) carregar
  expect(forbiddenOnScreen()).toEqual([]);
});

it('Escolher local sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/local' });
  await screen.findByRole('button', { name: 'Região de São Paulo (SP)' }, { timeout: 5000 });
  expect(forbiddenOnScreen()).toEqual([]);
});

it('Atividades (status e uma linha aberta) sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/atividades' });
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Chamada de vídeo, às 20:00: pode falhar' }, { timeout: 5000 }),
  );
  await screen.findByLabelText(/^Melhor: /, {}, { timeout: 5000 });
  expect(forbiddenOnScreen()).toEqual([]);
});

it('Detalhes (com a seção de números e a confiança) sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  await screen.findByLabelText('80 por cento', {}, { timeout: 5000 });
  expect(forbiddenOnScreen()).toEqual([]);
});

describe('textos do aviso de conexão (D27)', () => {
  afterEach(() => act(() => sourceStatus.reset('saved-only')));

  it('carregando pela primeira vez', async () => {
    await act(() => sourceStatus.reset('unknown'));
    await renderRouter('src/app', { initialUrl: '/' });
    await screen.findByText(/^Carregando a previsão\. Na primeira vez/);
    expect(forbiddenOnScreen()).toEqual([]);
  });

  it('sem conexão (texto, botão e anúncio) e de volta (texto e anúncio)', async () => {
    await act(() => sourceStatus.markOffline());
    await renderRouter('src/app', { initialUrl: '/detalhes' });
    await screen.findByText('Sem conexão: mostrando a previsão guardada no app', {}, { timeout: 5000 });
    expect(forbiddenOnScreen()).toEqual([]);
    await act(() => sourceStatus.markOnline());
    await screen.findByText('Previsão atualizada');
    expect(announced).toHaveBeenCalled();
    expect(forbiddenOnScreen()).toEqual([]);
  });

  it('erros 400 e 422', () => {
    for (const msg of [ui.errors.badRequest, ui.errors.invalid]) {
      expect(FORBIDDEN.filter((re) => re.test(msg))).toEqual([]);
    }
  });
});

it('o próprio teste pega um termo proibido (a tela Sobre usa linguagem técnica de propósito)', async () => {
  await renderRouter('src/app', { initialUrl: '/sobre' });
  await screen.findByText(/^Modelo A/, {}, { timeout: 5000 });
  expect(forbiddenOnScreen().length).toBeGreaterThan(0);
});
