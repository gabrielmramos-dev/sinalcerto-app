import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useState, type ComponentRef, type Ref } from 'react';
import { AccessibilityInfo, Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect, Text as SvgText } from 'react-native-svg';

import type { TimelineItem } from '@/api/types';
import { brasiliaClock, brasiliaHour, formatBrasilia } from '@/data/time';
import { quality, ui } from '@/i18n/glossary';
import { createThemedStyles, font, fonts, minTouch, spacing, useColors, type Palette } from '@/theme';

const t = ui.strip;

/** Padrões por categoria (D29). Ids por prefixo, um conjunto por Svg. */
function Patterns({ c, prefix }: { c: Palette; prefix: string }) {
  return (
    <Defs>
      <Pattern id={`${prefix}-moderate`} patternUnits="userSpaceOnUse" width={6} height={6}>
        <Rect width={6} height={6} fill={c.moderate} />
        <Circle cx={3} cy={3} r={1.2} fill={c.surface} />
      </Pattern>
      <Pattern id={`${prefix}-unstable`} patternUnits="userSpaceOnUse" width={7} height={7}>
        <Rect width={7} height={7} fill={c.unstable} />
        <Path d="M0 0L7 7M7 0L0 7" stroke={c.surface} strokeWidth={1.2} />
      </Pattern>
    </Defs>
  );
}

const fillsFor = (c: Palette, prefix: string) => ({
  GOOD: c.good,
  MODERATE: `url(#${prefix}-moderate)`,
  UNSTABLE: `url(#${prefix}-unstable)`,
});

/** Legenda compacta: amostra + nome em texto (o texto escala com o sistema, RNF05). */
function Legend() {
  const c = useColors();
  const fills = fillsFor(c, 'legend');
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
      {(['GOOD', 'MODERATE', 'UNSTABLE'] as const).map((q) => (
        <View key={q} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Svg width={14} height={14} accessible={false} importantForAccessibility="no-hide-descendants">
            <Patterns c={c} prefix="legend" />
            <Rect width={14} height={14} rx={3} fill={fills[q]} />
          </Svg>
          <Text style={[font.small, { color: c.text }]}>{quality[q].label}</Text>
        </View>
      ))}
    </View>
  );
}

// Geometria (viewBox): uma coluna de 14 por hora; barra de 10. D34: todas com a mesma altura.
const COL = 14;
const BAR = 10;
const BAR_H = 56;
const BOTTOM = 38; // rótulos das horas e a data
const W = COL * 24;
const H = BAR_H + BOTTOM;

interface Props {
  items: TimelineItem[];
  /** predictionFor da hora escolhida (contorno + rótulo acima). */
  selected?: string;
  onSelect: (predictionFor: string) => void;
  /** Texto secundário à esquerda da linha de cima (ex.: "19 e 20 de agosto"). */
  caption: string;
  /** D34: "Trocar hora" (Atividades) traz o foco do leitor de tela para a faixa. */
  ref?: Ref<ComponentRef<typeof View>>;
}

/**
 * D33 + D34: faixa do dia. 24 barras em ordem de tempo, todas da mesma altura: a categoria (cor +
 * padrão, nunca só a cor, RNF03) é a informação; a nota não entra, para uma Regular não parecer
 * "melhor" que uma Boa. A faixa inteira é UMA área de toque (cada barra tem uns 14 pt) e escolhe a
 * barra mais próxima; "Hora anterior" e "Próxima hora" fazem o ajuste fino. No leitor de tela, é
 * ajustável: deslizar para cima ou para baixo muda a hora.
 */
