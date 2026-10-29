import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { about, ui } from '@/i18n/glossary';
import { AppStateProvider } from '@/state/AppState';
import { fonts, useColors } from '@/theme';

// D28: a tela de abertura fica até as fontes carregarem (sem a troca visível de fonte).
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const c = useColors();
  const [loaded, error] = useFonts({
    DMSerifDisplay_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  // Se as fontes falharem, o app abre com a fonte do sistema em vez de ficar preso na abertura.
  if (!loaded && !error) return null;

  return (
    <AppStateProvider>
      {/* auto: texto claro no modo escuro e escuro no claro (tema do sistema, D28). */}
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.primary,
          // iOS 26+ usa a fonte do sistema no cabeçalho, a não ser que a família seja dada aqui (SDK 58).
          headerTitleStyle: { fontFamily: fonts.serif, color: c.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.background },
        }}
      >
        {/* D36: título de verdade, para o nome da rota "(tabs)" nunca aparecer (ex.: no voltar do iOS). */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: ui.common.appName }} />
        {/* D36: o modal tem título e "Fechar" próprios, no conteúdo. */}
        <Stack.Screen name="local" options={{ presentation: 'modal', title: ui.location.title, headerShown: false }} />
        {/* D36: o voltar nativo continua (navegação aprendida); o título vai para o conteúdo, em serifa. */}
        <Stack.Screen name="sobre" options={{ title: about.title, headerTitle: '', headerBackTitle: ui.common.back }} />
      </Stack>
    </AppStateProvider>
  );
}
