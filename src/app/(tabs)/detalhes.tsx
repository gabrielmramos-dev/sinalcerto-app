import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { AccessibilityInfo, ScrollView, Text, View } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { NumbersSection } from '@/components/NumbersSection';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { TimelineRow } from '@/components/TimelineRow';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { itemsInPeriod, PERIODS, type PeriodId } from '@/data/periods';
import { regionName } from '@/data/regions';
import { formatBrasiliaLong, groupByDay } from '@/data/time';
import { useLoad } from '@/hooks/useLoad';
import { errorMessage, period as periodText, quality, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, font, spacing } from '@/theme';

type Filter = 'todas' | PeriodId;
const t = ui.details;

export default function DetailsScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { probeId, selectedTime, setSelectedTime } = useAppState();
  const [filter, setFilter] = useState<Filter>('todas');
  const load = useCallback(() => forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), [probeId]);
  const timeline = useLoad(load);

  // Só para a confiança do modelo, que a timeline não traz (D24). Se falhar, a seção só não mostra a confiança.
  const loadForecast = useCallback(() => forecastSource.getForecast(probeId, DEFAULT_MODEL_ID), [probeId]);
  const forecast = useLoad(loadForecast);

  const all = timeline.status === 'ok' ? timeline.data.items : [];
  const shown = filter === 'todas' ? all : itemsInPeriod(all, filter);

  // "O que esperar neste horário": a hora escolhida ou, sem escolha, a previsão mais próxima (a mesma do Início).
  const nearest = forecast.status === 'ok' ? forecast.data.prediction : undefined;
  const numbersItem =
    all.find((i) => i.predictionFor === selectedTime) ??
    all.find((i) => i.predictionFor === nearest?.predictionFor) ??
    all[all.length - 1];
  const confidence = nearest && numbersItem?.predictionFor === nearest.predictionFor ? nearest.modelConfidence : null;

  const chooseFilter = (next: Filter) => {
    setFilter(next);
    const n = next === 'todas' ? all.length : itemsInPeriod(all, next).length;
    AccessibilityInfo.announceForAccessibility(t.showingSpoken(n, next === 'todas' ? undefined : periodText[next]));
  };

  // D6: o horário escolhido é sempre um item da timeline; vale para o app inteiro.
  const chooseHour = (item: TimelineItem) => {
    setSelectedTime(item.predictionFor);
    AccessibilityInfo.announceForAccessibility(
      t.chosen(formatBrasiliaLong(item.predictionFor, false), quality[item.quality].label),
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SourceBanner />
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        {t.title}
      </Text>
      <Text style={[font.small, styles.muted]}>{ui.common.region(regionName(probeId))}</Text>

      {timeline.status === 'loading' && <ScreenState kind="loading" message={t.loading} />}
      {timeline.status === 'error' &&
        (timeline.error instanceof NoDataError ? (
          <ScreenState kind="empty" message={ui.common.noDataForRegion} />
        ) : (
          <ScreenState kind="error" message={errorMessage(timeline.error, t.loadError)} onRetry={timeline.retry} />
        ))}

      {timeline.status === 'ok' && (
        <>
          <View style={styles.filters}>
            {(['todas', ...PERIODS.map((p) => p.id)] as Filter[]).map((f) => (
              <AppButton
                key={f}
                label={f === 'todas' ? t.all : periodText[f]}
                hint={f === 'todas' ? t.allHint : t.periodHint}
                selected={filter === f}
                onPress={() => chooseFilter(f)}
              />
            ))}
          </View>

          {shown.length === 0 ? (
            <ScreenState kind="empty" message={t.emptyPeriod} />
          ) : (
            <>
              <Text style={[font.body, styles.text]}>{t.showing(shown.length)}</Text>
              {groupByDay(shown).map((group) => (
                <View key={group.day} style={styles.group}>
                  <Text style={[font.heading, styles.text]} accessibilityRole="header">
                    {group.day}
                  </Text>
                  {group.items.map((item) => (
                    <TimelineRow
                      key={item.predictionFor}
                      item={item}
                      selected={item.predictionFor === selectedTime}
                      onPress={() => chooseHour(item)}
                    />
                  ))}
                </View>
              ))}
            </>
          )}

          {numbersItem && (
            <NumbersSection
              item={numbersItem}
              isNearest={!selectedTime || numbersItem.predictionFor !== selectedTime}
              confidence={confidence}
            />
          )}
        </>
      )}

      <AppButton label={ui.aboutLink} hint={ui.aboutLinkHint} variant="link" onPress={() => router.push('/sobre')} />
    </ScrollView>
  );
}

const useStyles = createThemedStyles((c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  content: { padding: spacing.md, gap: spacing.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  group: { gap: spacing.sm },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
