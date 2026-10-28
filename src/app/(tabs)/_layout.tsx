import { Tabs } from 'expo-router';
// Um arquivo por ícone (D28): o Metro não descarta código não usado, e o índice traria ~1.900 ícones.
import ChartNoAxesColumn from 'lucide-react-native/icons/chart-no-axes-column';
import Clock from 'lucide-react-native/icons/clock';
import House from 'lucide-react-native/icons/house';

import { ui } from '@/i18n/glossary';
import { fonts, useColors } from '@/theme';

// D28: ícones Lucide (uma família só) com o texto embaixo. O texto continua sendo o nome acessível;
// o ícone é decorativo para o leitor de tela.
export default function TabLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarLabelStyle: { fontFamily: fonts.semibold },
        headerStyle: { backgroundColor: c.background },
        headerTitleStyle: { fontFamily: fonts.serif, color: c.text },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: ui.tabs.home,
          // D29: sem cabeçalho nativo; o título em serifa fica no conteúdo, marcado como cabeçalho.
          headerShown: false,
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="atividades"
        options={{
          title: ui.tabs.activities,
          headerShown: false, // D31: título em serifa no conteúdo, como no Início
          tabBarIcon: ({ color, size }) => <ChartNoAxesColumn color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="detalhes"
        options={{ title: ui.tabs.details, tabBarIcon: ({ color, size }) => <Clock color={color} size={size} /> }}
      />
    </Tabs>
  );
}
