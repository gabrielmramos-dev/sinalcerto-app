import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ProbeForecast } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { QualityBadge } from '@/components/StatusBadge';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { regionName } from '@/data/regions';
import { brasiliaClock, brasiliaDay, formatBrasiliaLong, isPast } from '@/data/time';
import { useLoad } from '@/hooks/useLoad';
import { disclaimer, errorMessage, quality, recommendation, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { colors, font, spacing } from '@/theme';

const t = ui.home;

export default function HomeScreen() {
  const router = useRouter();
  const { probeId } = useAppState();
  const region = ui.common.region(regionName(probeId));
  const load = useCallback(() => forecastSource.getForecast(probeId, DEFAULT_MODEL_ID), [probeId]);
  const forecast = useLoad(load);
  const data = forecast.status === 'ok' ? forecast.data : undefined;

  // RNF08: avisa o leitor de tela quando a previsão chega ou muda (ex.: depois de trocar o local).
  useEffect(() => {
    if (data) AccessibilityInfo.announceForAccessibility(`${region}. ${summary(data)}`);
  }, [data, region]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SourceBanner />
      <View style={styles.location}>
        <Text style={[font.heading, styles.text]}>{region}</Text>
        <AppButton label={t.changeLocation} hint={t.changeLocationHint} onPress={() => router.push('/local')} />
      </View>

      {forecast.status === 'loading' && <ScreenState kind="loading" />}
      {forecast.status === 'error' &&
        (forecast.error instanceof NoDataError ? (
          <ScreenState kind="empty" message={t.noDataForRegion} />
        ) : (
          <ScreenState kind="error" message={errorMessage(forecast.error, t.loadError)} onRetry={forecast.retry} />
        ))}
      {data && <ForecastCard forecast={data} />}
      {data && <NextHours probeId={probeId} after={data.prediction.predictionFor} />}

      <Text style={[font.small, styles.muted]}>
        {disclaimer} {t.regionNote}
      </Text>

      <AppButton
        label={t.seeActivities}
        hint={t.seeActivitiesHint}
        variant="primary"
        onPress={() => router.navigate('/atividades')}
      />
      <AppButton label={t.seeAllHours} hint={t.seeAllHoursHint} onPress={() => router.navigate('/detalhes')} />
      <AppButton label={ui.aboutLink} hint={ui.aboutLinkHint} variant="link" onPress={() => router.push('/sobre')} />
    </ScrollView>
  );
}

/**
 * D22: até 3 horas da timeline depois da hora do cartão. Com os dados atuais o cartão já é a última
 * hora, então a seção diz isso com honestidade; quando houver horas futuras, elas aparecem sozinhas.
 */
function NextHours({ probeId, after }: { probeId: number; after: string }) {
  const load = useCallback(() => forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), [probeId]);
  const timeline = useLoad(load);
  const next =
    timeline.status === 'ok'
      ? timeline.data.items.filter((i) => Date.parse(i.predictionFor) > Date.parse(after)).slice(0, 3)
      : [];

  return (
    <View style={styles.next}>
      <Text style={[font.heading, styles.text]} accessibilityRole="header">
        {t.nextHoursTitle}
      </Text>
      {timeline.status === 'loading' && <Text style={[font.body, styles.muted]}>{t.nextHoursLoading}</Text>}
      {timeline.status === 'error' && <Text style={[font.body, styles.text]}>{t.nextHoursError}</Text>}
      {timeline.status === 'ok' && next.length === 0 && (
        <Text style={[font.body, styles.text]}>{t.nextHoursNone(formatBrasiliaLong(after, false))}</Text>
      )}
      {next.map((item) => {
        const clock = brasiliaClock(item.predictionFor);
        const label = ui.details.row(clock, brasiliaDay(item.predictionFor), quality[item.quality].label, item.qualityScore);
        return (
          // Linha estática (sem toque), lida como um item só.
          // eslint-disable-next-line react-native-a11y/has-accessibility-hint
          <View key={item.predictionFor} style={styles.nextRow} accessible accessibilityLabel={label}>
            <Text style={[font.label, styles.text]}>{clock}</Text>
            <QualityBadge value={item.quality} />
            <Text style={[font.body, styles.text]}>{ui.details.rowScore(item.qualityScore)}</Text>
          </View>
        );
      })}
    </View>
  );
}

function summary(f: ProbeForecast): string {
  const q = quality[f.assessment.quality];
  const past = isPast(f.prediction.predictionFor) ? ` ${t.pastNote}` : '';
  return `${ui.common.qualityContext}: ${q.label}. ${q.sentence} ${recommendation[f.recommendation.code]} ${t.forecastForSpoken(formatBrasiliaLong(f.prediction.predictionFor))}${past}`;
}

function ForecastCard({ forecast }: { forecast: ProbeForecast }) {
  const q = quality[forecast.assessment.quality];
  return (
    // Lido como um item só, na ordem da tela (RNF02, RNF08). Texto estático: sem dica de toque.
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View style={styles.card} accessible accessibilityLabel={`${t.cardTitle}. ${summary(forecast)}`}>
      <Text style={[font.heading, styles.text]} accessibilityRole="header">
        {t.cardTitle}
      </Text>
      <QualityBadge value={forecast.assessment.quality} />
      <Text style={[font.body, styles.text]}>{q.sentence}</Text>
      <Text style={[font.body, styles.text]}>{recommendation[forecast.recommendation.code]}</Text>
      <Text style={[font.small, styles.muted]}>{t.forecastFor(formatBrasiliaLong(forecast.prediction.predictionFor))}</Text>
      {isPast(forecast.prediction.predictionFor) && <Text style={[font.small, styles.text]}>{t.pastNote}</Text>}
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
  next: { gap: spacing.sm },
  nextRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
