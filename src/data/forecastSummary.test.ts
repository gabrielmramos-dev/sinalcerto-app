import { bestOverall, countByQuality, dayRange, formatWindows, windowsWhere } from './forecastSummary';
import timelines from './mock/timelines.json';

const items = timelines['900001'].items as { predictionFor: string; quality: 'GOOD' | 'MODERATE' | 'UNSTABLE'; qualityScore: number }[];

it('período do título vem dos dados: 19 e 20 de agosto (Brasília)', () => {
  expect(dayRange(items)).toBe('19 e 20 de agosto');
  expect(dayRange(items.slice(3))).toBe('20 de agosto');
  expect(dayRange([{ predictionFor: '2026-09-01T02:00:00Z' }, { predictionFor: '2026-09-01T04:00:00Z' }])).toBe(
    '31 de agosto a 1 de setembro',
  );
});

it('melhor momento: maior nota, empate fica com a mais cedo (dados reais de SP: 19/08 23:00, nota 92)', () => {
  expect(bestOverall(items)?.predictionFor).toBe('2026-08-20T02:00:00Z');
});

it('janelas de horas instáveis seguidas: 15h, 16h e 17h viram "das 15h às 18h"', () => {
  const w = windowsWhere(items, (i) => i.quality === 'UNSTABLE');
  expect(w).toEqual([{ start: '2026-08-20T18:00:00Z', end: '2026-08-20T21:00:00Z' }]);
  expect(formatWindows(w)).toBe('das 15h às 18h');
});

it('janelas separadas são juntadas com "e"; a meia-noite atravessa o dia', () => {
  const pick = new Set(['2026-08-20T02:00:00Z', '2026-08-20T03:00:00Z', '2026-08-20T10:00:00Z']);
  const w = windowsWhere(items, (i) => pick.has(i.predictionFor));
  expect(formatWindows(w)).toBe('das 23h às 1h e das 7h às 8h');
});

it('sem horas que cumprem a condição, nenhuma janela', () => {
  expect(windowsWhere(items, () => false)).toEqual([]);
});

it('contagem por categoria (SP): 8 boas, 13 regulares, 3 instáveis', () => {
  expect(countByQuality(items)).toEqual({ GOOD: 8, MODERATE: 13, UNSTABLE: 3 });
});
