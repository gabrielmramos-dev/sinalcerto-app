import { brasiliaHour } from './time';

// D17: cortes de relógio (horário de Brasília), não regra de qualidade.
export const PERIODS = [
  { id: 'madrugada', from: 0, to: 5 },
  { id: 'manha', from: 6, to: 11 },
  { id: 'tarde', from: 12, to: 17 },
  { id: 'noite', from: 18, to: 23 },
] as const;

export type PeriodId = (typeof PERIODS)[number]['id'];

/** Itens da timeline cuja hora (em Brasília) cai no período, na ordem recebida. */
export function itemsInPeriod<T extends { predictionFor: string }>(items: readonly T[], periodId: PeriodId): T[] {
  const period = PERIODS.find((p) => p.id === periodId)!;
  return items.filter((item) => {
    const hour = brasiliaHour(item.predictionFor);
    return hour >= period.from && hour <= period.to;
  });
}

/**
 * Hora do período com o maior qualityScore (valor calculado pela API). Empate: a mais cedo.
 * Não classifica nada: só acha o maior número.
 */
export function bestInPeriod<T extends { predictionFor: string; qualityScore: number }>(
  items: readonly T[],
  periodId: PeriodId,
): T | undefined {
  let best: T | undefined;
  for (const item of itemsInPeriod(items, periodId)) {
    const better =
      !best ||
      item.qualityScore > best.qualityScore ||
      (item.qualityScore === best.qualityScore && item.predictionFor < best.predictionFor);
    if (better) best = item;
  }
  return best;
}
