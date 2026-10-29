// Resumos da timeline para o Início e o relógio (D29). Tudo vem dos itens da previsão; nada inventado.
import type { Quality } from '@/api/types';
import { brasiliaHour } from './time';

const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

type Item = { predictionFor: string };

/** Período coberto, para o título: "20 de agosto", "19 e 20 de agosto" ou "31 de agosto a 1 de setembro". */
export function dayRange(items: readonly Item[]): string {
  const days: { d: number; m: number }[] = [];
  for (const { predictionFor } of items) {
    const t = new Date(Date.parse(predictionFor) + BRASILIA_OFFSET_MS);
    const day = { d: t.getUTCDate(), m: t.getUTCMonth() };
    const last = days[days.length - 1];
    if (!last || last.d !== day.d || last.m !== day.m) days.push(day);
  }
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  if (days.length === 1) return `${first.d} de ${MONTHS[first.m]}`;
  if (first.m === last.m) {
    const nums = days.map((x) => x.d);
    return `${nums.slice(0, -1).join(', ')} e ${last.d} de ${MONTHS[last.m]}`;
  }
  return `${first.d} de ${MONTHS[first.m]} a ${last.d} de ${MONTHS[last.m]}`;
}

/** Hora de maior qualityScore (valor da API) em toda a previsão. Empate: a mais cedo. */
export function bestOverall<T extends Item & { qualityScore: number }>(items: readonly T[]): T | undefined {
  let best: T | undefined;
  for (const item of items) if (!best || item.qualityScore > best.qualityScore) best = item;
  return best;
}

export interface HourWindow {
  /** Início da primeira hora da janela (ISO UTC). */
  start: string;
  /** Fim da última hora (início dela + 1 h). "das 15h às 18h" cobre as horas de 15, 16 e 17. */
  end: string;
}

/** Sequências de horas seguidas que cumprem a condição (usado em "Evite" e no planejador da E3). */
export function windowsWhere<T extends Item>(items: readonly T[], test: (item: T) => boolean): HourWindow[] {
  const windows: HourWindow[] = [];
  let open: HourWindow | undefined;
  for (const item of items) {
    const t = Date.parse(item.predictionFor);
    if (test(item)) {
      const end = new Date(t + HOUR_MS).toISOString().replace('.000Z', 'Z');
      if (open && Date.parse(open.end) === t) open.end = end;
      else {
        open = { start: item.predictionFor, end };
        windows.push(open);
      }
    } else {
      open = undefined;
    }
  }
  return windows;
}

/** "das 15h às 18h", "das 15h às 18h e das 21h às 23h". */
export function formatWindows(windows: readonly HourWindow[]): string {
  return windows.map((w) => `das ${brasiliaHour(w.start)}h às ${brasiliaHour(w.end)}h`).join(' e ');
}

export function countByQuality(items: readonly { quality: Quality }[]): Record<Quality, number> {
  const count: Record<Quality, number> = { GOOD: 0, MODERATE: 0, UNSTABLE: 0 };
  for (const { quality } of items) count[quality]++;
  return count;
}
