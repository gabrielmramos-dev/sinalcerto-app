import { useCallback, useEffect } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text } from 'react-native';

import { ActivityCard } from '@/components/ActivityCard';
import { ScreenState } from '@/components/ScreenState';
import { TimeChooser } from '@/components/TimeChooser';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { regionLabel } from '@/data/regions';
import { formatBrasiliaLong } from '@/data/time';
import { useActivityChecks } from '@/hooks/useActivityChecks';
import { useLoad } from '@/hooks/useLoad';
import { disclaimer, recommendation } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { colors, font, spacing } from '@/theme';

export default function ActivitiesScreen() {
  const { probeId, selectedTime, setSelectedTime } = useAppState();
  const region = regionLabel(probeId);

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
    const errors = failed ? ` ${failed} não puderam ser consultadas.` : '';
    AccessibilityInfo.announceForAccessibility(
      `Horário usado: ${formatBrasiliaLong(selectedTime, false)}. ${good} de 6 atividades devem funcionar.${errors}`,
    );
  }, [ready, selectedTime, done, good, failed, probeId]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        Para quando?
      </Text>
      <Text style={[font.small, styles.muted]}>Local de referência: {region}</Text>

      {data.status === 'loading' && <ScreenState kind="loading" message="Carregando os horários…" />}
      {data.status === 'error' &&
        (data.error instanceof NoDataError ? (
          <ScreenState kind="empty" message="Ainda não há previsão para esta região. Escolha outra em Trocar local, no Início." />
        ) : (
          <ScreenState kind="error" message="Não foi possível carregar os horários." onRetry={data.retry} />
        ))}

      {ready && (
        <>
          <TimeChooser items={ready.items} selected={selectedTime} onSelect={setSelectedTime} />

          {!selectedTime ? (
            <ScreenState kind="empty" message="Escolha um horário para ver o que dá para fazer." />
          ) : (
            <>
              <Text style={[font.heading, styles.text]} accessibilityRole="header">
                O que dá para fazer neste horário
              </Text>
              {sharedCode && done && (
                <Text style={[font.body, styles.text]}>Dica para este horário: {recommendation[sharedCode]}</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
