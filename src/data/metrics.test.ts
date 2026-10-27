import { redesBands } from '@/i18n/glossary';
import { bandFor, formatDecimal } from './metrics';

const latency = (ms: number) => bandFor(ms, redesBands.latency).label;
const loss = (pct: number) => bandFor(pct, redesBands.packetLoss).label;
const jitter = (ms: number) => bandFor(ms, redesBands.jitter).label;

it('latência: excelente < 20, bom 20–50, médio até 100, ruim > 100 (D23)', () => {
  expect([19.9, 20, 50, 50.1, 100, 100.1].map(latency)).toEqual([
    'excelente',
    'bom',
    'bom',
    'médio',
    'médio',
    'ruim',
  ]);
});

it('perda: estável até 0,5%, risco até 2%, falha acima (D23)', () => {
  expect([0, 0.5, 0.6, 2, 2.1].map(loss)).toEqual(['estável', 'estável', 'risco', 'risco', 'falha']);
});

it('jitter: estável < 20, risco 20–50, falha > 50', () => {
  expect([19, 20, 50, 51].map(jitter)).toEqual(['estável', 'risco', 'risco', 'falha']);
});

it('dados reais de SP às 20:00: latência média e perda em falha, mesmo com categoria Regular da API', () => {
  // A faixa de Redes e a categoria da API podem divergir; o app mostra as duas e não reclassifica.
  expect(latency(73.2)).toBe('médio');
  expect(loss(3.9)).toBe('falha');
});

it('formatDecimal usa vírgula', () => {
  expect(formatDecimal(73.2)).toBe('73,2');
  expect(formatDecimal(5)).toBe('5');
});
