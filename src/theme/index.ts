// Tokens do SinalCerto (D11, D28). Proposta e riscos em docs/MOBILE-DESIGN.md.
// Nomes dos tokens mantidos desde o M1; valores claros e escuros seguem o tema do sistema (sem botão).
// Todo par usado na tela está em contrastPairs e é verificado nos DOIS modos em contrast.test.ts.
import { StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

export interface Palette {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  /** Único acento (verde-floresta): botões, aba ativa, foco. */
  primary: string;
  onPrimary: string;
  /** Fundo suave do acento (marca da aba ativa). Não carrega texto. */
  primarySoft: string;
  border: string;
  focus: string;
  danger: string;
  good: string;
  goodBg: string;
  moderate: string;
  moderateBg: string;
  unstable: string;
  unstableBg: string;
  /** Gradiente do cartão de topo (D29): início e fim por categoria. Só texto `text` e ícones por cima. */
  heroGoodFrom: string;
  heroGoodTo: string;
  heroModerateFrom: string;
  heroModerateTo: string;
  heroUnstableFrom: string;
  heroUnstableTo: string;
}

const light: Palette = {
  background: '#F6F5F1',
  surface: '#FFFFFF',
  text: '#17201B',
  textMuted: '#4F5A53',
  primary: '#1F6B45',
  onPrimary: '#FFFFFF',
  primarySoft: '#DDF1E4',
  border: '#7E8A82',
  focus: '#1F6B45',
  danger: '#A3261F',
  good: '#17693A',
  goodBg: '#DDF1E4',
  moderate: '#7A4500',
  moderateBg: '#FDEBCB',
  unstable: '#A3261F',
  unstableBg: '#FBE1DE',
  heroGoodFrom: '#E3F4E8',
  heroGoodTo: '#B9E2C6',
  heroModerateFrom: '#FFF1D2',
  heroModerateTo: '#F7C76E',
  heroUnstableFrom: '#FDE6E3',
  heroUnstableTo: '#F4B3AA',
};

const dark: Palette = {
  background: '#0F1512',
  surface: '#18201B',
  text: '#E9EFEA',
  textMuted: '#A7B3AB',
  primary: '#86D2A3',
  onPrimary: '#0D1A12',
  primarySoft: '#1E3A2A',
  border: '#6F7D74',
  focus: '#86D2A3',
  danger: '#FF8A80',
  good: '#7FD59D',
  goodBg: '#173A26',
  moderate: '#F3C26C',
  moderateBg: '#3A2B10',
  unstable: '#FF9A8F',
  unstableBg: '#3E1A16',
  heroGoodFrom: '#173A26',
  heroGoodTo: '#1F5234',
  heroModerateFrom: '#3A2B10',
  heroModerateTo: '#5C4314',
  heroUnstableFrom: '#3E1A16',
  heroUnstableTo: '#5E2620',
};

export const palettes = { light, dark } as const;
export type ColorName = keyof Palette;

/** [frente, fundo, mínimo]. 4.5 = texto normal; 3 = texto grande, ícone ou borda. Vale para os dois modos. */
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
  // Ícones de qualidade também aparecem direto sobre o cartão e o fundo.
  ['good', 'surface', 3],
  ['moderate', 'surface', 3],
  ['unstable', 'surface', 3],
  ['good', 'background', 3],
  ['moderate', 'background', 3],
  ['unstable', 'background', 3],
  // Cartão de topo em gradiente (D29): texto e ícone valem nos DOIS extremos de cada gradiente.
  ['text', 'heroGoodFrom', 4.5],
  ['text', 'heroGoodTo', 4.5],
  ['text', 'heroModerateFrom', 4.5],
  ['text', 'heroModerateTo', 4.5],
  ['text', 'heroUnstableFrom', 4.5],
  ['text', 'heroUnstableTo', 4.5],
  ['good', 'heroGoodFrom', 3],
  ['good', 'heroGoodTo', 3],
  ['moderate', 'heroModerateFrom', 3],
  ['moderate', 'heroModerateTo', 3],
  ['unstable', 'heroUnstableFrom', 3],
  ['unstable', 'heroUnstableTo', 3],
  // Cartões de atividade (D31): ícone no quadradinho de fundo suave; borda de selecionado sobre o fundo.
  ['primary', 'primarySoft', 3],
  // D34: "Melhor"/"Evite" e o status das atividades, em texto colorido sobre a superfície.
  ['good', 'surface', 4.5],
  ['moderate', 'surface', 4.5],
  ['unstable', 'surface', 4.5],
  // D35: hora selecionada em Detalhes (fundo suave): texto, explicações e a forma da categoria.
  ['text', 'primarySoft', 4.5],
  ['textMuted', 'primarySoft', 4.5],
  ['primary', 'primarySoft', 4.5],
  ['good', 'primarySoft', 3],
  ['moderate', 'primarySoft', 3],
  ['unstable', 'primarySoft', 3],
];

/** Cores do modo atual do sistema. */
export function useColors(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

/**
 * Estilos que dependem das cores: monta uma vez para cada modo e devolve o do modo atual.
 * Uso: const useStyles = createThemedStyles((c) => ({ ... })); dentro do componente: const styles = useStyles();
 */
// RN 0.88 (API TypeScript estrita) não exporta mais StyleSheet.NamedStyles; usamos os tipos públicos.
type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function createThemedStyles<T extends NamedStyles>(factory: (c: Palette) => T) {
  const byMode = { light: StyleSheet.create(factory(light)) as T, dark: StyleSheet.create(factory(dark)) as T };
  return function useStyles(): T {
    return byMode[useColorScheme() === 'dark' ? 'dark' : 'light'];
  };
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/** Trava de forma (D28): 8 para chips, 12 para controles e linhas, 16 para cartões, pílula para selos. */
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

/** RNF09: área de toque mínima. */
export const minTouch = 48;

/** Elevação: sombra do iOS e elevation do Android sempre juntas (sem sombra "morta" no Android). */
export const elevation = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

/** Famílias carregadas no app/_layout.tsx (expo-font). Um peso por família no Android. */
export const fonts = {
  serif: 'DMSerifDisplay_400Regular',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

// Escala de tipos. Só tamanhos e famílias; sem lineHeight fixo nos textos de corpo: com fonte
// ampliada (RNF05), a linha cresce junto. Sem fontWeight: o peso vem da família (Android).
export const font = {
  /** Destaque: a categoria no cartão do Início (E2). */
  display: { fontFamily: fonts.serif, fontSize: 40 },
  title: { fontFamily: fonts.serif, fontSize: 30 },
  heading: { fontFamily: fonts.serif, fontSize: 21 },
  label: { fontFamily: fonts.semibold, fontSize: 16 },
  body: { fontFamily: fonts.regular, fontSize: 16 },
  small: { fontFamily: fonts.medium, fontSize: 14 },
} satisfies Record<string, TextStyle>;
