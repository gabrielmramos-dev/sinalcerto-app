import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { QUALITIES } from '@/api/types';
import { QualityBadge } from '@/components/StatusBadge';
import { DEFAULT_MODEL_ID, forecastSource } from '@/data';
import { formatBrasiliaLong } from '@/data/time';
import { useLoad } from '@/hooks/useLoad';
import { about, quality, redesBands } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { colors, font, spacing } from '@/theme';

/** D26: bastidores da previsão. Única tela com linguagem técnica. */
export default function AboutScreen() {
  const { probeId } = useAppState();
  // Modelo e período vêm da própria fonte de dados, para o texto nunca ficar desatualizado.
  const load = useCallback(
    () => Promise.all([forecastSource.getModels(), forecastSource.getTimeline(probeId, DEFAULT_MODEL_ID)]),
    [probeId],
  );
  const info = useLoad(load);
  const model = info.status === 'ok' ? info.data[0].find((m) => m.id === DEFAULT_MODEL_ID) : undefined;
  const items = info.status === 'ok' ? info.data[1].items : [];
  const first = items[0];
  const last = items[items.length - 1];

  return (
    // Cabeçalho do Stack transparente no iOS 26+ (SDK 58): o conteúdo não passa por baixo dele.
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Text style={[font.body, styles.text]}>{about.intro}</Text>

      <Section title={about.sourceTitle} texts={[about.source]} />

      <Section
        title={about.modelTitle}
        texts={[
          info.status === 'loading'
            ? about.modelLoading
            : model
              ? about.model(model.name, model.groupName, model.algorithm, model.version)
              : about.modelUnknown(DEFAULT_MODEL_ID),
        ]}
      />

      {first && last && (
        <Section
          title={about.periodTitle}
          texts={[about.period(formatBrasiliaLong(first.predictionFor), formatBrasiliaLong(last.predictionFor))]}
        />
      )}

      <Section title={about.regionsTitle} texts={[about.regions]} />

      <Section title={about.categoriesTitle} texts={[about.categories]}>
        {QUALITIES.map((q) => (
          // Linha estática lida como uma frase. Texto + ícone + cor, nunca só cor (RNF03).
          // eslint-disable-next-line react-native-a11y/has-accessibility-hint
          <View
            key={q}
            style={styles.row}
            accessible
            accessibilityLabel={about.equivalence(quality[q].label, quality[q].redes)}
          >
            <QualityBadge value={q} />
            <Text style={[font.body, styles.text]}>{about.equivalenceVisible(quality[q].redes)}</Text>
          </View>
        ))}
      </Section>

      <Section
        title={about.bandsTitle}
        texts={[
          about.bands,
          about.bandList(about.latencyName, redesBands.latency),
          about.bandList(about.lossName, redesBands.packetLoss),
          about.bandList(about.jitterName, redesBands.jitter),
          about.jitterNote,
        ]}
      />

      <Section title={about.scoreTitle} texts={[about.score]} />
    </ScrollView>
  );
}

function Section({ title, texts, children }: { title: string; texts: string[]; children?: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[font.heading, styles.text]} accessibilityRole="header">
        {title}
      </Text>
      {texts.map((t) => (
        <Text key={t} style={[font.body, styles.text]}>
          {t}
        </Text>
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg },
  section: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  text: { color: colors.text },
});
