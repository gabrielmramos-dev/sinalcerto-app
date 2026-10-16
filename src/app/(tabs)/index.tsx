import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ProbeForecast } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { QualityBadge } from '@/components/StatusBadge';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { regionLabel } from '@/data/regions';
import { formatBrasiliaLong, isPast } from '@/data/time';
import { useLoad } from '@/hooks/useLoad';
import { disclaimer, quality, recommendation } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { colors, font, spacing } from '@/theme';

const PAST_NOTE = 'Não há previsão para agora. Os dados disponíveis terminam neste horário.';

export default function HomeScreen() {
  const router = useRouter();
  const { probeId } = useAppState();
  const region = regionLabel(probeId);
  const load = useCallback(() => forecastSource.getForecast(probeId, DEFAULT_MODEL_ID), [probeId]);
  const forecast = useLoad(load);
  const data = forecast.status === 'ok' ? forecast.data : undefined;

  // RNF08: avisa o leitor de tela quando a previsão chega ou muda (ex.: depois de trocar o local).
  useEffect(() => {
    if (data) AccessibilityInfo.announceForAccessibility(`${region}. ${summary(data)}`);
  }, [data, region]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.location}>
        <Text style={[font.small, styles.muted]}>Local de referência</Text>
        <Text style={[font.heading, styles.text]}>{region}</Text>
        <AppButton label="Trocar local" hint="Abre a lista de regiões" onPress={() => router.push('/local')} />
      </View>

      {forecast.status === 'loading' && <ScreenState kind="loading" />}
      {forecast.status === 'error' &&
        (forecast.error instanceof NoDataError ? (
          <ScreenState
            kind="empty"
            message="Ainda não há previsão para esta região. Escolha outra em Trocar local."
          />
        ) : (
          <ScreenState kind="error" message="Não foi possível carregar a previsão." onRetry={forecast.retry} />
        ))}
      {data && <ForecastCard forecast={data} />}

      <Text style={[font.small, styles.muted]}>
        {disclaimer} A região é um ponto de referência da rede, não a sua localização exata.
      </Text>

      <AppButton
        label="Ver o que dá para fazer"
        hint="Abre a aba Atividades"
        variant="primary"
        onPress={() => router.navigate('/atividades')}
      />
      <AppButton label="Ver as próximas horas" hint="Abre a aba Detalhes" onPress={() => router.navigate('/detalhes')} />
    </ScrollView>
  );
}

function summary(f: ProbeForecast): string {
  const q = quality[f.assessment.quality];
  const past = isPast(f.prediction.predictionFor) ? ` ${PAST_NOTE}` : '';
  return `Qualidade prevista: ${q.label}. ${q.sentence} ${recommendation[f.recommendation.code]} Previsão para ${formatBrasiliaLong(f.prediction.predictionFor)}, horário de Brasília.${past}`;
}

function ForecastCard({ forecast }: { forecast: ProbeForecast }) {
  const q = quality[forecast.assessment.quality];
  return (
    // Lido como um item só, na ordem da tela (RNF02, RNF08). Texto estático: sem dica de toque.
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View style={styles.card} accessible accessibilityLabel={`Previsão mais próxima. ${summary(forecast)}`}>
      <Text style={[font.heading, styles.text]} accessibilityRole="header">
        Previsão mais próxima
      </Text>
      <QualityBadge value={forecast.assessment.quality} />
      <Text style={[font.body, styles.text]}>{q.sentence}</Text>
      <Text style={[font.body, styles.text]}>{recommendation[forecast.recommendation.code]}</Text>
      <Text style={[font.small, styles.muted]}>
        Previsão para {formatBrasiliaLong(forecast.prediction.predictionFor)} (horário de Brasília)
      </Text>
      {isPast(forecast.prediction.predictionFor) && <Text style={[font.small, styles.text]}>{PAST_NOTE}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  location: { gap: spacing.xs, alignItems: 'flex-start' },
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
});
