import { useRouter } from 'expo-router';
import { useCallback, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, ScrollView, Text, View } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { HourRow } from '@/components/HourRow';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { TabScreen } from '@/components/TabScreen';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { countByQuality } from '@/data/forecastSummary';
import { regionName } from '@/data/regions';
import { brasiliaDay, formatBrasiliaLong, groupByDay } from '@/data/time';
import { useChosenHour } from '@/hooks/useChosenHour';
import { useLoad } from '@/hooks/useLoad';
import { errorMessage, quality, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, elevation, font, radius, spacing } from '@/theme';

const t = ui.details;

/** D35 (wireframe v2): "Hora a hora". Lista das 24 horas por dia; tocar abre o que esperar naquela hora. */
export default function DetailsScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { probeId } = useAppState();
  const [open, setOpen] = useState<string | null>(null);
  const load = useCallback(() => forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), [probeId]);
  const timeline = useLoad(load);
  // Só para a confiança do modelo, que a timeline não traz (D24). Se falhar, só não aparece a confiança.
  const loadForecast = useCallback(() => forecastSource.getForecast(probeId, DEFAULT_MODEL_ID), [probeId]);
  const forecast = useLoad(loadForecast);

  const items = timeline.status === 'ok' ? timeline.data.items : [];
  const { chosen, choose } = useChosenHour(items);
  const nearest = forecast.status === 'ok' ? forecast.data.prediction : undefined;
  const count = countByQuality(items);

  // Tocar abre a linha (uma por vez) e escolhe a hora para o app inteiro (D6, D34). Tocar na aberta fecha.
  const tap = (item: TimelineItem) => {
    if (open === item.predictionFor) return setOpen(null);
    setOpen(item.predictionFor);
    choose(item.predictionFor);
    AccessibilityInfo.announceForAccessibility(
      t.chosen(formatBrasiliaLong(item.predictionFor, false), quality[item.quality].label),
    );
  };

  // A hora selecionada aparece ao abrir a tela: rola até ela uma vez, quando as posições são conhecidas
  // (lista na tela, dia na lista, cartão no dia, linha no cartão). Medidas, para valer com texto grande.
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const pos = useRef({
    list: undefined as number | undefined,
    days: {} as Record<string, number>,
    card: undefined as number | undefined,
    row: undefined as number | undefined,
    done: false,
  });
  const chosenDay = chosen && brasiliaDay(chosen.predictionFor);
  const scrollToChosen = () => {
    const p = pos.current;
    const day = chosenDay ? p.days[chosenDay] : undefined;
    if (p.done || p.list === undefined || day === undefined || p.card === undefined || p.row === undefined) return;
    p.done = true;
    scrollRef.current?.scrollTo({ y: Math.max(0, p.list + day + p.card + p.row - 120), animated: false });
  };

  return (
    <TabScreen scrollRef={scrollRef}>
      <SourceBanner />
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        {t.title}
      </Text>
      {items.length > 0 && (
        <Text style={[font.body, styles.muted]}>
          {t.subtitle(regionName(probeId), count.GOOD, count.MODERATE, count.UNSTABLE)}
        </Text>
      )}

      {timeline.status === 'loading' && <ScreenState kind="loading" message={t.loading} />}
      {timeline.status === 'error' &&
        (timeline.error instanceof NoDataError ? (
          <ScreenState kind="empty" message={ui.common.noDataForRegion} />
        ) : (
          <ScreenState kind="error" message={errorMessage(timeline.error, t.loadError)} onRetry={timeline.retry} />
        ))}

      {/* D35: lista vertical agrupada por dia, com divisórias finas (não um cartão por hora). */}
      <View
        style={styles.days}
        onLayout={(e) => {
          pos.current.list = e.nativeEvent.layout.y;
          scrollToChosen();
        }}
      >
        {groupByDay(items).map((group) => (
          <View
            key={group.day}
            style={styles.group}
            onLayout={(e) => {
              pos.current.days[group.day] = e.nativeEvent.layout.y;
              scrollToChosen();
            }}
          >
            <Text style={[font.small, styles.muted]} accessibilityRole="header">
              {group.day}
            </Text>
            {/* Sombra por fora; recorte dos cantos por dentro (overflow hidden apaga a sombra no iOS). */}
            <View
              style={styles.card}
              onLayout={(e) => {
                if (group.day !== chosenDay) return;
                pos.current.card = e.nativeEvent.layout.y;
                scrollToChosen();
              }}
            >
              <View style={styles.clip}>
                {group.items.map((item, i) => {
                  const isChosen = item.predictionFor === chosen?.predictionFor;
                  return (
                    <HourRow
                      key={item.predictionFor}
                      item={item}
                      first={i === 0}
                      selected={isChosen}
                      expanded={item.predictionFor === open}
                      confidence={item.predictionFor === nearest?.predictionFor ? nearest.modelConfidence : null}
                      onPress={() => tap(item)}
                      onLayout={
                        isChosen
                          ? (e) => {
                              pos.current.row = e.nativeEvent.layout.y;
                              scrollToChosen();
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Centralizado, como o aviso do Início: o link se alinha à esquerda; a View em volta fica no centro. */}
      <View style={styles.footer}>
        <View>
          <AppButton
            label={ui.aboutLink}
            hint={ui.aboutLinkHint}
            variant="link"
            onPress={() => router.push('/sobre')}
          />
        </View>
      </View>
    </TabScreen>
  );
}

const useStyles = createThemedStyles((c) => ({
  days: { gap: spacing.md },
  group: { gap: spacing.xs },
  card: { backgroundColor: c.surface, borderRadius: radius.lg, ...elevation.card },
  clip: { borderRadius: radius.lg, overflow: 'hidden' },
  footer: { alignItems: 'center' },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
