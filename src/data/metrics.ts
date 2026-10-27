import type { Band } from '@/i18n/glossary';

/**
 * D23: em que faixa de Redes o valor cai. Só contexto educativo: não muda a categoria da API.
 * As faixas vêm em ordem crescente; a primeira que couber vale.
 */
export function bandFor(value: number, bands: readonly Band[]): Band {
  return bands.find((b) => (b.strict ? value < b.max : value <= b.max)) ?? bands[bands.length - 1]!;
}

/** 73.2 -> "73,2" (vírgula decimal, como se escreve no Brasil). */
export function formatDecimal(n: number): string {
  return String(n).replace('.', ',');
}
