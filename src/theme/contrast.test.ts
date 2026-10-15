import { contrastRatio } from './contrast';
import { colors, contrastPairs } from './index';

describe('contrastRatio', () => {
  it('bate com os valores de referência da WCAG', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    // #767676 sobre branco é o cinza mais claro que ainda passa 4,5:1
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });

  it('não depende da ordem das cores', () => {
    expect(contrastRatio('#14306B', '#F5F6FA')).toBe(contrastRatio('#F5F6FA', '#14306B'));
  });

  it('recusa cor em formato inválido', () => {
    expect(() => contrastRatio('red', '#FFFFFF')).toThrow('Cor inválida');
  });
});

describe('paleta (RNF04)', () => {
  it.each(contrastPairs)('%s sobre %s >= %s:1', (fg, bg, min) => {
    expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(min);
  });
});
