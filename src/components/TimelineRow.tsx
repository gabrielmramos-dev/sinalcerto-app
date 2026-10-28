import { Pressable, Text } from 'react-native';

import type { TimelineItem } from '@/api/types';
import { brasiliaClock, brasiliaDay } from '@/data/time';
import { quality, ui } from '@/i18n/glossary';
import { createThemedStyles, font, minTouch, radius, spacing } from '@/theme';
import { QualityBadge } from './StatusBadge';

interface Props {
  item: TimelineItem;
  selected: boolean;
  onPress: () => void;
}

/** RQ02: uma hora da timeline. Texto + ícone + cor + nota; tocar escolhe este horário (D6). */
export function TimelineRow({ item, selected, onPress }: Props) {
  const styles = useStyles();
  const clock = brasiliaClock(item.predictionFor);
  const label = ui.details.row(clock, brasiliaDay(item.predictionFor), quality[item.quality].label, item.qualityScore);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={ui.details.rowHint}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[font.label, styles.text, styles.clock]}>{selected ? `✓ ${clock}` : clock}</Text>
      <QualityBadge value={item.quality} />
      <Text style={[font.body, styles.text]}>{ui.details.rowScore(item.qualityScore)}</Text>
    </Pressable>
  );
}

const useStyles = createThemedStyles((c) => ({
  // flexWrap: com texto grande, o selo desce para a linha de baixo em vez de cortar (RNF05).
  row: {
    minHeight: minTouch,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  selected: { borderWidth: 3, borderColor: c.primary },
  pressed: { opacity: 0.8 },
  clock: { minWidth: 64 },
  text: { color: c.text },
}));
