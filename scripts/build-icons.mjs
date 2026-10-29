// D38: gera os PNGs do ícone e da tela de abertura a partir de assets/icon-src/sinal.svg.
// Uso: npm run icons. Cores = tokens do tema (src/theme/index.ts); o contraste é conferido em
// src/__tests__/icons.test.ts.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const SIZE = 1024;
const BG_DARK = '#0F1512'; // background (escuro)
const PRIMARY_DARK = '#86D2A3'; // primary (escuro)
const PRIMARY_LIGHT = '#1F6B45'; // primary (claro)

const src = readFileSync('assets/icon-src/sinal.svg', 'utf8');
const [, vw, vh] = src.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
const shapes = src.match(/<rect[^>]*\/>/g).join('');

/** O símbolo numa tela de 1024, centralizado, ocupando `scale` da tela no lado maior, na cor dada. */
function canvas({ scale, color, background }) {
  const s = (SIZE * scale) / Math.max(vw, vh);
  const x = (SIZE - vw * s) / 2;
  const y = (SIZE - vh * s) / 2;
  const bg = background ? `<rect width="${SIZE}" height="${SIZE}" fill="${background}"/>` : '';
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">${bg}` +
      `<g transform="translate(${x} ${y}) scale(${s})">${shapes.replaceAll('#86D2A3', color)}</g></svg>`,
  );
}

const outputs = [
  // Ícone (iOS e lojas): fundo escuro do app, símbolo em ~49% da tela (margem segura para a máscara do iOS).
  ['assets/icon.png', { scale: 0.49, color: PRIMARY_DARK, background: BG_DARK }],
  // Android adaptativo: só o símbolo; o fundo vem de backgroundColor no app.json. Ele ocupa ~37% da tela,
  // dentro do círculo seguro de 66% (os cantos das barras ficam a ~0,25 da tela do centro, limite 0,33).
  ['assets/android-icon-foreground.png', { scale: 0.37, color: PRIMARY_DARK }],
  // Ícone monocromático (Android 13+): o sistema pinta; só a forma importa.
  ['assets/android-icon-monochrome.png', { scale: 0.37, color: '#FFFFFF' }],
  // Tela de abertura: o símbolo na cor primária de cada tema, sobre o fundo de cada tema (app.json).
  ['assets/splash-icon.png', { scale: 0.9, color: PRIMARY_LIGHT }],
  ['assets/splash-icon-dark.png', { scale: 0.9, color: PRIMARY_DARK }],
  // Web (não é alvo, mas o favicon deixa de ser o do modelo do Expo).
  ['assets/favicon.png', { scale: 0.7, color: PRIMARY_DARK, background: BG_DARK }, 48],
];

for (const [file, opts, size = SIZE] of outputs) {
  await sharp(canvas(opts)).resize(size, size).png().toFile(file);
  console.log('gerado', file);
}
