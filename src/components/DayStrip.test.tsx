import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import type { Timeline, TimelineItem } from '@/api/types';
import { DayStrip } from '@/components/DayStrip';
import timelines from '@/data/mock/timelines.json';
import { brasiliaHour } from '@/data/time';

// D33: confere o desenho de verdade (os retângulos SVG renderizados), não uma cópia da conta.
const items = (timelines as Record<string, Timeline>)['900001']!.items as TimelineItem[];
jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

type Node = { type: string; props: Record<string, any>; children?: (Node | string)[] | null };
function collect(node: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === 'object') {
    out.push(node as Node);
    collect((node as Node).children, out);
  }
  return out;
}
// O texto do SVG fica em TSpan.content.
const textOf = (n: Node): string =>
  (n.children ?? []).map((c) => (typeof c === 'string' ? '' : (c.props.content ?? textOf(c)))).join('');

async function draw(props: { selected?: string; onSelect?: (p: string) => void } = {}) {
  const r = await render(
    <DayStrip items={items} onSelect={props.onSelect ?? (() => {})} caption="19 e 20 de agosto" {...props} />,
  );
  const nodes = collect(r.toJSON());
  // Barras: retângulos de largura 10 (padrões têm 6 ou 7; legenda 18; linha de base, a faixa toda).
  const bars = nodes
    .filter((n) => n.type === 'RNSVGRect' && Number(n.props.width) === 10)
    .map((n) => {
      const f = n.props.fill;
      const q = f.brushRef?.endsWith('-dim')
        ? 'DIM'
        : f.brushRef?.endsWith('-moderate')
          ? 'MODERATE'
          : f.brushRef?.endsWith('-unstable')
            ? 'UNSTABLE'
            : 'GOOD';
      return {
        x: Number(n.props.x),
        y: Number(n.props.y),
        h: Number(n.props.height),
        quality: q,
        opacity: n.props.opacity ?? 1,
        outlined: n.props.stroke != null,
      };
    });
  const texts = nodes.filter((n) => n.type === 'RNSVGText').map(textOf);
  return { bars, texts };
}

it('24 barras em ordem de tempo (19/08 21h a 20/08 20h), todas da mesma altura, com a categoria certa (D34)', async () => {
  const { bars } = await draw();
  expect(bars).toHaveLength(24);
  bars.forEach((b, i) => {
    if (i > 0) expect(b.x).toBeGreaterThan(bars[i - 1]!.x);
    expect(b.quality).toBe(items[i]!.quality);
  });
  expect(brasiliaHour(items[0]!.predictionFor)).toBe(21);
  // A nota não entra na altura: uma Regular não pode parecer "melhor" que uma Boa.
  expect(new Set(bars.map((b) => b.h)).size).toBe(1);
  expect(new Set(bars.map((b) => b.y)).size).toBe(1);
});

it('rótulos a cada 3 horas e a data na virada', async () => {
  const { texts } = await draw();
  for (const label of ['21h', '0h', '3h', '6h', '9h', '12h', '15h', '18h', '19/08', '20/08'])
    expect(texts).toContain(label);
  expect(texts).not.toContain('22h');
});

it('hora escolhida: só a barra dela tem contorno; hora e categoria em texto normal acima (D34)', async () => {
  const { bars, texts } = await draw({ selected: items[4]!.predictionFor }); // 01:00, Boa
  expect(bars.filter((b) => b.outlined)).toHaveLength(1);
  expect(bars[4]!.outlined).toBe(true);
  // Text do React Native (cresce com o texto do sistema), não texto dentro do SVG.
  // Escondido do leitor de tela (a faixa fala o mesmo valor), mas visível.
  expect(screen.getByText('01:00 · Boa', { includeHiddenElements: true })).toBeOnTheScreen();
  expect(texts).not.toContain('01:00 · Boa');
  expect(screen.getByRole('adjustable').props.accessibilityValue).toEqual({ text: '01:00 · Boa' });
  // Linha de cima do wireframe: a data à esquerda, a hora à direita.
  expect(screen.getByText('19 e 20 de agosto', { includeHiddenElements: true })).toBeOnTheScreen();
});

it('toque: a faixa inteira é uma área só e escolhe a barra mais próxima', async () => {
  const onSelect = jest.fn();
  await draw({ onSelect });
  const strip = screen.getByRole('adjustable');
  await fireEvent(strip, 'layout', { nativeEvent: { layout: { width: 336 } } });
  await fireEvent.press(strip, { nativeEvent: { locationX: 14 * 2 + 5 } }); // terceira barra = 23h
  expect(onSelect).toHaveBeenLastCalledWith(items[2]!.predictionFor);
});

it('VoiceOver: ajustável, com o valor falado; deslizar muda a hora; toque duplo não escolhe nada', async () => {
  const onSelect = jest.fn();
  await draw({ onSelect, selected: items[2]!.predictionFor });
  const strip = screen.getByRole('adjustable', { name: 'Faixa do dia, hora a hora' });
  expect(strip.props.accessibilityValue).toEqual({ text: '23:00 · Boa' });
  await fireEvent(strip, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
  expect(onSelect).toHaveBeenLastCalledWith(items[3]!.predictionFor);
  await fireEvent(strip, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
  expect(onSelect).toHaveBeenLastCalledWith(items[1]!.predictionFor);
  onSelect.mockClear();
  await fireEvent(strip, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });
  expect(onSelect).not.toHaveBeenCalled();
});

it('"Hora anterior" e "Próxima hora" (48 dp) ajustam e anunciam; nas pontas, ficam desativados', async () => {
  const onSelect = jest.fn();
  await draw({ onSelect, selected: items[23]!.predictionFor });
  expect(screen.getByRole('button', { name: 'Próxima hora' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Hora anterior' }));
  expect(onSelect).toHaveBeenLastCalledWith(items[22]!.predictionFor);
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenLastCalledWith('19:00 · Regular');
});
