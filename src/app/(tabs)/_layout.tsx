import { Tabs } from 'expo-router';

// ponytail: abas só com texto; ícone seria decorativo e o rótulo já é o nome acessível.
const noIcon = { tabBarIcon: () => null, tabBarIconStyle: { display: 'none' as const } };

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Início', ...noIcon }} />
      <Tabs.Screen name="atividades" options={{ title: 'Atividades', ...noIcon }} />
      <Tabs.Screen name="detalhes" options={{ title: 'Detalhes', ...noIcon }} />
    </Tabs>
  );
}
