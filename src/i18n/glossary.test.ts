import { ACTIVITIES, QUALITIES, RECOMMENDATION_CODES } from '@/api/types';
import { activity, quality, recommendation } from './glossary';

// Se a API ganhar um valor novo de enum, estes testes lembram de traduzir.
describe('glossário cobre todos os enums da API', () => {
  it.each(QUALITIES)('quality %s', (q) => expect(quality[q].label).toBeTruthy());
  it.each(RECOMMENDATION_CODES)('recommendation %s', (c) => expect(recommendation[c]).toBeTruthy());
  it.each(ACTIVITIES)('activity %s', (a) => expect(activity[a].name).toBeTruthy());
});

it('mapeia as categorias como decidido em D9', () => {
  expect(QUALITIES.map((q) => quality[q].label)).toEqual(['Boa', 'Regular', 'Instável']);
  expect(QUALITIES.map((q) => quality[q].redes)).toEqual(['OK', 'Risco', 'Falha']);
});
