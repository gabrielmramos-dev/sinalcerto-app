import { Tabs } from 'expo-router';

import { ui } from '@/i18n/glossary';

// ponytail: abas só com texto; ícone seria decorativo e o rótulo já é o nome acessível.
const noIcon = { tabBarIcon: () => null, tabBarIconStyle: { display: 'none' as const } };

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: ui.tabs.home, ...noIcon }} />
      <Tabs.Screen name="atividades" options={{ title: ui.tabs.activities, ...noIcon }} />
      <Tabs.Screen name="detalhes" options={{ title: ui.tabs.details, ...noIcon }} />
    </Tabs>
  );
}
