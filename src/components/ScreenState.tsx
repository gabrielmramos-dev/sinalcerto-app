import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useSourceStatus } from '@/data/sourceStatus';
import { ui } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { AppButton } from './AppButton';

export type ScreenStateProps =
  | { kind: 'loading'; message?: string }
  | { kind: 'error'; message: string; onRetry: () => void }
  | { kind: 'empty'; message: string };

/** Os três estados obrigatórios de toda tela: carregando, erro e vazio. */
export function ScreenState(props: ScreenStateProps) {
  // D27: enquanto a primeira consulta não termina, avisa que pode demorar (servidor acordando).
  const firstLoad = useSourceStatus().mode === 'unknown';
  return (
    <View style={styles.box}>
      {props.kind === 'loading' && (
        <>
          <ActivityIndicator size="large" color={colors.primary} accessible={false} />
          {/* liveRegion: o TalkBack lê a mensagem quando ela aparece. */}
          <Text style={[font.body, styles.text]} accessibilityLiveRegion="polite">
            {firstLoad ? ui.source.firstLoading : (props.message ?? ui.common.loading)}
          </Text>
        </>
      )}
      {props.kind === 'error' && (
        <>
          <Text style={[font.body, styles.error]} accessibilityRole="alert" accessibilityLiveRegion="assertive">
            {props.message}
          </Text>
          <AppButton label={ui.common.retry} variant="primary" onPress={props.onRetry} />
        </>
      )}
      {props.kind === 'empty' && <Text style={[font.body, styles.text]}>{props.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  text: { color: colors.text, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
});
