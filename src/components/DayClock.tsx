import { Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect, Text as SvgText } from 'react-native-svg';

import type { TimelineItem } from '@/api/types';
import { brasiliaClock, brasiliaHour } from '@/data/time';
import { quality } from '@/i18n/glossary';
import { font, fonts, spacing, useColors, type Palette } from '@/theme';

/** Padrões compartilhados pelo relógio e pela legenda (ids por prefixo, um conjunto por Svg). */
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

const fillsFor = (c: Palette, prefix: string) =>
  ({ GOOD: c.good, MODERATE: `url(#${prefix}-moderate)`, UNSTABLE: `url(#${prefix}-unstable)` }) as const;

/** Legenda dos padrões: amostra + nome da categoria em texto (o texto escala com o sistema, RNF05). */
export function ClockLegend() {
  const c = useColors();
  const fills = fillsFor(c, 'legend');
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
      {(['GOOD', 'MODERATE', 'UNSTABLE'] as const).map((q) => (
        <View key={q} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Svg width={18} height={18} accessible={false} importantForAccessibility="no-hide-descendants">
            <Patterns c={c} prefix="legend" />
            <Rect width={18} height={18} rx={4} fill={fills[q]} />
          </Svg>
          <Text style={[font.small, { color: c.text }]}>{quality[q].label}</Text>
        </View>
      ))}
    </View>
  );
}

const SIZE = 300;
const C = SIZE / 2;
const R_OUT = 118;
const R_IN = 84;
const GAP = 2; // graus entre as fatias

const point = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
};

/**
 * Fatia da hora h (0 h no topo, sentido horário, 15° por hora). D30: como num relógio de verdade, a
 * fatia COMEÇA no ângulo da hora (h:00) e vai até h+1; antes ela ficava centrada no rótulo e invadia
 * meia hora de cada lado, o que parecia um deslocamento de uma hora.
 */
function slice(h: number) {
  const a0 = h * 15 + GAP / 2;
  const a1 = (h + 1) * 15 - GAP / 2;
  return `M ${point(R_OUT, a0)} A ${R_OUT} ${R_OUT} 0 0 1 ${point(R_OUT, a1)} L ${point(R_IN, a1)} A ${R_IN} ${R_IN} 0 0 0 ${point(R_IN, a0)} Z`;
}

interface Props {
  items: TimelineItem[];
  /** Hora marcada com o ponto e mostrada no centro (ex.: a do cartão do Início). */
  markTime?: string;
}

/**
 * D29: o elemento assinatura. Uma fatia por hora no relógio de Brasília; padrão por categoria (liso =
 * Boa, pontilhado = Regular, quadriculado = Instável), para não depender só da cor (RNF03).
 * Decorativo para o leitor de tela: quem usa o relógio põe um resumo em texto no grupo dele, e a
 * escolha de hora existe também pela lista (aba Detalhes).
 */
export function DayClock({ items, markTime }: Props) {
  const c = useColors();
  const fillFor = fillsFor(c, 'clock');
  const marked = items.find((i) => i.predictionFor === markTime);
  const [mx, my] = marked
    ? point((R_OUT + R_IN) / 2, (brasiliaHour(marked.predictionFor) + 0.5) * 15).split(' ').map(Number) // meio da fatia
    : [0, 0];
  const labels: [string, number][] = [
    ['00h', 0],
    ['06h', 90],
    ['12h', 180],
    ['18h', 270],
  ];

  return (
    <View style={{ width: '100%', maxWidth: SIZE, aspectRatio: 1, alignSelf: 'center' }}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Patterns c={c} prefix="clock" />

        {items.map((item) => (
          <Path key={item.predictionFor} d={slice(brasiliaHour(item.predictionFor))} fill={fillFor[item.quality]} />
        ))}

        {labels.map(([text, deg]) => {
          const [x, y] = point(R_OUT + 20, deg).split(' ').map(Number);
          return (
            <SvgText
              key={text}
              x={x}
              y={(y ?? 0) + 5}
              textAnchor="middle"
              fontFamily={fonts.semibold}
              fontSize={14}
              fill={c.textMuted}
            >
              {text}
            </SvgText>
          );
        })}

        {marked && (
          <G>
            <Circle
              cx={mx}
              cy={my}
              r={7}
              fill={c.text}
              stroke={c.surface}
              strokeWidth={2.5}
            />
            <SvgText x={C} y={C + 4} textAnchor="middle" fontFamily={fonts.serif} fontSize={34} fill={c.text}>
              {brasiliaClock(marked.predictionFor)}
            </SvgText>
            <SvgText x={C} y={C + 30} textAnchor="middle" fontFamily={fonts.semibold} fontSize={15} fill={c.text}>
              {quality[marked.quality].label}
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
}
