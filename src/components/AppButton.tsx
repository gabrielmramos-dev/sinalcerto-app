import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, font, minTouch, spacing } from '@/theme';

interface Props {
  label: string;
  /** Nome para o leitor de tela quando o rótulo visível se repete na tela. Deve começar pelo rótulo (WCAG 2.5.3). */
  a11yLabel?: string;
  onPress: () => void;
  /** O que acontece ao tocar, quando não for óbvio pelo rótulo (lido pelo leitor de tela). */
  hint?: string;
  variant?: 'primary' | 'secondary';
  /** Para botões que funcionam como opção (ex.: período do dia). */
  selected?: boolean;
  disabled?: boolean;
}

export function AppButton({ label, a11yLabel, onPress, hint, variant = 'secondary', selected, disabled }: Props) {
  const primary = variant === 'primary' || selected;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled, selected }}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {/* Sem numberOfLines: o rótulo quebra linha em vez de ser cortado (RNF05). */}
      <Text style={[font.label, { color: primary ? colors.onPrimary : colors.primary }]}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouch,
    minWidth: minTouch,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.primary },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
