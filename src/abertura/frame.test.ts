import { describe, expect, it } from "vitest";

import { studioFrame } from "./frame";
import { MONO_CELLS, MONO_ORIGIN, MONO_ROWS, MONO_SCALE } from "./monogram";
import { BRAND } from "./palette";
import { ART_HEIGHT, ART_WIDTH, type Rect } from "./rect";
import { STUDIO_DURATION_MS } from "./timing";

const SAMPLED_TIMES_MS = [-10, 0, 50, 140, 200, 319, 360, 500, 700, 950, 1300, 1800, 2100, 2300, 2450, 2700, 3000, 3300, 3600, 4000];

function sizedRects(rects: readonly Rect[], size: number): readonly Rect[] {
  const found = rects.filter((part) => part.width === size && part.height === size);
  return found;
}

describe("studioFrame", () => {
  it.each(SAMPLED_TIMES_MS)("em %i ms todo retângulo é inteiro e cabe na grade", (elapsedMs) => {
    for (const part of studioFrame(elapsedMs)) {
      expect([part.x, part.y, part.width, part.height].every(Number.isInteger)).toBe(true);
      expect(part.width).toBeGreaterThan(0);
      expect(part.height).toBeGreaterThan(0);
      expect(part.x).toBeGreaterThanOrEqual(0);
      expect(part.y).toBeGreaterThanOrEqual(0);
      expect(part.x + part.width).toBeLessThanOrEqual(ART_WIDTH);
      expect(part.y + part.height).toBeLessThanOrEqual(ART_HEIGHT);
    }
  });

  it("mantém retângulos inteiros e dentro da grade com tempo fracionário", () => {
    for (const part of studioFrame(1017.37)) {
      expect([part.x, part.y, part.width, part.height].every(Number.isInteger)).toBe(true);
      expect(part.x + part.width).toBeLessThanOrEqual(ART_WIDTH);
      expect(part.y + part.height).toBeLessThanOrEqual(ART_HEIGHT);
    }
  });

  it("antes da queda não há controle", () => {
    const beforeDrop = studioFrame(300);
    const afterDrop = studioFrame(700);

    expect(beforeDrop.some((part) => part.color === BRAND.ice)).toBe(false);
    expect(afterDrop.some((part) => part.color === BRAND.ice)).toBe(true);
  });

  it("o fundo preto cobre a grade inteira antes de tudo", () => {
    const [ground] = studioFrame(-1);

    expect(ground).toEqual({ x: 0, y: 0, width: ART_WIDTH, height: ART_HEIGHT, color: BRAND.black });
    expect(studioFrame(-1)).toHaveLength(1);
  });

  it("o quadro final tem todas as células do monograma", () => {
    const cells = sizedRects(studioFrame(STUDIO_DURATION_MS), MONO_SCALE);
    const painted = new Set(cells.map((part) => `${part.x},${part.y}`));

    expect(MONO_CELLS.length).toBeGreaterThan(0);
    for (const cell of MONO_CELLS) {
      const key = `${MONO_ORIGIN.x + cell.column * MONO_SCALE},${MONO_ORIGIN.y + cell.row * MONO_SCALE}`;
      expect(painted.has(key)).toBe(true);
    }
  });

  it("o quadro final tem o ponto do circuito aceso e antes do pulso ele está apagado", () => {
    const lit = (elapsedMs: number): readonly Rect[] =>
      sizedRects(studioFrame(elapsedMs), MONO_SCALE).filter((part) => part.color === BRAND.glow);

    expect(lit(STUDIO_DURATION_MS).length).toBeGreaterThan(0);
    expect(lit(2200)).toHaveLength(0);
  });

  it("a grade do monograma tem 36 x 30", () => {
    expect(MONO_ROWS).toHaveLength(30);
    expect(MONO_ROWS.every((row) => row.length === 36)).toBe(true);
  });

  it("studioFrame(4000) é o quadro parado, igual a qualquer instante depois do brilho", () => {
    expect(studioFrame(STUDIO_DURATION_MS)).toEqual(studioFrame(3600));
    expect(studioFrame(STUDIO_DURATION_MS)).toEqual(studioFrame(60000));
  });

  it("a mesma entrada dá a mesma saída", () => {
    for (const elapsedMs of SAMPLED_TIMES_MS) {
      expect(studioFrame(elapsedMs)).toEqual(studioFrame(elapsedMs));
    }
  });
});
