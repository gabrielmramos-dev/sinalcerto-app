// Paleta própria (inspirada só no estilo do protótipo da squad: azul-marinho + fundo claro).
// Todo par usado na tela está listado em contrastPairs e é verificado em contrast.test.ts.

export const colors = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  text: '#1A1C24',
  textMuted: '#4A4F5C',
  primary: '#14306B',
  onPrimary: '#FFFFFF',
  border: '#7D8394',
  focus: '#14306B',
  danger: '#A3191B',

  good: '#0F6A2E',
  goodBg: '#E2F3E7',
  moderate: '#7A4300',
  moderateBg: '#FFF0D4',
  unstable: '#A3191B',
  unstableBg: '#FDE3E3',
} as const;

export type ColorName = keyof typeof colors;

/** [frente, fundo, mínimo]. 4.5 = texto normal; 3 = texto grande, ícone ou borda. */
export const contrastPairs: [ColorName, ColorName, number][] = [
  ['text', 'background', 4.5],
  ['text', 'surface', 4.5],
  ['textMuted', 'background', 4.5],
  ['textMuted', 'surface', 4.5],
  ['primary', 'background', 4.5],
  ['primary', 'surface', 4.5],
  ['onPrimary', 'primary', 4.5],
  ['danger', 'surface', 4.5],
  ['border', 'surface', 3],
  ['border', 'background', 3],
  ['good', 'goodBg', 4.5],
  ['moderate', 'moderateBg', 4.5],
  ['unstable', 'unstableBg', 4.5],
  ['text', 'moderateBg', 4.5], // aviso "Sem conexão" (D27)
  // Ícones de qualidade também aparecem direto sobre o cartão branco.
  ['good', 'surface', 3],
  ['moderate', 'surface', 3],
  ['unstable', 'surface', 3],
];

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/** RNF09: área de toque mínima. */
export const minTouch = 48;

// Só tamanhos e pesos. Sem lineHeight fixo: com fonte ampliada (RNF05), a linha cresce junto.
export const font = {
  body: { fontSize: 16 },
  small: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 16, fontWeight: '600' },
} as const;
