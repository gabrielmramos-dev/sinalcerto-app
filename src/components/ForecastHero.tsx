import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { Quality } from '@/api/types';
import { quality, type Tone } from '@/i18n/glossary';
import { createThemedStyles, font, radius, spacing, useColors, type Palette } from '@/theme';
import { SignalBars } from './SignalBars';
import { StatusIcon } from './StatusIcon';

const STOPS: Record<Tone, [keyof Palette, keyof Palette]> = {
  good: ['heroGoodFrom', 'heroGoodTo'],
  moderate: ['heroModerateFrom', 'heroModerateTo'],
  unstable: ['heroUnstableFrom', 'heroUnstableTo'],
};

interface Props {
  /** Linha pequena acima da categoria (D34: a data e a hora selecionadas). */
  title?: string;
  value: Quality;
  lines: string[];
  /** Notas menores, abaixo da frase. */
  notes?: string[];
  /** Tudo o que o cartão diz, numa frase só, na ordem da tela (RNF02, RNF08). */
  spoken: string;
}

/**
 * D29: o único gradiente do app. Categoria em texto + forma + cor + barras (RNF03). Todo texto usa
 * `text`, que passa 4,5:1 nos dois extremos do gradiente, nos dois modos (contrast.test.ts).
 */
export function ForecastHero({ title, value, lines, notes = [], spoken }: Props) {
  const styles = useStyles();
  const c = useColors();
  const tone = quality[value].tone;
  const [from, to] = STOPS[tone];
  return (
    // Lido como um item só. Texto estático, sem dica de toque.
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View style={styles.card} accessible accessibilityLabel={spoken}>
      <Svg style={StyleSheet.absoluteFill} accessible={false} importantForAccessibility="no-hide-descendants">
        <Defs>
          <LinearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c[from]} />
            <Stop offset="1" stopColor={c[to]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hero)" />
      </Svg>
      {title && <Text style={[font.small, styles.text]}>{title}</Text>}
      <View style={styles.row}>
        <StatusIcon tone={tone} size={34} />
        <Text style={[font.display, styles.text, styles.category]}>{quality[value].label}</Text>
        <SignalBars tone={tone} />
      </View>
      {lines.map((l) => (
        <Text key={l} style={[font.body, styles.text]}>
          {l}
        </Text>
      ))}
      {notes.map((n) => (
        <Text key={n} style={[font.small, styles.text]}>
          {n}
        </Text>
      ))}
    </View>
  );
}

const useStyles = createThemedStyles((c) => ({
  card: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, overflow: 'hidden' },
  // flexWrap: com texto no máximo, a categoria e as barras descem de linha em vez de cortar (RNF05).
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  category: { flexShrink: 1 },
  text: { color: c.text },
}));
