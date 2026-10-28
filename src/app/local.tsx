import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { forecastSource } from '@/data';
import { regionLabel } from '@/data/regions';
import { useLoad } from '@/hooks/useLoad';
import { errorMessage, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { colors, font, spacing } from '@/theme';

const t = ui.location;
const loadLocations = () => forecastSource.getLocations();

export default function ChooseLocationScreen() {
  const router = useRouter();
  const { probeId, setProbeId } = useAppState();
  const locations = useLoad(loadLocations);

  return (
    // SDK 58: no iOS 26+, o cabeçalho do Stack fica transparente; isto evita a lista passar por baixo dele.
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <SourceBanner />
      <Text style={[font.body, styles.text]}>{t.intro}</Text>
      {locations.status === 'loading' && <ScreenState kind="loading" message={t.loading} />}
      {locations.status === 'error' && (
        <ScreenState kind="error" message={errorMessage(locations.error, t.loadError)} onRetry={locations.retry} />
      )}
      {locations.status === 'ok' && locations.data.length === 0 && <ScreenState kind="empty" message={t.empty} />}
      {locations.status === 'ok' &&
        locations.data.map((l) => (
          <AppButton
            key={l.probeId}
            label={regionLabel(l.probeId)}
            hint={t.pickHint}
            selected={l.probeId === probeId}
            onPress={() => {
              setProbeId(l.probeId);
              router.back();
            }}
          />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  text: { color: colors.text, marginBottom: spacing.sm },
});
