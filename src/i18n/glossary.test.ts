import { ACTIVITIES, QUALITIES, RECOMMENDATION_CODES } from '@/api/types';
import { about, activity, lossMeaning, quality, recommendation, redesBands } from './glossary';

// Se a API ganhar um valor novo de enum, estes testes lembram de traduzir.
describe('glossário cobre todos os enums da API', () => {
  it.each(QUALITIES)('quality %s', (q) => expect(quality[q].label).toBeTruthy());
  it.each(RECOMMENDATION_CODES)('recommendation %s', (c) => expect(recommendation[c]).toBeTruthy());
  it.each(ACTIVITIES)('activity %s', (a) => expect(activity[a].name).toBeTruthy());
});

it('perda em pedaços de informação: "menos de 1", singular e plural (D26)', () => {
  expect(lossMeaning(0.4)).toBe('Menos de 1 em cada 100 pedaços de informação se perde.');
  expect(lossMeaning(1.2)).toBe('Cerca de 1 em cada 100 pedaços de informação se perde.');
  expect(lossMeaning(3.9)).toBe('Cerca de 4 em cada 100 pedaços de informação se perdem.');
});

it('toda faixa de latência e de perda tem frase de consequência (D26)', () => {
  for (const b of [...redesBands.latency, ...redesBands.packetLoss]) expect(b.effect).toBeTruthy();
});

it('algoritmo traduzido com o original entre parênteses; sem tradução, fica o original', () => {
  expect(about.algorithmName('Linear Regression')).toBe('Regressão Linear (Linear Regression)');
  expect(about.algorithmName('Gradient Boosting')).toBe('Gradient Boosting');
});

it('mapeia as categorias como decidido em D9', () => {
  expect(QUALITIES.map((q) => quality[q].label)).toEqual(['Boa', 'Regular', 'Instável']);
  expect(QUALITIES.map((q) => quality[q].redes)).toEqual(['OK', 'Risco', 'Falha']);
});
