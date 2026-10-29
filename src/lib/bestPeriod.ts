// D34: "Melhor momento do dia" como faixa de horas seguidas, não uma hora só. Lógica pura, sem tela.
import type { Quality } from '@/api/types';
import { windowsWhere, type HourWindow } from '@/data/forecastSummary';

type Item = { predictionFor: string; quality: Quality };

export interface BestPeriod {
  window: HourWindow;
  quality: Quality;
  /** A janela cobre a previsão inteira (ex.: todas as horas Boas). */
  allDay: boolean;
}

/**
 * A sequência mais longa de horas Boas (empate: a mais cedo). Sem hora Boa, a mais longa de
 * Regulares; só horas Instáveis, `undefined`. A janela termina no fim da última hora (D30).
 */
export function bestPeriod(items: readonly Item[]): BestPeriod | undefined {
  for (const quality of ['GOOD', 'MODERATE'] as const) {
    const windows = windowsWhere(items, (i) => i.quality === quality);
    let best: HourWindow | undefined;
    for (const w of windows) if (!best || hours(w) > hours(best)) best = w;
    if (best) return { window: best, quality, allDay: hours(best) === items.length };
  }
  return undefined;
}

const hours = (w: HourWindow) => (Date.parse(w.end) - Date.parse(w.start)) / 3_600_000;
