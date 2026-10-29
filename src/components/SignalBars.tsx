import Svg, { Rect } from 'react-native-svg';

import type { Tone } from '@/i18n/glossary';
import { useColors } from '@/theme';

const FILLED: Record<Tone, number> = { good: 4, moderate: 2, unstable: 1 };

/**
 * Barras de sinal (D29): reforço visual da categoria. Decorativas para o leitor de tela: a categoria
 * já está no texto e no nome do grupo onde as barras aparecem.
 */
export function SignalBars({ tone, size = 28 }: { tone: Tone; size?: number }) {
  const c = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" accessible={false} importantForAccessibility="no-hide-descendants">
      {[0, 1, 2, 3].map((i) => (
        <Rect
          key={i}
          x={2 + i * 7}
          y={20 - i * 6}
          width={5}
          height={6 + i * 6}
          rx={1.5}
          fill={c[tone]}
          opacity={i < FILLED[tone] ? 1 : 0.25}
        />
      ))}
    </Svg>
  );
}
