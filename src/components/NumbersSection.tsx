import { StyleSheet, Text, View } from 'react-native';

import { QUALITIES, type TimelineItem } from '@/api/types';
import { bandFor, formatDecimal } from '@/data/metrics';
import { formatBrasiliaLong } from '@/data/time';
import { metric, numbersSection as txt, quality, redesBands } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { QualityBadge } from './StatusBadge';

interface Props {
  item: TimelineItem;
  /** Verdadeiro quando o usuário não escolheu hora e a seção mostra a previsão mais próxima. */
  isNearest: boolean;
  /** modelConfidence (0–1) da API, só quando ela mandar para esta mesma hora (D24). */
  confidence?: number | null;
}

/** RNF07: cada termo técnico com o valor do horário e uma explicação em linguagem simples. */
export function NumbersSection({ item, isNearest, confidence }: Props) {
  const rtt = formatDecimal(item.predictedAvgRttMs);
  const loss = formatDecimal(item.predictedPacketLossPct);

  return (
    <View style={styles.section}>
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        {txt.title}
      </Text>
      <Text style={[font.body, styles.text]}>{txt.valuesFor(formatBrasiliaLong(item.predictionFor, false))}</Text>
      {isNearest && <Text style={[font.small, styles.muted]}>{txt.nearestNote}</Text>}

      <QualityBadge value={item.quality} />
      <Text style={[font.body, styles.text]}>{redesBands.intro}</Text>

      <Metric
        term={metric.latency.term}
        value={`${rtt} ms`}
        spokenValue={`${rtt} milissegundos`}
        band={txt.bandOf(bandFor(item.predictedAvgRttMs, redesBands.latency))}
        texts={[metric.latency.explanation, metric.latency.rttNote]}
      />
      <Metric
        term={metric.packetLoss.term}
        value={`${loss}%`}
        spokenValue={`${loss} por cento`}
        band={txt.bandOf(bandFor(item.predictedPacketLossPct, redesBands.packetLoss))}
        texts={[metric.packetLoss.explanation]}
      />
      <Metric
        term={metric.jitter.term}
        value={metric.jitter.notInForecast}
        band={txt.jitterBands}
        texts={[metric.jitter.explanation]}
      />
      <Metric
        term={metric.score.term}
        value={`${item.qualityScore} de 100`}
        texts={[metric.score.explanation]}
      />
      {confidence != null && (
        <Metric
          term={metric.confidence.term}
          value={`${Math.round(confidence * 100)}%`}
          spokenValue={`${Math.round(confidence * 100)} por cento`}
          texts={[metric.confidence.explanation]}
        />
      )}

      <Text style={[font.heading, styles.text]} accessibilityRole="header">
        {txt.equivalenceTitle}
      </Text>
      <Text style={[font.body, styles.text]}>{txt.equivalenceIntro}</Text>
      {QUALITIES.map((q) => (
        // Linha estática lida como uma frase. Texto + ícone + cor, nunca só cor (RNF03).
        // eslint-disable-next-line react-native-a11y/has-accessibility-hint
        <View
          key={q}
          style={styles.row}
          accessible
          accessibilityLabel={`${quality[q].label}, no app, equivale a ${quality[q].redes}, em Redes`}
        >
          <QualityBadge value={q} />
          <Text style={[font.body, styles.text]}>= {quality[q].redes} (Redes)</Text>
        </View>
      ))}
    </View>
  );
}

interface MetricProps {
  term: string;
  value: string;
  /** Como o leitor de tela deve falar o valor (ex.: "milissegundos" em vez de "ms"). */
  spokenValue?: string;
  band?: string;
  texts: string[];
}

function Metric({ term, value, spokenValue, band, texts }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={[font.heading, styles.text]} accessibilityRole="header">
        {term}
      </Text>
      {/* Texto estático: o rótulo só troca "ms" por "milissegundos" na fala, não é controle. */}
      {/* eslint-disable-next-line react-native-a11y/has-accessibility-hint */}
      <Text style={[font.label, styles.text]} accessibilityLabel={spokenValue}>
        {value}
      </Text>
      {band && <Text style={[font.body, styles.text]}>{band}</Text>}
      {texts.map((t) => (
        <Text key={t} style={[font.body, styles.muted]}>
          {t}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm, marginTop: spacing.lg },
  metric: {
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
