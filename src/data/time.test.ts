import { formatBrasilia, formatBrasiliaLong, isPast, nearestItem } from './time';

it('formatBrasiliaLong escreve o mês por extenso', () => {
  expect(formatBrasiliaLong('2026-08-20T23:00:00Z')).toBe('20 de agosto de 2026, 20:00');
  expect(formatBrasiliaLong('2026-01-01T02:00:00Z')).toBe('31 de dezembro de 2025, 23:00');
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
