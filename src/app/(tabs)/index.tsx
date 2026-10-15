import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ProbeForecast } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { QualityBadge, StatusBadge } from '@/components/StatusBadge';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { regionLabel } from '@/data/regions';
import { formatBrasilia } from '@/data/time';
import { colors, font, spacing } from '@/theme';

// ponytail: prévia temporária do M1 para testar componentes e mock no celular. O M2 substitui esta tela.
export default function HomeScreen() {
  const [forecast, setForecast] = useState<ProbeForecast | 'loading' | 'error'>('loading');
  const [selected, setSelected] = useState(false);

  const fetchForecast = useCallback(() => {
    forecastSource.getForecast(900001, DEFAULT_MODEL_ID).then(setForecast, () => setForecast('error'));
  }, []);
  useEffect(fetchForecast, [fetchForecast]);
  const load = () => {
    setForecast('loading');
    fetchForecast();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        Prévia dos componentes (M1)
      </Text>

      {forecast === 'loading' && <ScreenState kind="loading" />}
      {forecast === 'error' && <ScreenState kind="error" message="Não deu para carregar." onRetry={load} />}
      {typeof forecast === 'object' && (
        <View style={styles.card}>
          <Text style={[font.body, styles.text]}>{regionLabel(forecast.probeId)}</Text>
          <QualityBadge value={forecast.assessment.quality} />
          <Text style={[font.small, styles.muted]}>
            Previsão para {formatBrasilia(forecast.prediction.predictionFor)} (horário de Brasília)
          </Text>
        </View>
      )}

      <QualityBadge value="GOOD" />
      <QualityBadge value="MODERATE" />
      <QualityBadge value="UNSTABLE" />
      <StatusBadge tone="good" label="Deve funcionar" />
      <StatusBadge tone="moderate" label="Pode ter problemas" />
      <AppButton label="Recarregar previsão" variant="primary" onPress={load} />
      <AppButton label="Tarde" selected={selected} onPress={() => setSelected((s) => !s)} />
      <ScreenState kind="empty" message="Exemplo de estado vazio." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, gap: spacing.sm },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
