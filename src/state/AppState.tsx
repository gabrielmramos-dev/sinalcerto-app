import { createContext, useContext, useState, type ReactNode } from 'react';

// D7: começa na primeira probe de /locations (Região de São Paulo).
// ponytail: não lembra o local entre aberturas do app; isso é o extra EX03.
const DEFAULT_PROBE_ID = 900001;

interface AppState {
  probeId: number;
  setProbeId: (id: number) => void;
  /** D6: sempre um predictionFor que existe na timeline, ou null antes da escolha. */
  selectedTime: string | null;
  setSelectedTime: (predictionFor: string | null) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [probeId, setProbeId] = useState(DEFAULT_PROBE_ID);
  // Todas as probes têm as mesmas 24 horas, então o horário continua valendo ao trocar de local.
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  return (
    <Ctx.Provider value={{ probeId, setProbeId, selectedTime, setSelectedTime }}>{children}</Ctx.Provider>
  );
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState fora do AppStateProvider');
  return value;
}
