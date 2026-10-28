import { StyleSheet, Text, View } from 'react-native';

import { sourceStatus, useSourceStatus } from '@/data/sourceStatus';
import { ui } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { AppButton } from './AppButton';

/**
 * D27: aviso discreto da fonte, no topo de todas as telas. O anúncio para o leitor de tela sai de
 * sourceStatus (uma vez por mudança), não daqui, para não repetir em cada tela aberta.
 */
export function SourceBanner() {
  const { mode } = useSourceStatus();
  if (mode === 'unknown') return null;

  if (mode === 'offline') {
    return (
      <View style={[styles.box, styles.offline]}>
        <Text style={[font.body, styles.text]}>{ui.source.offline}</Text>
        <AppButton
          label={ui.source.retry}
          a11yLabel={ui.source.retryA11y}
          hint={ui.source.retryHint}
          onPress={sourceStatus.retry}
        />
      </View>
    );
  }

  return (
    <Text style={[font.small, styles.muted]}>{mode === 'online' ? ui.source.online : ui.source.savedOnly}</Text>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.sm, padding: spacing.md, borderRadius: 12, borderWidth: 1 },
  offline: { backgroundColor: colors.moderateBg, borderColor: colors.border },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
