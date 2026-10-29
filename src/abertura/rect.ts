export const ART_WIDTH = 160;
export const ART_HEIGHT = 120;

/** Retângulo de pixels inteiros na grade da arte. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
}

export function rect(color: string, x: number, y: number, width = 1, height = 1): Rect {
  const created: Rect = { x, y, width, height, color };
  return created;
}

function clipRect(source: Rect): Rect | undefined {
  const left = Math.max(0, source.x);
  const top = Math.max(0, source.y);
  const right = Math.min(ART_WIDTH, source.x + source.width);
  const bottom = Math.min(ART_HEIGHT, source.y + source.height);
  if (right <= left || bottom <= top) {
    return undefined;
  }
  const clipped = rect(source.color, left, top, right - left, bottom - top);
  return clipped;
}

/** Recorta cada retângulo ao que cabe na grade e descarta os que ficam todos fora, como a tela faria. */
export function clipToGrid(rects: readonly Rect[]): readonly Rect[] {
  const clipped: Rect[] = [];
  for (const source of rects) {
    const visible = clipRect(source);
    if (visible) {
      clipped.push(visible);
    }
  }
  return clipped;
}
