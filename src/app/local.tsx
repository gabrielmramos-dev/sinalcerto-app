import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { forecastSource } from '@/data';
import { regionLabel } from '@/data/regions';
import { useLoad } from '@/hooks/useLoad';
import { useAppState } from '@/state/AppState';
import { colors, font, spacing } from '@/theme';

const loadLocations = () => forecastSource.getLocations();

export default function ChooseLocationScreen() {
  const router = useRouter();
  const { probeId, setProbeId } = useAppState();
  const locations = useLoad(loadLocations);

  return (
    // SDK 58: no iOS 26+, o cabeçalho do Stack fica transparente; isto evita a lista passar por baixo dele.
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Text style={[font.body, styles.text]}>
        A previsão é de um ponto de referência da rede nesta região, não do seu celular. O app não usa a sua
        localização.
      </Text>
      {locations.status === 'loading' && <ScreenState kind="loading" message="Carregando as regiões…" />}
      {locations.status === 'error' && (
        <ScreenState kind="error" message="Não foi possível carregar as regiões." onRetry={locations.retry} />
      )}
      {locations.status === 'ok' && locations.data.length === 0 && (
        <ScreenState kind="empty" message="Nenhuma região disponível no momento." />
      )}
      {locations.status === 'ok' &&
        locations.data.map((l) => (
          <AppButton
            key={l.probeId}
            label={regionLabel(l.probeId)}
            hint="Usa esta região na previsão e volta para o início"
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
