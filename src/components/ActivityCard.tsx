import { StyleSheet, Text, View } from 'react-native';

import type { Activity } from '@/api/types';
import type { CardState } from '@/hooks/useActivityChecks';
import { activity as activityText, recommendation, suitability, ui } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { AppButton } from './AppButton';
import { StatusBadge } from './StatusBadge';

interface Props {
  activity: Activity;
  state: CardState;
  onRetry: () => void;
  /** Falso quando o conselho é o mesmo para todas e já aparece uma vez acima dos cartões. */
  showAdvice: boolean;
}

/** RQ03: status vem de `suitable` e conselho de `recommendation.code`, os dois da API. */
export function ActivityCard({ activity, state, onRetry, showAdvice }: Props) {
  const { name, examples } = activityText[activity];

  if (state.status === 'error') {
    // Não agrupado: o botão precisa ser alcançável pelo leitor de tela.
    return (
      <View style={styles.card}>
        <Text style={[font.label, styles.text]}>{name}</Text>
        <Text style={[font.body, styles.error]}>{ui.activities.cardError}</Text>
        <AppButton label={ui.common.retry} a11yLabel={ui.activities.cardRetry(name)} onPress={onRetry} />
      </View>
    );
  }

  const suit = state.status === 'ok' ? suitability[`${state.data.suitable}`] : undefined;
  const advice = state.status === 'ok' && showAdvice ? recommendation[state.data.recommendation.code] : undefined;
  const spoken = suit
    ? `${name}, ${examples}: ${suit.label}.${advice ? ` ${advice}` : ''}`
    : ui.activities.cardLoadingSpoken(name);

  return (
    // Sem botão dentro: lido como um item só. Texto estático, sem dica de toque.
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View style={styles.card} accessible accessibilityLabel={spoken}>
      <Text style={[font.label, styles.text]}>{name}</Text>
      <Text style={[font.small, styles.muted]}>{examples}</Text>
      {suit ? (
        <StatusBadge tone={suit.tone} label={suit.label} />
      ) : (
        <Text style={[font.body, styles.muted]}>{ui.activities.cardLoading}</Text>
      )}
      {advice && <Text style={[font.body, styles.text]}>{advice}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  error: { color: colors.danger },
});
