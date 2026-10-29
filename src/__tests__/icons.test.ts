import { palettes } from '@/theme';
import { contrastRatio } from '@/theme/contrast';

// D38: o ícone e a tela de abertura usam as cores do tema, e o símbolo passa 3:1 (WCAG 1.4.11) sobre o fundo.
// fs via Jest, sem @types/node no projeto (como em routes.test.ts).
const { readFileSync } = jest.requireActual<{ readFileSync: (path: string, enc: 'utf8') => string }>('fs');
const script = readFileSync('scripts/build-icons.mjs', 'utf8');
const app = JSON.parse(readFileSync('app.json', 'utf8')).expo;
const constant = (name: string) => script.match(new RegExp(`const ${name} = '(#[0-9A-F]{6})'`))![1];
const splash = app.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-splash-screen')[1];

it('as cores do script e do app.json são tokens do tema', () => {
  expect(constant('BG_DARK')).toBe(palettes.dark.background);
  expect(constant('PRIMARY_DARK')).toBe(palettes.dark.primary);
  expect(constant('PRIMARY_LIGHT')).toBe(palettes.light.primary);
  expect(app.android.adaptiveIcon.backgroundColor).toBe(palettes.dark.background);
  expect(splash.backgroundColor).toBe(palettes.light.background);
  expect(splash.dark.backgroundColor).toBe(palettes.dark.background);
});

it.each([
  ['ícone e ícone adaptativo: verde escuro sobre fundo escuro', palettes.dark.primary, palettes.dark.background],
  ['tela de abertura, modo claro', palettes.light.primary, palettes.light.background],
  ['tela de abertura, modo escuro', palettes.dark.primary, palettes.dark.background],
])('%s: contraste ≥ 3:1', (_name, fg, bg) => {
  expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(3);
});
