import { createContext, useContext, useState, type ReactNode } from 'react';

// D7: começa na primeira probe de /locations (Região de São Paulo).
// ponytail: não lembra o local entre aberturas do app; isso é o extra EX03.
const DEFAULT_PROBE_ID = 900001;

interface AppState {
  probeId: number;
  setProbeId: (id: number) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [probeId, setProbeId] = useState(DEFAULT_PROBE_ID);
  return <Ctx.Provider value={{ probeId, setProbeId }}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState fora do AppStateProvider');
  return value;
}
