import { useRouter } from 'expo-router';
import Sun from 'lucide-react-native/icons/sun';
import { useCallback, useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import type { ProbeForecast, TimelineItem } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { ClockLegend, DayClock } from '@/components/DayClock';
import { ForecastHero } from '@/components/ForecastHero';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { TabScreen } from '@/components/TabScreen';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { bestOverall, countByQuality, dayRange, formatWindows, windowsWhere } from '@/data/forecastSummary';
import { regionName } from '@/data/regions';
import { formatBrasiliaLong, isPast } from '@/data/time';
import { useLoad } from '@/hooks/useLoad';
import { disclaimer, errorMessage, quality, recommendation, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, elevation, font, radius, spacing, useColors } from '@/theme';

const t = ui.home;

export default function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { probeId } = useAppState();
  const region = ui.common.region(regionName(probeId));

  const loadForecast = useCallback(() => forecastSource.getForecast(probeId, DEFAULT_MODEL_ID), [probeId]);
  const forecast = useLoad(loadForecast);
  const data = forecast.status === 'ok' ? forecast.data : undefined;
  const loadTimeline = useCallback(() => forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), [probeId]);
  const timeline = useLoad(loadTimeline);
  const items = timeline.status === 'ok' ? timeline.data.items : [];

  // RNF08: avisa o leitor de tela quando a previsão chega ou muda (ex.: depois de trocar o local).
  useEffect(() => {
    if (data) AccessibilityInfo.announceForAccessibility(`${region}. ${summary(data)}`);
  }, [data, region]);

  return (
    <TabScreen>
        <SourceBanner />
        <Text style={[font.title, styles.text]} accessibilityRole="header">
          {t.appName}
        </Text>
        <View style={styles.location}>
          <Text style={[font.label, styles.text, styles.grow]}>{region}</Text>
          <AppButton label={t.changeLocation} hint={t.changeLocationHint} onPress={() => router.push('/local')} />
        </View>

        {forecast.status === 'loading' && <ScreenState kind="loading" />}
        {forecast.status === 'error' &&
          (forecast.error instanceof NoDataError ? (
            <ScreenState kind="empty" message={t.noDataForRegion} />
          ) : (
            <ScreenState kind="error" message={errorMessage(forecast.error, t.loadError)} onRetry={forecast.retry} />
          ))}
        {data && (
          <ForecastHero
            title={t.cardTitle}
            value={data.assessment.quality}
            lines={[quality[data.assessment.quality].sentence, recommendation[data.recommendation.code]]}
            notes={[
              t.forecastFor(formatBrasiliaLong(data.prediction.predictionFor)),
              ...(isPast(data.prediction.predictionFor) ? [t.pastNote] : []),
            ]}
            spoken={`${t.cardTitle}. ${summary(data)}`}
          />
        )}

        {items.length > 0 && <BestMoment items={items} />}

        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={[font.heading, styles.text]} accessibilityRole="header">
              {t.rangeTitle(dayRange(items))}
            </Text>
            <Text style={[font.body, styles.muted]}>{t.clockTitle}</Text>
            <ClockCard items={items} markTime={data?.prediction.predictionFor} />
          </View>
        )}

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
    </TabScreen>
  );
}

/** D29: maior nota da previsão e as horas Instáveis seguidas, calculadas dos dados. */
function BestMoment({ items }: { items: TimelineItem[] }) {
  const styles = useStyles();
  const c = useColors();
  const best = bestOverall(items);
  if (!best) return null;
  const value = t.bestValue(formatBrasiliaLong(best.predictionFor, false), quality[best.quality].label);
  const windows = windowsWhere(items, (i) => i.quality === 'UNSTABLE');
  const avoid = windows.length ? t.avoid(formatWindows(windows)) : t.avoidNone;
  return (
    // Lido como um item só. Texto estático, sem dica de toque.
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View style={[styles.card, styles.bestRow]} accessible accessibilityLabel={t.bestSpoken(value, avoid)}>
      <Sun color={c.moderate} size={28} accessible={false} />
      <View style={styles.grow}>
        <Text style={[font.label, styles.text]}>{t.bestTitle}</Text>
        <Text style={[font.heading, styles.text]}>{value}</Text>
        <Text style={[font.body, styles.text]}>{avoid}</Text>
      </View>
    </View>
  );
}

/** Relógio + legenda + resumo, lidos como um grupo pelo resumo em texto (o relógio é decorativo). */
function ClockCard({ items, markTime }: { items: TimelineItem[]; markTime?: string }) {
  const styles = useStyles();
  const count = countByQuality(items);
  const best = bestOverall(items);
  const text = t.clockSummary(
    dayRange(items),
    count.GOOD,
    count.MODERATE,
    count.UNSTABLE,
    best ? formatBrasiliaLong(best.predictionFor, false) : '',
  );
  return (
    // eslint-disable-next-line react-native-a11y/has-accessibility-hint
    <View style={styles.card} accessible accessibilityLabel={text}>
      <DayClock items={items} markTime={markTime} />
      <ClockLegend />
      <Text style={[font.body, styles.text, styles.center]}>{text}</Text>
    </View>
  );
}

function summary(f: ProbeForecast): string {
  const q = quality[f.assessment.quality];
  const past = isPast(f.prediction.predictionFor) ? ` ${t.pastNote}` : '';
  return `${ui.common.qualityContext}: ${q.label}. ${q.sentence} ${recommendation[f.recommendation.code]} ${t.forecastForSpoken(formatBrasiliaLong(f.prediction.predictionFor))}${past}`;
}

const useStyles = createThemedStyles((c) => ({
  location: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  grow: { flexGrow: 1, flexShrink: 1, gap: spacing.xs },
  section: { gap: spacing.sm },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...elevation.card,
  },
  bestRow: { flexDirection: 'row', alignItems: 'flex-start' },
  center: { textAlign: 'center' },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
