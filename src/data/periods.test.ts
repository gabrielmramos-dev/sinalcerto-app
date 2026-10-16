import timelines from './mock/timelines.json';
import { bestInPeriod } from './periods';

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
