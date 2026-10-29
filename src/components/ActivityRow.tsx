import Check from 'lucide-react-native/icons/check';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import Globe from 'lucide-react-native/icons/globe';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import Phone from 'lucide-react-native/icons/phone';
import Tv from 'lucide-react-native/icons/tv';
import Upload from 'lucide-react-native/icons/upload';
import Video from 'lucide-react-native/icons/video';
import X from 'lucide-react-native/icons/x';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { Activity, ActivityCheck } from '@/api/types';
import type { CardState, PlannerState } from '@/hooks/useActivityChecks';
import { activity as activityText, ui, type Tone } from '@/i18n/glossary';
import { createThemedStyles, font, minTouch, radius, spacing, useColors } from '@/theme';
import { AppButton } from './AppButton';
import { BestAvoid } from './BestAvoid';

const ICONS = {
  VIDEO_CALL: Video,
  AUDIO_CALL: Phone,
  STREAMING: Tv,
  FILE_UPLOAD: Upload,
  WEB_BROWSING: Globe,
  MESSAGING: MessageCircle,
} as const;

export type Status = 'works' | 'mayFail' | 'wontWork';
const STATUS: Record<Status, { tone: Tone; Icon: typeof Check }> = {
  works: { tone: 'good', Icon: Check },
  mayFail: { tone: 'moderate', Icon: CircleAlert },
  wontWork: { tone: 'unstable', Icon: X },
};

/**
 * D34: três estados, só com campos da API. `suitable` → "Funciona"; não adequada numa hora Instável
 * (`forecast.quality`) → "Não deve funcionar"; nos outros casos → "Pode falhar".
 */
export function statusOf(check: ActivityCheck): Status {
  if (check.suitable) return 'works';
  return check.forecast.quality === 'UNSTABLE' ? 'wontWork' : 'mayFail';
}

interface Props {
  activity: Activity;
  /** Resultado na hora selecionada do app. */
  state: CardState;
  /** "20:00", para o nome falado ("Chamada de vídeo, às 20:00: pode falhar"). */
  clock: string;
  expanded: boolean;
  onPress: () => void;
  onRetry: () => void;
  /** Linha aberta: as 24 horas desta atividade (planejador, D31) já transformadas em Melhor/Evite. */
  plan?: { state: PlannerState; best?: string; avoid?: string; onRetry: () => void };
}

/** D34: uma linha por atividade (alvo ≥ 48). Tocar abre "Melhor/Evite"; uma aberta por vez (quem controla é a tela). */
export function ActivityRow({ activity, state, clock, expanded, onPress, onRetry, plan }: Props) {
  const styles = useStyles();
  const c = useColors();
  const t = ui.activities;
  const { name } = activityText[activity];
  const Icon = ICONS[activity];
  const status = state.status === 'ok' ? statusOf(state.data) : undefined;
  const spokenStatus = status
    ? t.status[status].toLowerCase()
    : state.status === 'error'
      ? t.statusError
      : t.statusLoading;

  return (
    <View style={[styles.row, expanded && styles.open]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t.rowLabel(name, clock, spokenStatus)}
        accessibilityHint={t.rowHint}
        accessibilityState={{ expanded }}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <Icon color={c.primary} size={22} accessible={false} />
        <Text style={[font.label, styles.text, styles.grow]}>{name}</Text>
        {status && <StatusTag status={status} />}
        {state.status === 'loading' && <ActivityIndicator color={c.primary} accessible={false} />}
        {state.status === 'error' && <Text style={[font.small, styles.error]}>{t.statusError}</Text>}
      </Pressable>
      {/* Fora do botão da linha: precisa ser alcançável pelo leitor de tela. */}
      {state.status === 'error' && (
        <AppButton label={ui.common.retry} a11yLabel={t.cardRetry(name)} onPress={onRetry} />
      )}
      {expanded && plan && (
        <View style={styles.panel}>
          {plan.state.status === 'ok' && plan.best && plan.avoid && <BestAvoid best={plan.best} avoid={plan.avoid} />}
          {plan.state.status === 'loading' && (
            // Sem texto com reticências (D34): o indicador tem nome para o leitor de tela. Não é controle.
            // eslint-disable-next-line react-native-a11y/has-accessibility-hint
            <ActivityIndicator color={c.primary} accessible accessibilityLabel={t.planLoading} />
          )}
          {plan.state.status === 'error' && (
            <>
              <Text style={[font.body, styles.error]}>{t.planError(name)}</Text>
              <AppButton label={ui.common.retry} a11yLabel={t.planRetry(name)} onPress={plan.onRetry} />
            </>
          )}
        </View>
      )}
    </View>
  );
}

/** Ícone + texto na cor da categoria: o texto carrega o sentido, a cor e a forma reforçam (RNF03). */
function StatusTag({ status }: { status: Status }) {
  const c = useColors();
  const { tone, Icon } = STATUS[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <Icon color={c[tone]} size={18} strokeWidth={2.5} accessible={false} />
      <Text style={[font.small, { color: c[tone] }]}>{ui.activities.status[status]}</Text>
    </View>
  );
}

const useStyles = createThemedStyles((c) => ({
  // Borda sempre com 2 de largura: ao abrir, só a cor muda e nada pula de lugar.
  row: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 2, borderColor: c.surface },
  open: { borderColor: c.primary },
  head: {
    minHeight: minTouch,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  grow: { flexGrow: 1, flexShrink: 1 },
  panel: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  text: { color: c.text },
  error: { color: c.danger },
}));
