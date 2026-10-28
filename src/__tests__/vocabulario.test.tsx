import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

// D26: fora da tela "Sobre", nenhum texto visível ou lido pelo leitor de tela usa termos de bastidor.
// Varre a árvore inteira da tela (textos e rótulos de acessibilidade).
jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
const announced = AccessibilityInfo.announceForAccessibility as jest.Mock;

const FORBIDDEN = [/\bAPI\b/i, /\bmodelo\b/i, /\bprobe\b/i, /\bendpoint\b/i, /\bmock\b/i, /dados salvos/i, /\bRedes\b/, /\bOK\b/, /\bRisco\b/, /\bFalha\b/];

function forbiddenOnScreen(): string[] {
  const tree = JSON.stringify(screen.toJSON());
  const spoken = announced.mock.calls.map(([s]) => String(s)).join(' ');
  return FORBIDDEN.filter((re) => re.test(tree) || re.test(spoken)).map(String);
}

beforeEach(() => announced.mockClear());

it('Início sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/' });
  await screen.findByText('Previsão mais próxima', {}, { timeout: 5000 });
  await screen.findByText(/^Nossa previsão vai só até/);
  expect(forbiddenOnScreen()).toEqual([]);
});

it('Escolher local sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/local' });
  await screen.findByRole('button', { name: 'Região de São Paulo (SP)' }, { timeout: 5000 });
  expect(forbiddenOnScreen()).toEqual([]);
});

it('Atividades (com horário escolhido) sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/atividades' });
  await fireEvent.press(await screen.findByRole('button', { name: 'Tarde: 20 de agosto, 12:00' }, { timeout: 5000 }));
  await screen.findByLabelText(/^Mandar mensagens, textos, áudios curtos: /);
  expect(forbiddenOnScreen()).toEqual([]);
});

it('Detalhes (com a seção de números e a confiança) sem termos de bastidor', async () => {
  await renderRouter('src/app', { initialUrl: '/detalhes' });
  await screen.findByLabelText('80 por cento', {}, { timeout: 5000 });
  expect(forbiddenOnScreen()).toEqual([]);
});

it('o próprio teste pega um termo proibido (a tela Sobre usa linguagem técnica de propósito)', async () => {
  await renderRouter('src/app', { initialUrl: '/sobre' });
  await screen.findByText(/^Modelo A/, {}, { timeout: 5000 });
  expect(forbiddenOnScreen().length).toBeGreaterThan(0);
});
