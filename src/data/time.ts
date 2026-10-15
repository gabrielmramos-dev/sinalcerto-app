// ponytail: deslocamento fixo de -3h. O Brasil não tem horário de verão desde 2019, e isso não
// depende do suporte a fuso horário do Intl no Hermes. Se o horário de verão voltar, trocar por Intl.
const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-08-20T23:00:00Z" -> "20/08/2026, 20:00" (horário de Brasília). */
export function formatBrasilia(isoUtc: string): string {
  const d = new Date(new Date(isoUtc).getTime() + BRASILIA_OFFSET_MS);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
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
