import { StyleSheet, Text, View } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { bandFor, formatDecimal } from '@/data/metrics';
import { formatBrasiliaLong } from '@/data/time';
import { metric, numbersSection as txt, redesBands } from '@/i18n/glossary';
import { colors, font, spacing } from '@/theme';
import { QualityBadge } from './StatusBadge';

interface Props {
  item: TimelineItem;
  /** Verdadeiro quando o usuário não escolheu hora e a seção mostra a previsão mais próxima. */
  isNearest: boolean;
  /** Confiança (0–1), só quando existe para esta mesma hora (D24). */
  confidence?: number | null;
}

/**
 * RNF07 + D26: cada número vira consequência prática. As faixas de Redes (D23) só escolhem a frase;
 * o nome e os limites delas aparecem apenas na tela "Sobre".
 */
export function NumbersSection({ item, isNearest, confidence }: Props) {
  // A faixa usa o valor arredondado, o mesmo que aparece na tela (nunca "20 ms" com duas frases).
  const ms = Math.round(item.predictedAvgRttMs);
  const latencyEffect = bandFor(ms, redesBands.latency).effect!;
  const lossText = txt.lossValue(formatDecimal(item.predictedPacketLossPct), item.predictedPacketLossPct);
  const lossEffect = bandFor(item.predictedPacketLossPct, redesBands.packetLoss).effect!;
  const confidencePct = confidence != null ? Math.round(confidence * 100) : null;

  return (
    <View style={styles.section}>
      <Text style={[font.title, styles.text]} accessibilityRole="header">
        {txt.title}
      </Text>
      <Text style={[font.body, styles.text]}>{txt.valuesFor(formatBrasiliaLong(item.predictionFor, false))}</Text>
      {isNearest && <Text style={[font.small, styles.muted]}>{txt.nearestNote}</Text>}

      <QualityBadge value={item.quality} />

      <Metric
        term={metric.latency.term}
        value={txt.latencyValue(ms, latencyEffect)}
        spokenValue={txt.latencySpoken(ms, latencyEffect)}
        texts={[metric.latency.explanation, metric.latency.rttNote]}
      />
      <Metric
        term={metric.packetLoss.term}
        value={lossText}
        spokenValue={txt.lossSpoken(lossText)}
        effect={lossEffect}
        texts={[metric.packetLoss.explanation]}
      />
      <Metric term={metric.score.term} value={txt.scoreValue(item.qualityScore)} texts={[metric.score.explanation]} />
      {confidencePct != null && (
        <Metric
          term={metric.confidence.term}
          value={txt.confidenceValue(confidencePct)}
          spokenValue={txt.confidenceSpoken(confidencePct)}
          texts={[metric.confidence.explanation]}
        />
      )}
    </View>
  );
}

interface MetricProps {
  term: string;
  value: string;
  /** Como o leitor de tela deve falar o valor (ex.: "milissegundos" em vez de "ms"). */
  spokenValue?: string;
  /** Consequência prática, logo abaixo do valor. */
  effect?: string;
  texts: string[];
}

function Metric({ term, value, spokenValue, effect, texts }: MetricProps) {
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
      {effect && <Text style={[font.body, styles.text]}>{effect}</Text>}
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
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
