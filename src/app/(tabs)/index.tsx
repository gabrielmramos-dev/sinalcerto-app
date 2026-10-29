import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, type ComponentRef } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { AppButton } from '@/components/AppButton';
import { BestAvoid } from '@/components/BestAvoid';
import { DayStrip } from '@/components/DayStrip';
import { ForecastHero } from '@/components/ForecastHero';
import { ScreenState } from '@/components/ScreenState';
import { SourceBanner } from '@/components/SourceBanner';
import { TabScreen } from '@/components/TabScreen';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { NoDataError } from '@/data/ForecastSource';
import { dayRange, formatWindows, windowsWhere } from '@/data/forecastSummary';
import { regionName } from '@/data/regions';
import { formatBrasiliaLong } from '@/data/time';
import { useChosenHour } from '@/hooks/useChosenHour';
import { useLoad } from '@/hooks/useLoad';
import { bestPeriod } from '@/lib/bestPeriod';
import { errorMessage, quality, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, elevation, font, radius, spacing } from '@/theme';

const t = ui.home;

/** D33 + D34 (wireframe v2): o Início responde uma pergunta só, "como está a internet?". */
export default function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const { probeId } = useAppState();
  const name = regionName(probeId);
  const region = ui.common.region(name);
  const stripRef = useRef<ComponentRef<typeof View>>(null);

  const load = useCallback(() => forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID), [probeId]);
  const timeline = useLoad(load);
  const items = timeline.status === 'ok' ? timeline.data.items : [];
  // D34: o cartão mostra SEMPRE a hora selecionada na faixa (uma resposta só na tela).
  const { chosen, choose } = useChosenHour(items);

  // RNF08: avisa o leitor de tela quando a previsão chega ou muda de região. Trocar a hora na faixa não
  // repete o aviso: a própria faixa (ajustável) fala o valor novo.
  const data = timeline.status === 'ok' ? timeline.data : undefined;
  useEffect(() => {
    if (data && chosen) AccessibilityInfo.announceForAccessibility(`${region}. ${spoken(chosen)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, region]);

  // D34: "Trocar hora" (Atividades) chega aqui com ?focus=faixa e leva o foco do leitor de tela à faixa.
  useEffect(() => {
    if (focus !== 'faixa' || !data || !stripRef.current) return;
    AccessibilityInfo.sendAccessibilityEvent(stripRef.current, 'focus');
    router.setParams({ focus: undefined });
  }, [focus, data, router]);

  return (
    <TabScreen>
      <SourceBanner />
      {/* Região curta na tela; o leitor de tela ouve "Região escolhida: …". Quebra linha só com texto grande. */}
      <View style={styles.location}>
        {/* D37: a região é o cabeçalho da tela para o leitor de tela (navegação por títulos), sem mudar o
            visual. O rótulo só completa o contexto ("Região escolhida: …"). */}
        {/* eslint-disable-next-line react-native-a11y/has-accessibility-hint */}
        <Text style={[font.label, styles.text, styles.grow]} accessibilityRole="header" accessibilityLabel={region}>
          {name}
        </Text>
        <AppButton
          label={t.changeShort}
          a11yLabel={t.changeLocation}
          hint={t.changeLocationHint}
          onPress={() => router.push('/local')}
        />
      </View>

      {timeline.status === 'loading' && <ScreenState kind="loading" />}
      {timeline.status === 'error' &&
        (timeline.error instanceof NoDataError ? (
          <ScreenState kind="empty" message={t.noDataForRegion} />
        ) : (
          <ScreenState kind="error" message={errorMessage(timeline.error, t.loadError)} onRetry={timeline.retry} />
        ))}

      {chosen && (
        <ForecastHero
          title={formatBrasiliaLong(chosen.predictionFor, false)}
          value={chosen.quality}
          lines={[quality[chosen.quality].sentence]}

          spoken={spoken(chosen)}
        />
      )}

      {items.length > 0 && (
        <>
          <View style={styles.card}>
            <DayStrip
              ref={stripRef}
              items={items}
              selected={chosen?.predictionFor}
              onSelect={choose}
              caption={dayRange(items)}
            />
          </View>
          <View style={styles.card}>
            <DayBestAvoid items={items} />
          </View>
          <AppButton
            label={t.seeActivities}
            hint={t.seeActivitiesHint}
            variant="primary"
            onPress={() => router.navigate('/atividades')}
          />
        </>
      )}

      {/* D34: aviso em uma linha; o texto completo fica na tela Sobre (revelação progressiva). */}
      <View style={styles.estimate}>
        <Text style={[font.small, styles.muted, styles.center]}>{t.estimate}</Text>
        {/* O link se alinha à esquerda por padrão; a View em volta é que fica no centro. */}
        <View>
          <AppButton
            label={t.learnMore}
            a11yLabel={t.learnMoreLabel}
            hint={t.learnMoreHint}
            variant="link"
            onPress={() => router.push('/sobre')}
          />
        </View>
      </View>
    </TabScreen>
  );
}

/** Melhor: a sequência Boa mais longa ("das 23h às 7h · Boa"). Evite: as horas Instáveis. */
function DayBestAvoid({ items }: { items: TimelineItem[] }) {
  const best = bestPeriod(items);
  const unstable = windowsWhere(items, (i) => i.quality === 'UNSTABLE');
  const bestText = best
    ? ui.hours.withQuality(best.allDay ? ui.hours.all : formatWindows([best.window]), quality[best.quality].label)
    : ui.hours.none;
  const avoidText = unstable.length
    ? ui.hours.withQuality(formatWindows(unstable), quality.UNSTABLE.label)
    : ui.hours.none;
  return <BestAvoid best={bestText} avoid={avoidText} />;
}

/** O cartão de topo numa frase: categoria, frase e a hora selecionada. */
function spoken(item: TimelineItem): string {
  const q = quality[item.quality];
  return `${formatBrasiliaLong(item.predictionFor, false)}. ${ui.common.qualityContext}: ${q.label}. ${q.sentence}`;
}

const useStyles = createThemedStyles((c) => ({
  location: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  grow: { flexGrow: 1, flexShrink: 1 },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...elevation.card,
  },
  // Um embaixo do outro, centralizados; o link mantém o alvo de 48 do AppButton (RNF09).
  estimate: { alignItems: 'center' },
  center: { textAlign: 'center' },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
