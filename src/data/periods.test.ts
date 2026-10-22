import timelines from './mock/timelines.json';
import { bestInPeriod, itemsInPeriod } from './periods';

it('itemsInPeriod: a Noite tem 6 horas em duas datas (19/08 21–23 e 20/08 18–20)', () => {
  expect(itemsInPeriod(items, 'noite').map((i) => i.predictionFor)).toEqual([
    '2026-08-20T00:00:00Z', // 19/08 21:00
    '2026-08-20T01:00:00Z',
    '2026-08-20T02:00:00Z', // 19/08 23:00
    '2026-08-20T21:00:00Z', // 20/08 18:00
    '2026-08-20T22:00:00Z',
    '2026-08-20T23:00:00Z', // 20/08 20:00
  ]);
  expect(itemsInPeriod(items, 'madrugada')).toHaveLength(6);
  expect(itemsInPeriod(items, 'manha')).toHaveLength(6);
  expect(itemsInPeriod(items, 'tarde')).toHaveLength(6);
});

const items = timelines['900001'].items; // São Paulo, model-a (dados reais)

it('escolhe a hora de maior qualityScore de cada período (dados reais de SP)', () => {
  expect(bestInPeriod(items, 'madrugada')?.predictionFor).toBe('2026-08-20T03:00:00Z'); // 00:00, nota 92
  expect(bestInPeriod(items, 'manha')?.predictionFor).toBe('2026-08-20T09:00:00Z'); // 06:00, nota 85
  expect(bestInPeriod(items, 'tarde')?.predictionFor).toBe('2026-08-20T15:00:00Z'); // 12:00, nota 64
  expect(bestInPeriod(items, 'noite')?.predictionFor).toBe('2026-08-20T02:00:00Z'); // 19/08 23:00, nota 92
});

it('no empate fica com a hora mais cedo', () => {
  const tie = [
    { predictionFor: '2026-08-20T10:00:00Z', qualityScore: 80 }, // 07:00
    { predictionFor: '2026-08-20T09:00:00Z', qualityScore: 80 }, // 06:00
  ];
  expect(bestInPeriod(tie, 'manha')?.predictionFor).toBe('2026-08-20T09:00:00Z');
});

it('período sem horas na timeline devolve undefined', () => {
  expect(bestInPeriod([{ predictionFor: '2026-08-20T15:00:00Z', qualityScore: 50 }], 'manha')).toBeUndefined();
});
