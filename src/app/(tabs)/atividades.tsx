import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import type { Activity } from '@/api/types';
import { ActivityRow } from '@/components/ActivityRow';
import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { TabScreen } from '@/components/TabScreen';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { brasiliaClock, formatBrasilia, formatBrasiliaLong } from '@/data/time';
import { useActivityChecks, usePlanner } from '@/hooks/useActivityChecks';
import { useChosenHour } from '@/hooks/useChosenHour';
import { useLoad } from '@/hooks/useLoad';
import { bestAndAvoid, phraseText } from '@/lib/hourPhrases';
import { activity as activityText, errorMessage, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, font, radius, spacing } from '@/theme';

const t = ui.activities;

/** D34 (wireframe v2): uma pergunta, "o que você quer fazer?". Lista de atividades; tocar abre os horários. */
export default function ActivitiesScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { probeId } = useAppState();
  const [open, setOpen] = useState<Activity | null>(null);

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
  // D34: a mesma hora selecionada do app inteiro (sem escolha, a mais próxima de agora).
  const { chosen } = useChosenHour(ready?.items ?? []);
  const selectedTime = chosen?.predictionFor;

  const { cards, retry } = useActivityChecks(base && selectedTime ? { ...base, predictionFor: selectedTime } : null);
  // D31: as 24 horas só da atividade aberta (até 6 chamadas por vez, com cache).
  const planner = usePlanner(base, ready?.hours ?? [], open);
  const suitable = planner.state.status === 'ok' ? planner.state.suitable : undefined;
  const phrases = ready && suitable ? bestAndAvoid(ready.items, (i) => suitable.has(i.predictionFor)) : undefined;
  const best = phrases && phraseText(phrases.best);
  const avoid = phrases && phraseText(phrases.avoid);

  const done = cards.every((c) => c.state.status !== 'loading');
  const good = cards.filter((c) => c.state.status === 'ok' && c.state.data.suitable).length;
  const failed = cards.filter((c) => c.state.status === 'error').length;

  // RNF08: resume o resultado para o leitor de tela quando as 6 consultas terminam.
  useEffect(() => {
    if (!ready || !selectedTime || !done) return;
    AccessibilityInfo.announceForAccessibility(t.summary(formatBrasiliaLong(selectedTime, false), good, failed));
  }, [ready, selectedTime, done, good, failed, probeId]);

  // RNF08: Melhor/Evite anunciados quando as 24 horas da atividade aberta chegam.
  useEffect(() => {
    if (open && best && avoid)
      AccessibilityInfo.announceForAccessibility(`${activityText[open].name}. ${ui.hours.spoken(best, avoid)}`);
  }, [open, best, avoid]);

  return (
    <TabScreen>
      <SourceBanner />
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        {t.title}
      </Text>
      <Text style={[font.body, styles.muted]}>{t.intro}</Text>

      {data.status === 'loading' && <ScreenState kind="loading" message={t.loading} placeholder={<Skeleton />} />}
      {data.status === 'error' &&
        (data.error instanceof NoDataError ? (
          <ScreenState kind="empty" message={ui.common.noDataForRegion} />
        ) : (
          <ScreenState kind="error" message={errorMessage(data.error, t.loadError)} onRetry={data.retry} />
        ))}

      {ready && chosen && (
        <>
          <View style={styles.list}>
            {cards.map(({ activity, state }) => (
              <ActivityRow
                key={activity}
                activity={activity}
                state={state}
                clock={brasiliaClock(chosen.predictionFor)}
                expanded={open === activity}
                onPress={() => setOpen(open === activity ? null : activity)}
                onRetry={() => retry(activity)}
                plan={open === activity ? { state: planner.state, best, avoid, onRetry: planner.retry } : undefined}
              />
            ))}
          </View>

          {/* D34: a hora é a mesma do app inteiro; "Trocar hora" leva à faixa do Início, com o foco nela. */}
          <View style={styles.footer}>
            <Text style={[font.body, styles.text, styles.center]}>
              {t.at(brasiliaClock(chosen.predictionFor), formatBrasilia(chosen.predictionFor).slice(0, 5))}
            </Text>
            {/* O link se alinha à esquerda por padrão; a View em volta é que fica no centro. */}
            <View>
              <AppButton
                label={t.changeHour}
                hint={t.changeHourHint}
                variant="link"
                onPress={() => router.navigate({ pathname: '/', params: { focus: 'faixa' } })}
              />
            </View>
          </View>
        </>
      )}
    </TabScreen>
  );
}

/** Esboço do layout enquanto a timeline carrega: as linhas da lista. Decorativo; o texto ao lado avisa. */
function Skeleton() {
  const styles = useStyles();
  return (
    <View style={styles.list} accessible={false} importantForAccessibility="no-hide-descendants">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonRow} />
      ))}
    </View>
  );
}

const useStyles = createThemedStyles((c) => ({
  list: { alignSelf: 'stretch', gap: spacing.sm },
  // Um embaixo do outro, centralizados, como o aviso do Início; o link mantém o alvo de 48.
  footer: { alignItems: 'center' },
  center: { textAlign: 'center' },
  text: { color: c.text },
  muted: { color: c.textMuted },
  skeletonRow: { height: 52, borderRadius: radius.md, backgroundColor: c.primarySoft },
}));
