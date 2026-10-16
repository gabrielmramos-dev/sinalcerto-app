import timelines from './mock/timelines.json';
import { formatBrasilia, formatBrasiliaLong, isPast, itemAtClock, nearestItem } from './time';

it('formatBrasiliaLong escreve o mês por extenso', () => {
  expect(formatBrasiliaLong('2026-08-20T23:00:00Z')).toBe('20 de agosto de 2026, 20:00');
  expect(formatBrasiliaLong('2026-01-01T02:00:00Z')).toBe('31 de dezembro de 2025, 23:00');
  expect(formatBrasiliaLong('2026-08-20T02:00:00Z', false)).toBe('19 de agosto, 23:00');
});

describe('itemAtClock (D6, D18)', () => {
  const items = timelines['900001'].items;
  it('arredonda para a hora cheia e devolve um item que existe na timeline', () => {
    expect(itemAtClock(items, 15, 20)?.predictionFor).toBe('2026-08-20T18:00:00Z'); // 15:00 em Brasília
    expect(itemAtClock(items, 15, 30)?.predictionFor).toBe('2026-08-20T19:00:00Z'); // 16:00
  });
  it('23:00 em Brasília é do dia 19 (os dados começam 19/08 21:00)', () => {
    expect(itemAtClock(items, 23, 0)?.predictionFor).toBe('2026-08-20T02:00:00Z');
  });
  it('23:40 vira 00:00 do dia 20', () => {
    expect(itemAtClock(items, 23, 40)?.predictionFor).toBe('2026-08-20T03:00:00Z');
  });
  it('toda hora do relógio acha um item', () => {
    for (let h = 0; h < 24; h++) expect(itemAtClock(items, h, 0)).toBeDefined();
  });
});

describe('isPast', () => {
  const now = new Date('2026-08-20T15:30:00Z');
  it('a hora atual ainda vale', () => expect(isPast('2026-08-20T15:00:00Z', now)).toBe(false));
  it('mais de 1 hora atrás já passou', () => expect(isPast('2026-08-20T14:00:00Z', now)).toBe(true));
});

describe('formatBrasilia', () => {
  it('converte UTC para Brasília (-3h)', () => {
    expect(formatBrasilia('2026-08-20T23:00:00Z')).toBe('20/08/2026, 20:00');
  });
  it('volta um dia quando passa da meia-noite UTC', () => {
    expect(formatBrasilia('2026-08-20T00:00:00Z')).toBe('19/08/2026, 21:00');
  });
});

describe('nearestItem (D6)', () => {
  const items = ['2026-08-20T14:00:00Z', '2026-08-20T15:00:00Z', '2026-08-20T16:00:00Z'].map((predictionFor) => ({
    predictionFor,
  }));

  it('acha a hora mais próxima', () => {
    expect(nearestItem(items, new Date('2026-08-20T15:20:00Z'))?.predictionFor).toBe('2026-08-20T15:00:00Z');
  });
  it('no empate fica com a mais cedo', () => {
    expect(nearestItem(items, new Date('2026-08-20T15:30:00Z'))?.predictionFor).toBe('2026-08-20T15:00:00Z');
  });
  it('fora da faixa devolve a ponta (como a API faz)', () => {
    expect(nearestItem(items, new Date('2026-10-15T12:00:00Z'))?.predictionFor).toBe('2026-08-20T16:00:00Z');
  });
  it('lista vazia devolve undefined', () => {
    expect(nearestItem([], new Date())).toBeUndefined();
  });
});
