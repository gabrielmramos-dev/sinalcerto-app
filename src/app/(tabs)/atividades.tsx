import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { ACTIVITIES, type Activity, type TimelineItem } from '@/api/types';
import { ActivityCard } from '@/components/ActivityCard';
import { AppButton } from '@/components/AppButton';
import { ClockLegend, DayClock } from '@/components/DayClock';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { TabScreen } from '@/components/TabScreen';
import { TimeChooser } from '@/components/TimeChooser';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { formatWindows, windowsWhere } from '@/data/forecastSummary';
import { regionName } from '@/data/regions';
import { formatBrasiliaLong } from '@/data/time';
import { useActivityChecks, usePlanner, type PlannerState } from '@/hooks/useActivityChecks';
import { useLoad } from '@/hooks/useLoad';
import { activity as activityText, disclaimer, errorMessage, recommendation, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, elevation, font, radius, spacing } from '@/theme';

const t = ui.activities;

export default function ActivitiesScreen() {
  const styles = useStyles();
  const { probeId, selectedTime, setSelectedTime } = useAppState();
  const region = ui.common.region(regionName(probeId));
  const [planned, setPlanned] = useState<Activity | null>(null);

  // A timeline dá os horários possíveis (D6); /locations dá a coordenada da probe (D7), nunca a do aparelho.
  const load = useCallback(
    () =>
      Promise.all([forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), forecastSource.getLocations()]).then(
        ([timeline, locations]) => {
          const probe = locations.find((l) => l.probeId === probeId);
          if (!probe) throw new NoDataError(`probe ${probeId} fora de /locations`);
          return { items: timeline.items, hours: timeline.items.map((i) => i.predictionFor), location: probe.location };
        },
      ),
    [probeId],
  );
  const data = useLoad(load);
  const ready = data.status === 'ok' ? data.data : undefined;
  const base = ready ? { probeId, ...ready.location, modelId: DEFAULT_MODEL_ID } : null;

  const { cards, retry } = useActivityChecks(base && selectedTime ? { ...base, predictionFor: selectedTime } : null);
  // D31: o planejador consulta as 24 horas só da atividade tocada.
  const planner = usePlanner(base, ready?.hours ?? [], planned);
  const plan = planned && ready ? planSentence(planned, planner.state, ready.items) : undefined;

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

  // RNF08: a frase do planejador é anunciada quando as 24 horas chegam (ou quando não deu para consultar).
  const planDone = planner.state.status === 'ok' || planner.state.status === 'error';
  useEffect(() => {
    if (plan && planDone) AccessibilityInfo.announceForAccessibility(plan);
  }, [plan, planDone]);

  return (
    <TabScreen>
      <SourceBanner />
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        {t.screenTitle}
      </Text>
      <Text style={[font.label, styles.text]}>{region}</Text>

      {data.status === 'loading' && <ScreenState kind="loading" message={t.loading} placeholder={<Skeleton />} />}
      {data.status === 'error' &&
        (data.error instanceof NoDataError ? (
          <ScreenState kind="empty" message={ui.common.noDataForRegion} />
        ) : (
          <ScreenState kind="error" message={errorMessage(data.error, t.loadError)} onRetry={data.retry} />
        ))}

      {ready && (
        <>
          <View style={styles.section}>
            <Text style={[font.heading, styles.text]} accessibilityRole="header">
              {t.planTitle}
            </Text>
            {/* Relógio + legenda lidos pela frase (o relógio é decorativo). Texto estático, sem dica de toque. */}
            {/* eslint-disable-next-line react-native-a11y/has-accessibility-hint */}
            <View style={styles.card} accessible accessibilityLabel={plan ?? t.planIdle}>
              <DayClock
                items={ready.items}
                markTime={selectedTime ?? undefined}
                highlight={planner.state.status === 'ok' ? planner.state.suitable : undefined}
              />
              <ClockLegend dimmed={planner.state.status === 'ok'} />
              <Text style={[font.label, styles.text, styles.center]}>{plan ?? t.planIdle}</Text>
            </View>
            {planned && planner.state.status === 'error' && (
              <AppButton
                label={ui.common.retry}
                a11yLabel={t.planRetry(activityText[planned].name)}
                onPress={planner.retry}
              />
            )}
          </View>

          <Text style={[font.heading, styles.text]} accessibilityRole="header">
            {t.title}
          </Text>
          <TimeChooser items={ready.items} selected={selectedTime} onSelect={setSelectedTime} />

          {selectedTime ? (
            <>
              <Text style={[font.heading, styles.text]} accessibilityRole="header">
                {t.resultsTitle}
              </Text>
              {sharedCode && done && (
                <Text style={[font.body, styles.text]}>{t.sharedTip(recommendation[sharedCode])}</Text>
              )}
            </>
          ) : (
            <ScreenState kind="empty" message={t.chooseFirst} />
          )}
          {/* Sem horário escolhido, os cartões aparecem sem status: servem ao planejador. */}
          {ACTIVITIES.map((activity) => (
            <ActivityCard
              key={activity}
              activity={activity}
              state={selectedTime ? cards.find((c) => c.activity === activity)!.state : undefined}
              onRetry={() => retry(activity)}
              showAdvice={!sharedCode}
              selected={planned === activity}
              onSelect={() => setPlanned(activity)}
              plan={planned === activity ? plan : undefined}
            />
          ))}
          <Text style={[font.small, styles.muted]}>{disclaimer}</Text>
        </>
      )}
    </TabScreen>
  );
}

/** "Chamada de vídeo: melhor das 23h às 7h" (mesma regra de fim das janelas do relógio, D30). */
function planSentence(activity: Activity, state: PlannerState, items: TimelineItem[]): string {
  const { name } = activityText[activity];
  if (state.status === 'error') return t.planError(name);
  if (state.status !== 'ok') return t.planLoading(name);
  if (state.suitable.size === 0) return t.planNone(name);
  if (state.suitable.size === items.length) return t.planAll(name);
  return t.planBest(name, formatWindows(windowsWhere(items, (i) => state.suitable.has(i.predictionFor))));
}

/** Esboço do layout enquanto a timeline carrega: relógio e cartões. Decorativo; o texto ao lado avisa. */
function Skeleton() {
  const styles = useStyles();
  return (
    <View style={styles.skeleton} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={styles.skeletonClock} />
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

const useStyles = createThemedStyles((c) => ({
  section: { gap: spacing.sm },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...elevation.card,
  },
  center: { textAlign: 'center' },
  text: { color: c.text },
  muted: { color: c.textMuted },
  skeleton: { alignSelf: 'stretch', gap: spacing.md },
  skeletonClock: {
    width: '70%',
    maxWidth: 240,
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: radius.pill,
    borderWidth: 28,
    borderColor: c.primarySoft,
  },
  skeletonCard: { height: 76, borderRadius: radius.lg, backgroundColor: c.primarySoft },
}));
