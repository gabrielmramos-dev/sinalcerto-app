import { useCallback, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { TimelineRow } from '@/components/TimelineRow';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { itemsInPeriod, PERIODS, type PeriodId } from '@/data/periods';
import { regionLabel } from '@/data/regions';
import { formatBrasiliaLong, groupByDay } from '@/data/time';
import { useLoad } from '@/hooks/useLoad';
import { period as periodText, quality } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { colors, font, spacing } from '@/theme';

type Filter = 'todas' | PeriodId;

export default function DetailsScreen() {
  const { probeId, selectedTime, setSelectedTime } = useAppState();
  const [filter, setFilter] = useState<Filter>('todas');
  const load = useCallback(() => forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), [probeId]);
  const timeline = useLoad(load);

  const all = timeline.status === 'ok' ? timeline.data.items : [];
  const shown = filter === 'todas' ? all : itemsInPeriod(all, filter);

  const chooseFilter = (next: Filter) => {
    setFilter(next);
    const n = next === 'todas' ? all.length : itemsInPeriod(all, next).length;
    AccessibilityInfo.announceForAccessibility(`Mostrando ${n} horas${next === 'todas' ? '' : `: ${periodText[next]}`}`);
  };

  // D6: o horário escolhido é sempre um item da timeline; vale para o app inteiro.
  const chooseHour = (item: TimelineItem) => {
    setSelectedTime(item.predictionFor);
    AccessibilityInfo.announceForAccessibility(
      `Horário escolhido: ${formatBrasiliaLong(item.predictionFor, false)}, ${quality[item.quality].label}. Vale também para a aba Atividades.`,
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        Previsão por hora
      </Text>
      <Text style={[font.small, styles.muted]}>Local de referência: {regionLabel(probeId)}</Text>

      {timeline.status === 'loading' && <ScreenState kind="loading" message="Carregando as horas…" />}
      {timeline.status === 'error' &&
        (timeline.error instanceof NoDataError ? (
          <ScreenState
            kind="empty"
            message="Ainda não há previsão para esta região. Escolha outra em Trocar local, no Início."
          />
        ) : (
          <ScreenState kind="error" message="Não foi possível carregar as horas." onRetry={timeline.retry} />
        ))}

      {timeline.status === 'ok' && (
        <>
          <View style={styles.filters}>
            {(['todas', ...PERIODS.map((p) => p.id)] as Filter[]).map((f) => (
              <AppButton
                key={f}
                label={f === 'todas' ? 'Todas' : periodText[f]}
                hint={f === 'todas' ? 'Mostra todas as horas' : 'Mostra só as horas deste período'}
                selected={filter === f}
                onPress={() => chooseFilter(f)}
              />
            ))}
          </View>

          {shown.length === 0 ? (
            <ScreenState kind="empty" message="Não há previsões neste período nos dados disponíveis." />
          ) : (
            <>
              <Text style={[font.body, styles.text]}>
                Mostrando {shown.length} horas. Toque numa hora para usá-la no app.
              </Text>
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
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  group: { gap: spacing.sm },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
