import { BRAND, MONO_COLORS } from "./palette";
import { rect, type Rect } from "./rect";
import { DROP_START_MS, G_PART, J_PART, LANDINGS_MS, PULSE_SWEEP, START_PRESS_MS } from "./timing";

type ButtonName = "dpad" | "a" | "start";

const BUTTONS: readonly ButtonName[] = ["dpad", "a", "start"];
const PRESSES_MS: Readonly<Record<ButtonName, number>> = {
  dpad: J_PART.start,
  a: G_PART.start,
  start: START_PRESS_MS,
};
const SPARK_SPOTS: Readonly<Record<ButtonName, { readonly x: number; readonly y: number }>> = {
  dpad: { x: 13, y: 10 },
  a: { x: 36, y: 8 },
  start: { x: 25, y: 14 },
};

const PAD = { x: 14, restY: 33 } as const;
const PAD_WIDTH = 44;
const PAD_HEIGHT = 21;
const PAD_START_Y = -24;
const GRIP_RADIUS = 10.5;
const PAD_SHADE_ROW = 16;
const BOUNCE_HEIGHTS = [10, 3] as const;
const DUST_MS = 160;
const DUST_SIZES = [2, 1, 1] as const;
const PRESS_LIT_MS = 140;
const PRESS_DIP_MS = 80;
const PRESS_SPARK_MS = 120;
const SHADOW_MAX_WIDTH = 36;
const SHADOW_MIN_WIDTH = 8;

const COLORS = {
  body: BRAND.ice,
  shade: BRAND.frost,
  outline: MONO_COLORS.N,
  ring: BRAND.frost,
  dpad: MONO_COLORS.N,
  dpadCenter: MONO_COLORS.D,
  button: MONO_COLORS.C,
  buttonDeep: MONO_COLORS.B,
  small: MONO_COLORS.M,
  lit: MONO_COLORS.W,
  ledOff: MONO_COLORS.M,
  ledOn: MONO_COLORS.W,
  spark: BRAND.glow,
  shadow: BRAND.shadow,
  dustNear: BRAND.frost,
  dustFar: MONO_COLORS.N,
} as const;

function insideGrip(x: number, y: number, centerX: number): boolean {
  const inside = (x + 0.5 - centerX) ** 2 + (y + 0.5 - GRIP_RADIUS) ** 2 <= GRIP_RADIUS ** 2;
  return inside;
}

function insideBody(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= PAD_WIDTH || y >= PAD_HEIGHT) {
    return false;
  }
  const inBridge = x >= 10 && x <= 33 && y >= 1 && y <= 19;
  const inside = inBridge || insideGrip(x, y, GRIP_RADIUS) || insideGrip(x, y, PAD_WIDTH - GRIP_RADIUS);
  return inside;
}

function bodyColorAt(x: number, y: number): string {
  const onEdge =
    !insideBody(x - 1, y) || !insideBody(x + 1, y) || !insideBody(x, y - 1) || !insideBody(x, y + 1);
  if (onEdge) {
    return COLORS.outline;
  }
  const face = y >= PAD_SHADE_ROW ? COLORS.shade : COLORS.body;
  return face;
}

function bodyRowRects(y: number): readonly Rect[] {
  const runs: Rect[] = [];
  for (let x = 0; x < PAD_WIDTH; x += 1) {
    if (!insideBody(x, y)) {
      continue;
    }
    const color = bodyColorAt(x, y);
    const last = runs[runs.length - 1];
    if (last && last.color === color && last.x + last.width === x) {
      runs[runs.length - 1] = rect(color, last.x, y, last.width + 1);
    } else {
      runs.push(rect(color, x, y));
    }
  }
  return runs;
}

const BODY_RECTS: readonly Rect[] = Array.from({ length: PAD_HEIGHT }, (_, y) => bodyRowRects(y)).flat();

function isLit(elapsedMs: number, pressAt: number): boolean {
  const lit = elapsedMs >= pressAt && elapsedMs < pressAt + PRESS_LIT_MS;
  return lit;
}

function hop(elapsedMs: number, from: number, to: number, height: number): number {
  const progress = (elapsedMs - from) / (to - from);
  const lift = 4 * height * progress * (1 - progress);
  return lift;
}

function isDipping(elapsedMs: number): boolean {
  const dipping = BUTTONS.some((button) => {
    const pressAt = PRESSES_MS[button];
    return elapsedMs >= pressAt && elapsedMs < pressAt + PRESS_DIP_MS;
  });
  return dipping;
}

/** Altura do controle no quadro: cai, quica duas vezes e assenta; `undefined` antes da queda. */
function padY(elapsedMs: number): number | undefined {
  if (elapsedMs < DROP_START_MS) {
    return undefined;
  }
  const [first, second, third] = LANDINGS_MS;
  const [firstHeight, secondHeight] = BOUNCE_HEIGHTS;
  if (elapsedMs < first) {
    const progress = (elapsedMs - DROP_START_MS) / (first - DROP_START_MS);
    const falling = Math.round(PAD_START_Y + (PAD.restY - PAD_START_Y) * progress * progress);
    return falling;
  }
  if (elapsedMs < second) {
    const firstBounce = Math.round(PAD.restY - hop(elapsedMs, first, second, firstHeight));
    return firstBounce;
  }
  if (elapsedMs < third) {
    const secondBounce = Math.round(PAD.restY - hop(elapsedMs, second, third, secondHeight));
    return secondBounce;
  }
  const rest = PAD.restY + (isDipping(elapsedMs) ? 1 : 0);
  return rest;
}

