import { StyleSheet, Text, View } from 'react-native';

import type { Quality } from '@/api/types';
import { quality, type Tone } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { StatusIcon } from './StatusIcon';

interface Props {
  tone: Tone;
  label: string;
  /** Contexto só para o leitor de tela, ex.: "Qualidade prevista". */
  context?: string;
}

/** Texto + ícone + cor sempre juntos (RNF03). Lido como um único item. */
export function StatusBadge({ tone, label, context }: Props) {
  return (
    // Texto estático, não é controle: uma dica ("toque para...") enganaria o leitor de tela.
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={context ? `${context}: ${label}` : label}
      style={[styles.badge, { backgroundColor: colors[`${tone}Bg`] }]}
    >
      <StatusIcon tone={tone} />
      <Text style={[font.label, styles.text, { color: colors[tone] }]}>{label}</Text>
    </View>
  );
}

export function QualityBadge({ value }: { value: Quality }) {
  const q = quality[value];
  return <StatusBadge tone={q.tone} label={q.label} context="Qualidade prevista" />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  text: { flexShrink: 1 },
});
