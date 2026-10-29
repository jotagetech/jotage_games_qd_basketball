import { controllerRects } from "./controller";
import { textRects, type TextSpec } from "./glyphs";
import { cableRects, monogramRects } from "./monogram";
import { BRAND, MONO_COLORS } from "./palette";
import { ART_HEIGHT, ART_WIDTH, clipToGrid, rect, type Rect } from "./rect";
import { FIRST_WORD_TIMES_MS, POWER_LINE_MS, POWER_OPEN_MS, SECOND_WORD_TIMES_MS } from "./timing";

const POWER_FADE = [BRAND.flash, MONO_COLORS.B, MONO_COLORS.N, MONO_COLORS.D] as const;
const POWER_LINE_HEIGHT = 2;

const FIRST_WORD: TextSpec = {
  text: "JOTAGÊ",
  x: 12,
  y: 93,
  scale: 2,
  gap: 2,
  color: MONO_COLORS.B,
  shadow: MONO_COLORS.D,
  times: FIRST_WORD_TIMES_MS,
};

const SECOND_WORD: TextSpec = {
  text: "GAMES",
  x: 90,
  y: 93,
  scale: 2,
  gap: 2,
  color: MONO_COLORS.W,
  shadow: MONO_COLORS.M,
  times: SECOND_WORD_TIMES_MS,
};

/** A tela liga como uma TV de tubo: uma linha que se abre em toda a tela, esfriando de cor. */
function powerOnRects(elapsedMs: number): readonly Rect[] {
  if (elapsedMs < POWER_LINE_MS) {
    const width = Math.max(POWER_LINE_HEIGHT, Math.floor((ART_WIDTH * elapsedMs) / POWER_LINE_MS));
    return [rect(POWER_FADE[0], (ART_WIDTH - width) >> 1, ART_HEIGHT / 2 - 1, width, POWER_LINE_HEIGHT)];
  }
  const progress = (elapsedMs - POWER_LINE_MS) / (POWER_OPEN_MS - POWER_LINE_MS);
  const height = POWER_LINE_HEIGHT + Math.floor((ART_HEIGHT - POWER_LINE_HEIGHT) * progress);
  const step = Math.min(POWER_FADE.length - 1, Math.floor(progress * POWER_FADE.length));
  const color = POWER_FADE[step] ?? BRAND.black;
  return [rect(color, 0, (ART_HEIGHT - height) >> 1, ART_WIDTH, height)];
}

function sceneRects(elapsedMs: number): readonly Rect[] {
  const powerOn = elapsedMs < POWER_OPEN_MS ? powerOnRects(elapsedMs) : [];
  const rects = [
    ...powerOn,
    ...monogramRects(elapsedMs),
    ...cableRects(elapsedMs),
    ...controllerRects(elapsedMs),
    ...textRects(FIRST_WORD, elapsedMs),
    ...textRects(SECOND_WORD, elapsedMs),
  ];
  return rects;
}

/** Quadro da vinheta no instante dado: retângulos inteiros na grade de 160 x 120, do fundo para a frente. */
export function studioFrame(elapsedMs: number): readonly Rect[] {
  const ground = rect(BRAND.black, 0, 0, ART_WIDTH, ART_HEIGHT);
  if (elapsedMs < 0) {
    return [ground];
  }
  const frame = [ground, ...clipToGrid(sceneRects(elapsedMs))];
  return frame;
}
