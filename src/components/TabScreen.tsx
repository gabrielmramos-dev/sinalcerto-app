import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createThemedStyles, spacing } from '@/theme';

/**
 * Aba sem cabeçalho nativo (D29, D31): o conteúdo começa abaixo do recorte da câmera, e uma faixa na
 * cor do fundo cobre a área segura do topo, para nada rolar por baixo da barra de status (D30).
 */
export function TabScreen({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}>
        {children}
      </ScrollView>
      <View style={[styles.statusStrip, { height: insets.top }]} />
    </View>
  );
}

const useStyles = createThemedStyles((c) => ({
  screen: { flex: 1, backgroundColor: c.background },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
  statusStrip: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: c.background },
}));
