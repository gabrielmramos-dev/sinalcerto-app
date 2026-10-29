import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { bandFor, formatDecimal } from '@/data/metrics';
import { brasiliaClock } from '@/data/time';
import { lossMeaning, metric, quality, redesBands, ui } from '@/i18n/glossary';
import { createThemedStyles, font, minTouch, spacing, useColors } from '@/theme';
import { StatusIcon } from './StatusIcon';

const t = ui.details;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// "O que é isso?" (texto pequeno, ~20 de altura) + 14 em cima e embaixo = 48 de área de toque.
const WHAT_IS_IT_SLOP = { top: 14, bottom: 14, left: 8, right: 8 };

interface Props {
  item: TimelineItem;
  /** Hora selecionada no app (destaque + ✓). */
  selected: boolean;
  /** Linha aberta ("O que esperar neste horário"); uma por vez, quem controla é a tela. */
  expanded: boolean;
  /** Primeira linha do dia: sem divisória em cima. */
  first: boolean;
  /** Confiança (0–1), só quando a API manda para esta mesma hora (D24). */
  confidence?: number | null;
  onPress: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

/**
 * D35: uma hora da lista. A categoria é a informação da linha (forma + cor + texto, RNF03); a nota não
 * aparece aqui, porque pode contradizer a categoria (D24). Tocar abre o que esperar neste horário.
 */
export function HourRow({ item, selected, expanded, first, confidence, onPress, onLayout }: Props) {
  const styles = useStyles();
  const c = useColors();
  const clock = brasiliaClock(item.predictionFor);
  const q = quality[item.quality];
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    // A divisória fica por fora, sempre sobre a superfície; o fundo da seleção, por dentro.
    <View style={!first && styles.divider} onLayout={onLayout}>
      <View style={selected && styles.selected}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={t.row(clock, q.label)}
          accessibilityHint={t.rowHint}
          accessibilityState={{ expanded, selected }}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={[font.label, styles.text, styles.clock]}>{selected ? `✓ ${clock}` : clock}</Text>
          <View style={styles.status}>
            <StatusIcon tone={q.tone} size={20} />
            <Text style={[font.body, styles.text]}>{q.label}</Text>
          </View>
          <Chevron color={c.textMuted} size={20} accessible={false} />
        </Pressable>
        {expanded && <Expect item={item} confidence={confidence} />}
      </View>
    </View>
  );
}

/** "O que esperar neste horário": uma linha por métrica; as explicações só abrem quando pedidas. */
function Expect({ item, confidence }: { item: TimelineItem; confidence?: number | null }) {
  const styles = useStyles();
  // A faixa usa o valor arredondado, o mesmo que aparece na tela (D23).
  const ms = Math.round(item.predictedAvgRttMs);
  const pct = formatDecimal(item.predictedPacketLossPct);
  const latencyEffect = cap(bandFor(ms, redesBands.latency).effect!);
  const lossEffect = bandFor(item.predictedPacketLossPct, redesBands.packetLoss).effect!;
  const confidencePct = confidence != null ? Math.round(confidence * 100) : null;
  const scoreLine = [t.score(item.qualityScore), ...(confidencePct != null ? [t.confidence(confidencePct)] : [])];
  const scoreSpoken = [
    t.score(item.qualityScore),
    ...(confidencePct != null ? [t.confidenceSpoken(confidencePct)] : []),
  ].join('. ');

  return (
    <View style={styles.panel}>
      <Text style={[font.small, styles.muted]} accessibilityRole="header">
        {t.expect}
      </Text>
      <Metric
        name={t.latencyName}
        line={t.metricLine(t.latencyName, `${ms} ms`)}
        spoken={`${t.latencyName}: ${ms} milissegundos. ${latencyEffect}`}
        effect={latencyEffect}
        details={[metric.latency.explanation, metric.latency.rttNote]}
      />
      <Metric
        name={t.lossName}
        line={t.metricLine(t.lossName, `${pct}%`)}
        spoken={`${t.lossName}: ${pct} por cento. ${lossEffect}`}
        effect={lossEffect}
        details={[lossMeaning(item.predictedPacketLossPct), metric.packetLoss.explanation]}
      />
      {/* Nota e confiança: secundárias, porque a nota pode contradizer a categoria (D24, D35). */}
      <Metric
        name={t.scoreName}
        line={scoreLine.join(' · ')}
        spoken={scoreSpoken}
        details={[metric.score.explanation, ...(confidencePct != null ? [metric.confidence.explanation] : [])]}
        secondary
      />
    </View>
  );
}

interface MetricProps {
  name: string;
  line: string;
  /** Como o leitor de tela fala a linha (ex.: "milissegundos" em vez de "ms"). */
  spoken: string;
  effect?: string;
  /** Explicação longa, só sob demanda ("O que é isso?"). */
  details: string[];
  secondary?: boolean;
}

function Metric({ name, line, spoken, effect, details, secondary }: MetricProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.metric}>
      {/* Nome + valor à esquerda e "O que é isso?" à direita, na mesma linha; com texto grande, o link desce. */}
      <View style={styles.metricHead}>
        {/* Lido como um item só, já com a frase de efeito (a frase abaixo fica escondida do leitor de tela). */}
        {/* eslint-disable-next-line react-native-a11y/has-accessibility-hint */}
        <Text
          style={[secondary ? [font.small, styles.muted] : [font.label, styles.text], styles.shrink]}
          accessibilityLabel={spoken}
        >
          {line}
        </Text>
        <Pressable
          onPress={() => setOpen(!open)}
          accessibilityRole="button"
          accessibilityLabel={t.whatIsItLabel(name)}
          accessibilityHint={t.whatIsItHint}
          accessibilityState={{ expanded: open }}
          // Alvo de 48 pelo hitSlop: a área de toque cresce sem abrir vão na tela (RNF09).
          hitSlop={WHAT_IS_IT_SLOP}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={[font.small, styles.link]}>{t.whatIsIt}</Text>
        </Pressable>
      </View>
      {effect && (
        <Text style={[font.body, styles.text]} accessibilityElementsHidden importantForAccessibility="no">
          {effect}
        </Text>
      )}
      {open &&
        details.map((d) => (
          <Text key={d} style={[font.small, styles.muted]}>
            {d}
          </Text>
        ))}
    </View>
  );
}

const useStyles = createThemedStyles((c) => ({
  divider: { borderTopWidth: 1, borderTopColor: c.border },
  // Fundo suave + ✓ na hora: a seleção não depende só da cor (RNF03).
  selected: { backgroundColor: c.primarySoft },
  // flexWrap: com texto grande, o status desce de linha em vez de cortar (RNF05).
  row: {
    minHeight: minTouch,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clock: { minWidth: 72 },
  status: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pressed: { opacity: 0.7 },
  panel: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  metric: { gap: spacing.xs },
  metricHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    columnGap: spacing.md,
  },
  shrink: { flexShrink: 1 },
  link: { color: c.primary, textDecorationLine: 'underline' },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
