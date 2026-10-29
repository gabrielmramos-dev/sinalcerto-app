import { Text, View } from 'react-native';

import { ui } from '@/i18n/glossary';
import { createThemedStyles, font, spacing } from '@/theme';

/**
 * D34: "Melhor" (verde) e "Evite" (vermelho), em duas linhas com divisória. A palavra escrita carrega o
 * sentido, a cor só reforça (RNF03); as duas cores passam 4,5:1 sobre a superfície nos dois modos.
 * Lido como um item só.
 */
export function BestAvoid({ best, avoid }: { best: string; avoid: string }) {
  const styles = useStyles();
  return (
    // Texto estático, sem dica de toque.
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View accessible accessibilityLabel={ui.hours.spoken(best, avoid)}>
      <View style={styles.row}>
        <Text style={[font.label, styles.good]}>{ui.hours.best}</Text>
        <Text style={[font.body, styles.text, styles.grow]}>{best}</Text>
      </View>
      <View style={[styles.row, styles.divider]}>
        <Text style={[font.label, styles.bad]}>{ui.hours.avoid}</Text>
        <Text style={[font.body, styles.text, styles.grow]}>{avoid}</Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((c) => ({
  // flexWrap: com texto grande, o valor desce para baixo da palavra em vez de cortar (RNF05).
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.border },
  grow: { flexShrink: 1 },
  good: { color: c.good, minWidth: 56 },
  bad: { color: c.unstable, minWidth: 56 },
  text: { color: c.text },
}));
