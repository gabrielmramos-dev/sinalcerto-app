// Estado da fonte de dados (D27), num lugar só. As telas leem com useSourceStatus; o anúncio para o
// leitor de tela sai daqui, uma vez por mudança, mesmo com várias telas abertas.
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

import { ui } from '@/i18n/glossary';

/**
 * unknown: nenhuma resposta da API ainda (primeira consulta em andamento).
 * online: a API respondeu. offline: a API falhou e o app usa a reserva salva.
 * saved-only: a reserva foi forçada por EXPO_PUBLIC_DATA_SOURCE=mock.
 */
export type SourceMode = 'unknown' | 'online' | 'offline' | 'saved-only';

export interface SourceStatus {
  mode: SourceMode;
  /** A API já respondeu nesta sessão? Daí em diante, o tempo limite é curto. */
  connectedOnce: boolean;
  /** Verdadeiro depois de "Tentar de novo", até a próxima resposta (ou falha) da API. */
  retrying: boolean;
  /** Muda a cada "Tentar de novo": as telas recarregam quando ele muda. */
  version: number;
}

export function createSourceStatus(initial: SourceMode = 'unknown') {
  let state: SourceStatus = { mode: initial, connectedOnce: false, retrying: false, version: 0 };
  const listeners = new Set<() => void>();

  const set = (next: Partial<SourceStatus>) => {
    const before = state.mode;
    state = { ...state, ...next };
    // Anuncia só mudanças que importam: cair para a reserva, ou voltar dela. A primeira resposta boa não.
    if (state.mode !== before) {
      if (state.mode === 'offline') AccessibilityInfo.announceForAccessibility(ui.source.offline);
      if (state.mode === 'online' && before === 'offline') AccessibilityInfo.announceForAccessibility(ui.source.online);
    }
    listeners.forEach((l) => l());
  };

  return {
    get: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    markOnline: () => set({ mode: 'online', connectedOnce: true, retrying: false }),
    markOffline: () => set({ mode: 'offline', retrying: false }),
    /** "Tentar de novo": as próximas chamadas tentam a API outra vez, e as telas recarregam. */
    retry: () => set({ retrying: true, version: state.version + 1 }),
    /** Só para testes. */
    reset: (mode: SourceMode) => set({ mode, connectedOnce: false, retrying: false, version: 0 }),
  };
}

export type SourceStatusStore = ReturnType<typeof createSourceStatus>;

// ponytail: uma instância para o app inteiro; createSourceStatus existe para os testes.
export const sourceStatus = createSourceStatus(process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock' ? 'saved-only' : 'unknown');

export function useSourceStatus(): SourceStatus {
  return useSyncExternalStore(sourceStatus.subscribe, sourceStatus.get);
}
