import { useCallback, useEffect } from 'react';
import { AccessibilityInfo, ScrollView, Text } from 'react-native';

import { ActivityCard } from '@/components/ActivityCard';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { TimeChooser } from '@/components/TimeChooser';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { regionName } from '@/data/regions';
import { formatBrasiliaLong } from '@/data/time';
import { useActivityChecks } from '@/hooks/useActivityChecks';
import { useLoad } from '@/hooks/useLoad';
import { disclaimer, errorMessage, recommendation, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, font, spacing } from '@/theme';

const t = ui.activities;

export default function ActivitiesScreen() {
  const styles = useStyles();
  const { probeId, selectedTime, setSelectedTime } = useAppState();
  const region = ui.common.region(regionName(probeId));

  // A timeline dá os horários possíveis (D6); /locations dá a coordenada da probe (D7), nunca a do aparelho.
  const load = useCallback(
    () =>
      Promise.all([forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), forecastSource.getLocations()]).then(
        ([timeline, locations]) => {
          const probe = locations.find((l) => l.probeId === probeId);
          if (!probe) throw new NoDataError(`probe ${probeId} fora de /locations`);
          return { items: timeline.items, location: probe.location };
        },
      ),
    [probeId],
  );
  const data = useLoad(load);
  const ready = data.status === 'ok' ? data.data : undefined;

  const { cards, retry } = useActivityChecks(
    ready && selectedTime
      ? { probeId, ...ready.location, modelId: DEFAULT_MODEL_ID, predictionFor: selectedTime }
      : null,
  );

  // Conselho uma vez só quando é o mesmo para todas (sempre foi, nos dados reais); senão, em cada cartão.
  const codes = new Set(cards.flatMap((c) => (c.state.status === 'ok' ? [c.state.data.recommendation.code] : [])));
  const sharedCode = codes.size === 1 ? [...codes][0] : undefined;
  const done = cards.every((c) => c.state.status !== 'loading');
  const good = cards.filter((c) => c.state.status === 'ok' && c.state.data.suitable).length;
  const failed = cards.filter((c) => c.state.status === 'error').length;

  // RNF08: resume o resultado para o leitor de tela quando as 6 consultas terminam.
  useEffect(() => {
    if (!ready || !selectedTime || !done) return;
    AccessibilityInfo.announceForAccessibility(t.summary(formatBrasiliaLong(selectedTime, false), good, failed));
  }, [ready, selectedTime, done, good, failed, probeId]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SourceBanner />
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        {t.title}
      </Text>
      <Text style={[font.small, styles.muted]}>{region}</Text>

      {data.status === 'loading' && <ScreenState kind="loading" message={t.loading} />}
      {data.status === 'error' &&
        (data.error instanceof NoDataError ? (
          <ScreenState kind="empty" message={ui.common.noDataForRegion} />
        ) : (
          <ScreenState kind="error" message={errorMessage(data.error, t.loadError)} onRetry={data.retry} />
        ))}

      {ready && (
        <>
          <TimeChooser items={ready.items} selected={selectedTime} onSelect={setSelectedTime} />

          {!selectedTime ? (
            <ScreenState kind="empty" message={t.chooseFirst} />
          ) : (
            <>
              <Text style={[font.heading, styles.text]} accessibilityRole="header">
                {t.resultsTitle}
              </Text>
              {sharedCode && done && (
                <Text style={[font.body, styles.text]}>{t.sharedTip(recommendation[sharedCode])}</Text>
              )}
              {cards.map(({ activity, state }) => (
                <ActivityCard
                  key={activity}
                  activity={activity}
                  state={state}
                  onRetry={() => retry(activity)}
                  showAdvice={!sharedCode}
                />
              ))}
              <Text style={[font.small, styles.muted]}>{disclaimer}</Text>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const useStyles = createThemedStyles((c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  content: { padding: spacing.md, gap: spacing.md },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
