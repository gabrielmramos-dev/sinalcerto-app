import type { Quality, Timeline } from '@/api/types';
import { formatWindows } from '@/data/forecastSummary';
import timelines from '@/data/mock/timelines.json';
import { bestPeriod } from './bestPeriod';

const sp = (timelines as Record<string, Timeline>)['900001']!.items;
const fake = (qs: Quality[]) =>
  qs.map((quality, h) => ({ predictionFor: `2026-08-20T${String(h).padStart(2, '0')}:00:00Z`, quality }));

it('SP: as 8 horas Boas seguidas viram "das 23h às 7h" (fim = fim da última hora, como no "Evite")', () => {
  const best = bestPeriod(sp)!;
  expect(best.quality).toBe('GOOD');
  expect(formatWindows([best.window])).toBe('das 23h às 7h');
  expect(best.allDay).toBe(false);
});

it('duas janelas Boas: a mais longa; empate: a mais cedo', () => {
  expect(bestPeriod(fake(['GOOD', 'MODERATE', 'GOOD', 'GOOD', 'MODERATE']))!.window.start).toBe('2026-08-20T02:00:00Z');
  expect(bestPeriod(fake(['GOOD', 'GOOD', 'MODERATE', 'GOOD', 'GOOD']))!.window.start).toBe('2026-08-20T00:00:00Z');
});

it('sem hora Boa: a janela Regular mais longa; só Instável: nada', () => {
  expect(bestPeriod(fake(['UNSTABLE', 'MODERATE', 'MODERATE', 'UNSTABLE']))).toMatchObject({ quality: 'MODERATE' });
  expect(bestPeriod(fake(['UNSTABLE', 'UNSTABLE']))).toBeUndefined();
});

it('todas Boas: marca o dia todo (evita "das 0h às 0h")', () => {
  expect(bestPeriod(fake(['GOOD', 'GOOD', 'GOOD']))).toMatchObject({ allDay: true });
});