function shadowRects(y: number): readonly Rect[] {
  const centerX = PAD.x + PAD_WIDTH / 2;
  const groundY = PAD.restY + PAD_HEIGHT;
  const lift = Math.max(0, PAD.restY - y);
  let width = Math.max(SHADOW_MIN_WIDTH, SHADOW_MAX_WIDTH - Math.floor(lift / 2));
  width -= width % 2;
  const rects = [rect(COLORS.shadow, centerX - width / 2, groundY + 2, width)];
  if (width > 12) {
    rects.push(rect(COLORS.shadow, centerX - (width - 8) / 2, groundY + 3, width - 8));
  }
  return rects;
}

function dustRects(elapsedMs: number): readonly Rect[] {
  const groundY = PAD.restY + PAD_HEIGHT;
  const rects: Rect[] = [];
  LANDINGS_MS.forEach((landing, index) => {
    const sinceLanding = elapsedMs - landing;
    if (sinceLanding < 0 || sinceLanding >= DUST_MS) {
      return;
    }
    const spread = 2 + 2 * Math.floor(sinceLanding / 40);
    const y = groundY - 1 - Math.floor(sinceLanding / 60);
    const color = sinceLanding < DUST_MS / 2 ? COLORS.dustNear : COLORS.dustFar;
    for (let k = 0; k < (DUST_SIZES[index] ?? 0); k += 1) {
      rects.push(rect(color, PAD.x - spread - 2 * k, y));
      rects.push(rect(color, PAD.x + PAD_WIDTH - 1 + spread + 2 * k, y));
    }
  });
  return rects;
}

type PadRect = (color: string, x: number, y: number, width?: number, height?: number) => Rect;

function buttonRects(at: PadRect, x: number, y: number, pressed: boolean): readonly Rect[] {
  const face = pressed ? COLORS.buttonDeep : COLORS.button;
  const rects = [
    at(COLORS.ring, x, y - 1, 4, 1),
    at(COLORS.ring, x - 1, y, 6, 4),
    at(COLORS.ring, x, y + 4, 4, 1),
    at(face, x + 1, y, 2, 1),
    at(face, x, y + 1, 4, 2),
    at(COLORS.buttonDeep, x + 1, y + 3, 2, 1),
  ];
  return rects;
}

function detailRects(originY: number, elapsedMs: number): readonly Rect[] {
  const at: PadRect = (color, x, y, width = 1, height = 1) =>
    rect(color, PAD.x + x, originY + y, width, height);
  const rects = [
    at(COLORS.ring, 6, 8, 9, 5),
    at(COLORS.ring, 8, 6, 5, 9),
    at(COLORS.dpad, 7, 9, 7, 3),
    at(COLORS.dpad, 9, 7, 3, 7),
    at(COLORS.dpadCenter, 10, 10),
  ];
  if (isLit(elapsedMs, PRESSES_MS.dpad)) {
    rects.push(at(COLORS.lit, 12, 9, 2, 3));
  }
  rects.push(...buttonRects(at, 28, 10, false));
  rects.push(...buttonRects(at, 34, 6, isLit(elapsedMs, PRESSES_MS.a)));
  rects.push(at(COLORS.small, 17, 14, 3, 1));
  rects.push(at(isLit(elapsedMs, PRESSES_MS.start) ? COLORS.lit : COLORS.small, 24, 14, 3, 1));
  rects.push(at(elapsedMs >= PULSE_SWEEP.start ? COLORS.ledOn : COLORS.ledOff, 21, 4, 2, 1));
  return rects;
}

const SPARK_DIRECTIONS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

function sparkRects(originY: number, elapsedMs: number): readonly Rect[] {
  const rects: Rect[] = [];
  for (const button of BUTTONS) {
    const sincePress = elapsedMs - PRESSES_MS[button];
    if (sincePress < 0 || sincePress >= PRESS_SPARK_MS) {
      continue;
    }
    const spot = SPARK_SPOTS[button];
    const reach = 3 + Math.floor(sincePress / 40);
    for (const [dx, dy] of SPARK_DIRECTIONS) {
      rects.push(rect(COLORS.spark, PAD.x + spot.x + dx * reach, originY + spot.y + dy * reach));
    }
  }
  return rects;
}

export function controllerRects(elapsedMs: number): readonly Rect[] {
  const y = padY(elapsedMs);
  if (y === undefined) {
    return [];
  }
  const body = BODY_RECTS.map((part) => rect(part.color, PAD.x + part.x, y + part.y, part.width, part.height));
  const rects = [
    ...shadowRects(y),
    ...dustRects(elapsedMs),
    ...body,
    ...detailRects(y, elapsedMs),
    ...sparkRects(y, elapsedMs),
  ];
  return rects;
}
