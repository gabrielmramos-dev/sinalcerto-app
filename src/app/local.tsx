import { useRouter } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import { useEffect, useRef, type ComponentRef } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ScreenState } from '@/components/ScreenState';
import { forecastSource } from '@/data';
import { regionName } from '@/data/regions';
import { useLoad } from '@/hooks/useLoad';
import { errorMessage, ui } from '@/i18n/glossary';
import { useAppState } from '@/state/AppState';
import { createThemedStyles, elevation, font, minTouch, radius, spacing, useColors } from '@/theme';

const t = ui.location;
const loadLocations = () => forecastSource.getLocations();

/** D36: modal "Escolher local" no padrão do wireframe v2: título próprio, "Fechar" visível e lista de regiões. */
export default function ChooseLocationScreen() {
  const styles = useStyles();
  const c = useColors();
  const router = useRouter();
  const { probeId, setProbeId } = useAppState();
  const locations = useLoad(loadLocations);

  // Ao abrir, o foco do leitor de tela vai para "Fechar" (a saída fica clara logo de início). A espera
  // deixa a animação do modal terminar antes de mover o foco.
  const closeRef = useRef<ComponentRef<typeof View>>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (closeRef.current) AccessibilityInfo.sendAccessibilityEvent(closeRef.current, 'focus');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[font.title, styles.text, styles.grow]} accessibilityRole="header">
          {t.title}
        </Text>
        <AppButton ref={closeRef} label={t.close} hint={t.closeHint} onPress={() => router.back()} />
      </View>
      {/* D36: sem o aviso de conexão aqui; ele fica só nas abas. */}
      <Text style={[font.small, styles.muted]}>{t.intro}</Text>

      {locations.status === 'loading' && <ScreenState kind="loading" message={t.loading} />}
      {locations.status === 'error' && (
        <ScreenState kind="error" message={errorMessage(locations.error, t.loadError)} onRetry={locations.retry} />
      )}
      {locations.status === 'ok' && locations.data.length === 0 && <ScreenState kind="empty" message={t.empty} />}
      {locations.status === 'ok' && locations.data.length > 0 && (
        // Lista com divisórias finas, como em Detalhes. Sombra por fora; recorte dos cantos por dentro.
        <View style={styles.card}>
          <View style={styles.clip}>
            {locations.data.map((l, i) => {
              const selected = l.probeId === probeId;
              const name = regionName(l.probeId);
              return (
                // A divisória fica por fora, sempre sobre a superfície; o fundo da seleção, por dentro.
                <View key={l.probeId} style={i > 0 && styles.divider}>
                  <Pressable
                    onPress={() => {
                      setProbeId(l.probeId);
                      router.back();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={name}
                    accessibilityHint={t.pickHint}
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
                  >
                    <Text style={[font.body, styles.text, styles.grow]}>{name}</Text>
                    {/* ✓ + fundo suave: a região escolhida não depende só da cor (RNF03). */}
                    {selected && <Check color={c.primary} size={22} strokeWidth={3} accessible={false} />}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const useStyles = createThemedStyles((c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  content: { padding: spacing.md, gap: spacing.md },
  // O título quebra linha com texto grande; "Fechar" fica à direita ou desce, sem cortar (RNF05).
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  grow: { flexGrow: 1, flexShrink: 1 },
  card: { backgroundColor: c.surface, borderRadius: radius.lg, ...elevation.card },
  clip: { borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    minHeight: minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.border },
  selected: { backgroundColor: c.primarySoft },
  pressed: { opacity: 0.7 },
  text: { color: c.text },
  muted: { color: c.textMuted },
}));
