// ponytail: deslocamento fixo de -3h. O Brasil não tem horário de verão desde 2019, e isso não
// depende do suporte a fuso horário do Intl no Hermes. Se o horário de verão voltar, trocar por Intl.
const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-08-20T23:00:00Z" -> "20/08/2026, 20:00" (horário de Brasília). */
export function formatBrasilia(isoUtc: string): string {
  const d = new Date(new Date(isoUtc).getTime() + BRASILIA_OFFSET_MS);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/**
 * "2026-08-20T23:00:00Z" -> "20 de agosto de 2026, 20:00" (ou "20 de agosto, 20:00" sem o ano).
 * Mais fácil de ler, e o leitor de tela fala direito.
 */
export function formatBrasiliaLong(isoUtc: string, withYear = true): string {
  const d = new Date(new Date(isoUtc).getTime() + BRASILIA_OFFSET_MS);
  const year = withYear ? ` de ${d.getUTCFullYear()}` : '';
  return `${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}${year}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** "2026-08-20T02:00:00Z" -> "19 de agosto" (dia em Brasília). */
export function brasiliaDay(isoUtc: string): string {
  const d = new Date(new Date(isoUtc).getTime() + BRASILIA_OFFSET_MS);
  return `${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

/** "2026-08-20T02:00:00Z" -> "23:00" (relógio de Brasília). */
export function brasiliaClock(isoUtc: string): string {
  const d = new Date(new Date(isoUtc).getTime() + BRASILIA_OFFSET_MS);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Agrupa itens seguidos pelo dia em Brasília, na ordem recebida (um cabeçalho a cada mudança de dia). */
export function groupByDay<T extends { predictionFor: string }>(items: readonly T[]): { day: string; items: T[] }[] {
  const groups: { day: string; items: T[] }[] = [];
  for (const item of items) {
    const day = brasiliaDay(item.predictionFor);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}

/** Hora (0–23) no relógio de Brasília. */
export function brasiliaHour(isoUtc: string): number {
  return new Date(new Date(isoUtc).getTime() + BRASILIA_OFFSET_MS).getUTCHours();
}

/**
 * D6 + D18: hora escolhida no seletor (relógio de Brasília) -> item da timeline com essa hora.
 * Arredonda para a hora cheia mais próxima (15:20 -> 15:00; 15:30 -> 16:00).
 * ponytail: funciona porque a timeline cobre 24 horas seguidas (cada hora do relógio aparece uma vez).
 * Se a API trouxer vários dias, o seletor precisa escolher a data também.
 */
export function itemAtClock<T extends { predictionFor: string }>(
  items: readonly T[],
  hours: number,
  minutes: number,
): T | undefined {
  const hour = (hours + (minutes >= 30 ? 1 : 0)) % 24;
  return items.find((item) => brasiliaHour(item.predictionFor) === hour);
}

/** A previsão terminou há mais de 1 hora? (os dados atuais são todos de agosto de 2026) */
export function isPast(isoUtc: string, now: Date = new Date()): boolean {
  return new Date(isoUtc).getTime() + 60 * 60 * 1000 < now.getTime();
}

/**
 * D6: o app só consulta horários que existem na timeline.
 * Devolve o item mais próximo do horário pedido (empate: o mais cedo), ou undefined se a lista estiver vazia.
 */
export function nearestItem<T extends { predictionFor: string }>(items: readonly T[], target: Date): T | undefined {
  let best: T | undefined;
  let bestDiff = Infinity;
  for (const item of items) {
    const diff = Math.abs(new Date(item.predictionFor).getTime() - target.getTime());
    if (diff < bestDiff) [best, bestDiff] = [item, diff];
  }
  return best;
}
