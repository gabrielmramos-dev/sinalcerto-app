// D34: frases "Melhor" e "Evite" a partir das horas da previsão. Lógica pura, sem tela; os textos vêm do glossário.
import { formatWindows, windowsWhere, type HourWindow } from '@/data/forecastSummary';
import { ui } from '@/i18n/glossary';

export type Phrase =
  | { kind: 'all' } // "o dia todo"
  | { kind: 'none' } // "nenhum horário"
  | { kind: 'mostly' } // "quase o dia todo": Melhor, quando o Evite lista só a exceção
  | { kind: 'rest' } // "o resto do dia": Evite, quando o Melhor lista a janela boa
  | { kind: 'windows'; windows: HourWindow[] };

type Item = { predictionFor: string };

/**
 * Agrupa as horas boas e as ruins em faixas seguidas, na ordem dos dados: uma faixa nunca dá a volta
 * do fim para o começo da previsão. Só a minoria é listada; a outra linha resume: "quase o dia todo"
 * no Melhor (lido antes do Evite, então não pode depender dele) ou "o resto do dia" no Evite.
 * Empate: as duas são listadas.
 */
export function bestAndAvoid<T extends Item>(
  items: readonly T[],
  isGood: (item: T) => boolean,
): {
  best: Phrase;
  avoid: Phrase;
} {
  const good = items.filter(isGood).length;
  const bad = items.length - good;
  if (good === 0) return { best: { kind: 'none' }, avoid: bad ? { kind: 'all' } : { kind: 'none' } };
  if (bad === 0) return { best: { kind: 'all' }, avoid: { kind: 'none' } };
  const best: Phrase = { kind: 'windows', windows: windowsWhere(items, isGood) };
  const avoid: Phrase = { kind: 'windows', windows: windowsWhere(items, (i) => !isGood(i)) };
  if (bad < good) return { best: { kind: 'mostly' }, avoid };
  if (good < bad) return { best, avoid: { kind: 'rest' } };
  return { best, avoid };
}

/** Texto da frase ("das 23h às 7h", "o dia todo"...), com as palavras do glossário. */
export function phraseText(p: Phrase): string {
  if (p.kind === 'windows') return formatWindows(p.windows);
  return ui.hours[p.kind];
}
