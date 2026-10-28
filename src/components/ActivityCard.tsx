import Check from 'lucide-react-native/icons/check';
import Globe from 'lucide-react-native/icons/globe';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import Phone from 'lucide-react-native/icons/phone';
import Tv from 'lucide-react-native/icons/tv';
import Upload from 'lucide-react-native/icons/upload';
import Video from 'lucide-react-native/icons/video';
import { Pressable, Text, View } from 'react-native';

import type { Activity } from '@/api/types';
import type { CardState } from '@/hooks/useActivityChecks';
import { activity as activityText, recommendation, suitability, ui } from '@/i18n/glossary';
import { createThemedStyles, elevation, font, minTouch, radius, spacing, useColors } from '@/theme';
import { AppButton } from './AppButton';
import { StatusBadge } from './StatusBadge';

const ICONS = {
  VIDEO_CALL: Video,
  AUDIO_CALL: Phone,
  STREAMING: Tv,
  FILE_UPLOAD: Upload,
  WEB_BROWSING: Globe,
  MESSAGING: MessageCircle,
} as const;

interface Props {
  activity: Activity;
  /** Resultado no horário escolhido; sem horário escolhido, o cartão só mostra o nome (e serve ao planejador). */
  state?: CardState;
  onRetry: () => void;
  /** Falso quando o conselho é o mesmo para todas e já aparece uma vez acima dos cartões. */
  showAdvice: boolean;
  /** D31: atividade escolhida no planejador (✓ + estado selecionado). */
  selected: boolean;
  onSelect: () => void;
  /** Frase do planejador, mostrada no cartão escolhido (ex.: "Chamada de vídeo: melhor das 23h às 7h"). */
  plan?: string;
}

/** RQ03: status vem de `suitable` e conselho de `recommendation.code`, os dois da API. */
export function ActivityCard({ activity, state, onRetry, showAdvice, selected, onSelect, plan }: Props) {
  const styles = useStyles();
  const c = useColors();
  const { name, examples } = activityText[activity];
  const Icon = ICONS[activity];
  const header = (
    <View style={styles.row}>
      <View style={styles.chip}>
        <Icon color={c.primary} size={22} accessible={false} />
      </View>
      <View style={styles.grow}>
        <Text style={[font.label, styles.text]}>{name}</Text>
        <Text style={[font.small, styles.muted]}>{examples}</Text>
      </View>
      {selected && <Check color={c.primary} size={26} strokeWidth={3} accessible={false} />}
    </View>
  );

  if (state?.status === 'error') {
    // Não agrupado: o botão precisa ser alcançável pelo leitor de tela. Sem seleção aqui (há um botão dentro).
    return (
      <View style={[styles.card, selected && styles.selected]}>
        {header}
        <Text style={[font.body, styles.error]}>{ui.activities.cardError}</Text>
        <AppButton label={ui.common.retry} a11yLabel={ui.activities.cardRetry(name)} onPress={onRetry} />
      </View>
    );
  }

  const suit = state?.status === 'ok' ? suitability[`${state.data.suitable}`] : undefined;
  const advice = state?.status === 'ok' && showAdvice ? recommendation[state.data.recommendation.code] : undefined;
  const spoken = !state
    ? `${name}, ${examples}.`
    : suit
      ? `${name}, ${examples}: ${suit.label}.${advice ? ` ${advice}` : ''}`
      : ui.activities.cardLoadingSpoken(name);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={selected && plan ? `${spoken} ${plan}` : spoken}
      accessibilityHint={ui.activities.cardHint}
      accessibilityState={{ selected }}
    >
      {header}
      {state &&
        (suit ? (
          <StatusBadge tone={suit.tone} label={suit.label} />
        ) : (
          <Text style={[font.body, styles.muted]}>{ui.activities.cardLoading}</Text>
        ))}
      {advice && <Text style={[font.body, styles.text]}>{advice}</Text>}
      {selected && plan && <Text style={[font.label, styles.text]}>{plan}</Text>}
    </Pressable>
  );
}

const useStyles = createThemedStyles((c) => ({
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    // Borda sempre com 2 de largura: ao selecionar, só a cor muda e nada pula de lugar.
    borderWidth: 2,
    borderColor: c.surface,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: minTouch,
    ...elevation.card,
  },
  selected: { borderColor: c.primary },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flexGrow: 1, flexShrink: 1, gap: spacing.xs },
  text: { color: c.text },
  muted: { color: c.textMuted },
  error: { color: c.danger },
}));
