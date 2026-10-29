import { rect, type Rect } from "./rect";

export const GLYPH_WIDTH = 5;
const LETTER_POP_MS = 60;

interface Glyph {
  readonly top: number;
  readonly rows: readonly string[];
}

const GLYPHS: Readonly<Record<string, Glyph>> = {
  J: { top: 0, rows: ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."] },
  O: { top: 0, rows: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."] },
  T: { top: 0, rows: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."] },
  A: { top: 0, rows: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"] },
  G: { top: 0, rows: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"] },
  M: { top: 0, rows: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"] },
  E: { top: 0, rows: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"] },
  S: { top: 0, rows: [".####", "#....", "#....", ".###.", "....#", "....#", "####."] },
  Ê: {
    top: -3,
    rows: ["..#..", ".#.#.", ".....", "#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  },
};

export interface TextSpec {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly gap: number;
  readonly color: string;
  readonly shadow: string;
  readonly times: readonly number[];
}

interface Letter {
  readonly glyph: Glyph;
  readonly x: number;
  readonly y: number;
}

function visibleLetters(spec: TextSpec, elapsedMs: number): readonly Letter[] {
  const letters: Letter[] = [];
  [...spec.text].forEach((char, index) => {
    const revealAt = spec.times[index] ?? Number.POSITIVE_INFINITY;
    const glyph = GLYPHS[char];
    if (!glyph || elapsedMs < revealAt) {
      return;
    }
    const lift = elapsedMs - revealAt < LETTER_POP_MS ? 1 : 0;
    letters.push({ glyph, x: spec.x + index * (GLYPH_WIDTH * spec.scale + spec.gap), y: spec.y - lift });
  });
  return letters;
}

function glyphRects(letter: Letter, scale: number, offset: number, color: string): readonly Rect[] {
  const rects: Rect[] = [];
  letter.glyph.rows.forEach((row, rowIndex) => {
    for (let column = 0; column < GLYPH_WIDTH; column += 1) {
      if (row[column] !== "#") {
        continue;
      }
      const cellX = letter.x + column * scale + offset;
      const cellY = letter.y + (rowIndex + letter.glyph.top) * scale + offset;
      rects.push(rect(color, cellX, cellY, scale, scale));
    }
  });
  return rects;
}

/** Sombra de todas as letras visíveis, depois a face, para a sombra nunca cobrir a letra vizinha. */
export function textRects(spec: TextSpec, elapsedMs: number): readonly Rect[] {
  const letters = visibleLetters(spec, elapsedMs);
  const shadows = letters.flatMap((letter) => glyphRects(letter, spec.scale, 1, spec.shadow));
  const faces = letters.flatMap((letter) => glyphRects(letter, spec.scale, 0, spec.color));
  const rects = [...shadows, ...faces];
  return rects;
}