export function DayStrip({ items, selected, onSelect, caption, ref }: Props) {
  const styles = useStyles();
  const c = useColors();
  const [width, setWidth] = useState(0);
  const fill = fillsFor(c, 'strip');
  const index = items.findIndex((i) => i.predictionFor === selected);
  const current = items[index];
  const valueOf = (item: TimelineItem) => t.value(brasiliaClock(item.predictionFor), quality[item.quality].label);
  const value = current ? valueOf(current) : t.none;

  const choose = (i: number, announce = false) => {
    const item = items[Math.max(0, Math.min(items.length - 1, i))];
    if (!item) return;
    onSelect(item.predictionFor);
    // Para os botões: o leitor de tela fala o botão, não a faixa; então avisa a hora nova.
    if (announce) AccessibilityInfo.announceForAccessibility(valueOf(item));
  };
  const step = (delta: number, announce = false) =>
    choose(index < 0 ? (delta > 0 ? 0 : items.length - 1) : index + delta, announce);
  const onPress = (e: GestureResponderEvent) => {
    if (width > 0) choose(Math.floor((e.nativeEvent.locationX / width) * items.length));
  };

  return (
    <View style={styles.wrap}>
      {/* D34: linha de cima. A hora e a categoria vêm em texto (não só a cor da barra) e crescem com o
          texto do sistema. Escondida do leitor de tela: a faixa logo abaixo fala o mesmo valor. */}
      <View style={styles.top} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={[font.small, styles.muted, styles.shrink]}>{caption}</Text>
        <Text style={[font.label, styles.text]}>{value}</Text>
      </View>
      <Pressable
        ref={ref}
        onPress={onPress}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessibilityRole="adjustable"
        accessibilityLabel={t.label}
        accessibilityHint={t.hint}
        accessibilityValue={{ text: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }, { name: 'activate' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') step(1);
          if (e.nativeEvent.actionName === 'decrement') step(-1);
          // 'activate' (toque duplo): não faz nada; sem isso o toque cairia no meio da faixa.
        }}
        onAccessibilityTap={() => {}}
        style={styles.strip}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <Patterns c={c} prefix="strip" />
          {items.map((item, i) => {
            const isSel = item.predictionFor === selected;
            return (
              <Rect
                key={item.predictionFor}
                x={i * COL + (COL - BAR) / 2}
                y={2}
                width={BAR}
                height={BAR_H - 4}
                rx={2}
                fill={fill[item.quality]}
                stroke={isSel ? c.text : undefined}
                strokeWidth={isSel ? 2.5 : undefined}
              />
            );
          })}
          {items.map((item, i) => {
            const hour = brasiliaHour(item.predictionFor);
            if (hour % 3 !== 0 && i !== 0) return null;
            return (
              <SvgText
                key={item.predictionFor}
                x={Math.max(10, i * COL + COL / 2)}
                y={BAR_H + 13}
                textAnchor="middle"
                fontFamily={fonts.semibold}
                fontSize={11}
                fill={c.textMuted}
              >
                {`${hour}h`}
              </SvgText>
            );
          })}
          {items.map((item, i) => {
            if (i !== 0 && brasiliaHour(item.predictionFor) !== 0) return null;
            // "20/08": curto para não encostar no rótulo seguinte.
            return (
              <SvgText
                key={`d${item.predictionFor}`}
                x={i * COL + 1}
                y={BAR_H + 30}
                fontFamily={fonts.medium}
                fontSize={11}
                fill={c.textMuted}
              >
                {formatBrasilia(item.predictionFor).slice(0, 5)}
              </SvgText>
            );
          })}
        </Svg>
      </Pressable>
      {/* D34: alternativa ao toque na faixa (WCAG 2.5.7), compacta e nas bordas, para não pesar mais que a faixa. */}
      <View style={styles.buttons}>
        <StepButton dir="prev" disabled={index === 0} onPress={() => step(-1, true)} />
        <StepButton dir="next" disabled={index === items.length - 1} onPress={() => step(1, true)} />
      </View>
      <Legend />
    </View>
  );
}

/** Seta + texto (a direção não depende só do ícone). Alvo mínimo de 48 (acima dos 44 pedidos, RNF09). */
function StepButton({ dir, disabled, onPress }: { dir: 'prev' | 'next'; disabled: boolean; onPress: () => void }) {
  const styles = useStyles();
  const c = useColors();
  const label = dir === 'prev' ? t.prev : t.next;
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={dir === 'prev' ? t.prevHint : t.nextHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.step, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {dir === 'prev' && <Icon color={c.primary} size={20} accessible={false} />}
      <Text style={[font.small, styles.link]}>{label}</Text>
      {dir === 'next' && <Icon color={c.primary} size={20} accessible={false} />}
    </Pressable>
  );
}

const useStyles = createThemedStyles((c) => ({
  wrap: { gap: spacing.sm },
  strip: { width: '100%', aspectRatio: W / H, minHeight: minTouch },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm },
  step: { minHeight: minTouch, minWidth: minTouch, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  link: { color: c.primary },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
  top: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    columnGap: spacing.sm,
  },
  shrink: { flexShrink: 1 },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
