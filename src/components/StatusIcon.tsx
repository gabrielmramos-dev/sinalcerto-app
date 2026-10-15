import Svg, { Circle, Path, Polygon } from 'react-native-svg';

import type { Tone } from '@/i18n/glossary';
import { colors } from '@/theme';

// Uma forma diferente por categoria (círculo, triângulo, octógono), para não depender só da cor (RNF03).
// Decorativo para o leitor de tela: o texto ao lado já diz a categoria.
export function StatusIcon({ tone, size = 24 }: { tone: Tone; size?: number }) {
  const color = colors[tone];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false} importantForAccessibility="no-hide-descendants">
      {tone === 'good' && (
        <>
          <Circle cx={12} cy={12} r={11} fill={color} />
          <Path d="M6.5 12.5l3.5 3.5 7.5-8" stroke={colors.surface} strokeWidth={2.5} fill="none" />
        </>
      )}
      {tone === 'moderate' && (
        <>
          <Polygon points="12,1.5 23,22 1,22" fill={color} />
          <Path d="M12 8.5v6.5M12 17.5v2" stroke={colors.surface} strokeWidth={2.5} />
        </>
      )}
      {tone === 'unstable' && (
        <>
          <Polygon points="7.5,1 16.5,1 23,7.5 23,16.5 16.5,23 7.5,23 1,16.5 1,7.5" fill={color} />
          <Path d="M8 8l8 8M16 8l-8 8" stroke={colors.surface} strokeWidth={2.5} />
        </>
      )}
    </Svg>
  );
}
