import { render } from '@testing-library/react-native';

import type { Timeline, TimelineItem } from '@/api/types';
import { DayClock } from '@/components/DayClock';
import { brasiliaHour } from '@/data/time';
import timelines from '@/data/mock/timelines.json';

// D30: confere o desenho de verdade (os caminhos SVG renderizados), não uma cópia da conta.
const items = (timelines as Record<string, Timeline>)['900001']!.items as TimelineItem[];

/** Ângulo no relógio (0° no topo, sentido horário) de um ponto do viewBox 300x300. */
const angle = (x: number, y: number) => ((Math.atan2(x - 150, 150 - y) * 180) / Math.PI + 360) % 360;

type Node = {
  type: string;
  props: Record<string, any>;
  children?: (Node | string)[] | null;
};
function collect(node: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === 'object') {
    out.push(node as Node);
    collect((node as Node).children, out);
  }
  return out;
}

async function draw(markTime?: string, highlight?: ReadonlySet<string>) {
  const r = await render(<DayClock items={items} markTime={markTime} highlight={highlight} />);
  const nodes = collect(r.toJSON());
  // Fatias: caminhos que começam por "M x y A" (os padrões da legenda/relógio usam "M0 0L...").
  const slices = nodes
    .filter((n) => typeof n.props?.d === 'string' && n.props.d.startsWith('M ') && n.props.d.includes(' A '))
    .map((n) => {
      // "M x0 y0 A r r 0 0 1 x1 y1 L ...": início e fim do arco de fora.
      const [x0, y0, , , , , , x1, y1] = n.props.d
        .split(/[ MAL]+/)
        .filter(Boolean)
        .map(Number);
      const fill = n.props.fill;
      const q =
        fill.brushRef === 'clock-dim'
          ? 'DIM'
          : fill.brushRef === 'clock-moderate'
            ? 'MODERATE'
            : fill.brushRef === 'clock-unstable'
              ? 'UNSTABLE'
              : 'GOOD';
      return {
        from: angle(x0!, y0!),
        to: angle(x1!, y1!),
        quality: q,
        opacity: n.props.opacity ?? 1,
        outlined: n.props.stroke != null,
      };
    });
  const marker = nodes.find((n) => n.type === 'RNSVGCircle' && n.props.r === 7);
  return { slices, marker };
}

it('cada fatia começa no ângulo da sua hora de Brasília e tem a categoria dessa hora', async () => {
  const { slices } = await draw();
  expect(slices).toHaveLength(24);
  const hours = new Set<number>();
  for (const s of slices) {
    const hour = Math.floor(s.from / 15); // fatia h vai de h*15° a (h+1)*15° (menos a folga)
    expect(s.to).toBeGreaterThan(s.from);
    expect(s.to).toBeLessThan((hour + 1) * 15);
    const item = items.find((i) => brasiliaHour(i.predictionFor) === hour)!;
    expect({ hour, quality: s.quality }).toEqual({
      hour,
      quality: item.quality,
    });
    hours.add(hour);
  }
  expect(hours.size).toBe(24);
});

it('a fatia logo à esquerda do 00h é a das 23h do dia 19: Boa (nota 92, o melhor momento)', async () => {
  const { slices } = await draw();
  const left = slices.find((s) => s.from >= 345 && s.to < 360)!;
  expect(left.quality).toBe('GOOD');
  const first = slices.find((s) => s.from < 15)!; // 00h
  expect(first.quality).toBe('GOOD');
  const before = slices.find((s) => s.from >= 330 && s.to < 345)!; // 22h
  expect(before.quality).toBe('MODERATE');
});

it.each(['2026-08-20T23:00:00Z', '2026-08-20T02:00:00Z', '2026-08-20T18:00:00Z'])(
  'o marcador de %s cai dentro da fatia da hora certa',
  async (markTime) => {
    const { slices, marker } = await draw(markTime);
    const a = angle(marker!.props.cx, marker!.props.cy);
    const hour = brasiliaHour(markTime);
    expect(Math.floor(a / 15)).toBe(hour);
    const slice = slices.find((s) => Math.floor(s.from / 15) === hour)!;
    expect(a).toBeGreaterThan(slice.from);
    expect(a).toBeLessThan(slice.to);
  },
);

it('planejador (D31): as horas fora do destaque ficam com padrão de listras e opacidade, não só com outra cor', async () => {
  // Chamada de vídeo em SP: deve funcionar das 23h às 7h (resposta real salva).
  const suitable = new Set(
    items
      .filter((i) => {
        const h = brasiliaHour(i.predictionFor);
        return h === 23 || h < 7;
      })
      .map((i) => i.predictionFor),
  );
  const { slices } = await draw(undefined, suitable);
  for (const s of slices) {
    const hour = Math.floor(s.from / 15);
    const item = items.find((i) => brasiliaHour(i.predictionFor) === hour)!;
    if (suitable.has(item.predictionFor)) {
      expect({ hour, quality: s.quality, outlined: s.outlined }).toEqual({
        hour,
        quality: item.quality,
        outlined: true,
      });
    } else {
      expect(s.quality).toBe('DIM');
      expect(s.opacity).toBeLessThan(1);
    }
  }
  expect(slices.filter((s) => s.quality === 'DIM')).toHaveLength(16);
});
