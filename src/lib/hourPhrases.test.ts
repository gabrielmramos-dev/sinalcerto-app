import type { Timeline } from '@/api/types';
import activities from '@/data/mock/activities.json';
import timelines from '@/data/mock/timelines.json';
import { bestAndAvoid, phraseText } from './hourPhrases';

const sp = (timelines as Record<string, Timeline>)['900001']!.items;
const saved = activities.byProbe['900001'] as unknown as Record<string, Record<string, [boolean, string, string]>>;
const suitable = (activity: string) => (i: { predictionFor: string }) => saved[i.predictionFor]![activity]![0];
const text = (r: ReturnType<typeof bestAndAvoid>) => ({ best: phraseText(r.best), avoid: phraseText(r.avoid) });

// Horas falsas a partir de 21h de Brasília (00Z), como nos dados reais.
const fake = (good: boolean[]) =>
  good.map((g, h) => ({ predictionFor: `2026-08-20T${String(h).padStart(2, '0')}:00:00Z`, good: g }));

it('chamada de vídeo em SP (8 boas de 24): lista as boas e o resto vira "o resto do dia"', () => {
  expect(text(bestAndAvoid(sp, suitable('VIDEO_CALL')))).toEqual({ best: 'das 23h às 7h', avoid: 'o resto do dia' });
});

it('enviar arquivos em SP (21 boas de 24): só a exceção em "Evite"', () => {
  expect(text(bestAndAvoid(sp, suitable('FILE_UPLOAD')))).toEqual({ best: 'o resto do dia', avoid: 'das 15h às 18h' });
});

it('mandar mensagens em SP (24 boas): "o dia todo" e "nenhum horário"', () => {
  expect(text(bestAndAvoid(sp, suitable('MESSAGING')))).toEqual({ best: 'o dia todo', avoid: 'nenhum horário' });
});

it('nenhuma hora boa: "nenhum horário" e "o dia todo"', () => {
  expect(text(bestAndAvoid(fake([false, false, false]), (i) => i.good))).toEqual({
    best: 'nenhum horário',
    avoid: 'o dia todo',
  });
});

it('nunca dá a volta nos dados: ruins no começo e no fim viram duas faixas, não "das 23h às 0h"', () => {
  // 21h ruim, 22h–23h boas, 0h ruim (a última hora). Minoria ruim: lista as duas faixas separadas.
  const r = bestAndAvoid(fake([false, true, true, true, true, false]), (i) => i.good);
  expect(text(r)).toEqual({ best: 'o resto do dia', avoid: 'das 21h às 22h e das 2h às 3h' });
});

it('empate: lista as duas linhas', () => {
  expect(text(bestAndAvoid(fake([true, true, false, false]), (i) => i.good))).toEqual({
    best: 'das 21h às 23h',
    avoid: 'das 23h às 1h',
  });
});
