import { BRAND, isShadeKey, MONO_COLORS, type ShadeKey } from "./palette";
import { rect, type Rect } from "./rect";
import { CABLE_SWEEP, G_PART, J_PART, PULSE_SWEEP, SHINE_SWEEP } from "./timing";

/** O monograma em grade: cada letra é um tom de azul do logo e T é o traço de circuito. */
export const MONO_ROWS: readonly string[] = [
  ".................MBBBBBBBCCCCCCWWWWW",
  "................MBBBBBBBBCCCCCCWWWWW",
  "..............CMBBBBBBBBBCCCCCCWWWW.",
  ".............CMMBBBBBBBBBCCCCCCWWW..",
  "............CMMMBBBBBBBBCCCCCCWWW...",
  "...........CCNMMMMMMMMMMMMMMMMBB....",
  "...........CCNNMMMMMMMMMMMMMMMB.....",
  "...........CCBNNDDDDDDDDDDDDDD......",
  "...........CCBNMMD..................",
  "...........CCBNMMD..................",
  "...........CCBNMMD..................",
  "...........CCBNMMD..................",
  "...........CCBNMMD..................",
  "...........CCBNNND...DD.............",
  "...........CCBNNND...DDDD...........",
  "...........BBMNNND...DDDDDDN........",
  "...........BBMNNND...DDTTTDNC.......",
  "...........BBMNNND...DDTDTDBCC......",
  ".NMMMN......BBNNND...DDTTTDBCW......",
  "NMCWWCB......BNNND...DDDTDDBCW......",
  "NMMCWWCB.....MNNND...DDDTDDBCW......",
  "DNMMCWWCB.....NNND...DDDTDDBCW......",
  ".DNMMCWWCBB...NNMD.....DTDDBCW......",
  ".DNNMMCWWCCBBBBMND.....DTDDBCW......",
  "..DNNNMCCCCCCBBMDD.....DTDDBCW......",
  "..DNNNNMMBBBBBMNDDDDDDDTDDNBCW......",
  "...DNNNNMMMMMNNDDDDDDDTDDNBCCW......",
  "....DDNNNNNNNNDDDD...TDNBCCCW.......",
  "......DDDDDDDDDDD.....DNBCCC........",
  ".......................NBBB.........",
];

export const MONO_ORIGIN = { x: 78, y: 13 } as const;
export const MONO_SCALE = 2;
const J_COLUMNS = 18;
const SHINE_WIDTH = 3;
const FLASH_MS = 50;
const TRACE_KEY = "T";
const BAYER_SIZE = 4;
const BAYER_LEVELS = 16;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

export interface MonoCell {
  readonly column: number;
  readonly row: number;
  readonly shade: ShadeKey | typeof TRACE_KEY;
}

function cellsOfRow(line: string, row: number): readonly MonoCell[] {
  const cells: MonoCell[] = [];
  [...line].forEach((char, column) => {
    if (char === TRACE_KEY || isShadeKey(char)) {
      cells.push({ column, row, shade: char });
    }
  });
  return cells;
}

export const MONO_CELLS: readonly MonoCell[] = MONO_ROWS.flatMap(cellsOfRow);

const CABLE_LAST_ROW_COLUMN = 112;
const CABLE_LAST_ROW = 76;
const CABLE_DIAGONAL_STEPS = 7;

type Point = readonly [number, number];

/** O fio sai da lateral do controle, desce, corre por baixo do monograma e entra pela fresta do G até o fim do traço. */
function cablePixels(): readonly Point[] {
  const pixels: Point[] = [];
  for (let x = 58; x <= 63; x += 1) {
    pixels.push([x, 43]);
  }
  pixels.push([64, 44], [65, 45]);
  for (let y = 46; y <= 74; y += 1) {
    pixels.push([66, y]);
  }
  pixels.push([67, 75]);
  for (let x = 68; x <= CABLE_LAST_ROW_COLUMN; x += 1) {
    pixels.push([x, CABLE_LAST_ROW]);
  }
  for (let step = 1; step <= CABLE_DIAGONAL_STEPS; step += 1) {
    pixels.push([CABLE_LAST_ROW_COLUMN + step, CABLE_LAST_ROW - step]);
  }
  return pixels;
}

export const CABLE_PIXELS = cablePixels();

const TRACE_ORDER: readonly Point[] = [
  [21, 27],
  [22, 26],
  [23, 25],
  [24, 24],
  [24, 23],
  [24, 22],
  [24, 21],
  [24, 20],
  [24, 19],
];
const TRACE_INDEX = new Map<string, number>(
  TRACE_ORDER.map(([column, row], order) => [`${column},${row}`, CABLE_PIXELS.length + order]),
);
const RING_INDEX = CABLE_PIXELS.length + TRACE_ORDER.length;
const CIRCUIT_STEPS = RING_INDEX + 1;
const PULSE_HEAD_LENGTH = 3;

/** Cor do passo `index` do circuito: o pulso corre do controle até o ponto do circuito e deixa tudo aceso. */
function circuitColor(index: number, elapsedMs: number): string {
  if (elapsedMs < PULSE_SWEEP.start) {
    return MONO_COLORS.B;
  }
  if (elapsedMs >= PULSE_SWEEP.end) {
    const settled = index === RING_INDEX ? BRAND.glow : MONO_COLORS.W;
    return settled;
  }
  const progress = (elapsedMs - PULSE_SWEEP.start) / (PULSE_SWEEP.end - PULSE_SWEEP.start);
  const head = Math.floor(CIRCUIT_STEPS * progress);
  if (index > head) {
    return MONO_COLORS.B;
  }
  const lit = head - index < PULSE_HEAD_LENGTH ? BRAND.flash : MONO_COLORS.W;
  return lit;
}

export function cableRects(elapsedMs: number): readonly Rect[] {
  if (elapsedMs < CABLE_SWEEP.start) {
    return [];
  }
  const progress = Math.min(1, (elapsedMs - CABLE_SWEEP.start) / (CABLE_SWEEP.end - CABLE_SWEEP.start));
  const shown = Math.floor(CABLE_PIXELS.length * progress);
  const rects = CABLE_PIXELS.slice(0, shown).map(([x, y], index) =>
    rect(circuitColor(index, elapsedMs), x, y),
  );
  return rects;
}

function shineBand(elapsedMs: number): number | undefined {
  if (elapsedMs < SHINE_SWEEP.start || elapsedMs >= SHINE_SWEEP.end) {
    return undefined;
  }
  const from = -SHINE_WIDTH - 2;
  const to = (MONO_ROWS[0]?.length ?? 0) + MONO_ROWS.length / 2 + 2;
  const progress = (elapsedMs - SHINE_SWEEP.start) / (SHINE_SWEEP.end - SHINE_SWEEP.start);
  const band = from + (to - from) * progress;
  return band;
}

function inBand(position: number, band: number | undefined): boolean {
  const inside = band !== undefined && position - band >= 0 && position - band < SHINE_WIDTH;
  return inside;
}

function bayerThreshold(cell: MonoCell): number {
  const value = BAYER[cell.row % BAYER_SIZE]?.[cell.column % BAYER_SIZE] ?? 0;
  const threshold = (value + 0.5) / BAYER_LEVELS;
  return threshold;
}

function cellColor(cell: MonoCell, part: { readonly end: number }, elapsedMs: number, band: number | undefined): string {
  if (elapsedMs >= part.end && elapsedMs < part.end + FLASH_MS) {
    return BRAND.flash;
  }
  if (inBand(cell.column + cell.row * 0.5, band)) {
    return BRAND.glow;
  }
  if (cell.shade !== TRACE_KEY) {
    return MONO_COLORS[cell.shade];
  }
  const index = TRACE_INDEX.get(`${cell.column},${cell.row}`) ?? RING_INDEX;
  const traceColor = circuitColor(index, elapsedMs);
  return traceColor;
}

/** Cada parte surge por pontilhado ordenado (matriz de Bayer), o jeito dos consoles antigos de simular transparência. */
export function monogramRects(elapsedMs: number): readonly Rect[] {
  const band = shineBand(elapsedMs);
  const rects: Rect[] = [];
  for (const cell of MONO_CELLS) {
    const part = cell.column < J_COLUMNS ? J_PART : G_PART;
    const progress = (elapsedMs - part.start) / (part.end - part.start);
    if (progress <= 0 || (progress < 1 && bayerThreshold(cell) >= progress)) {
      continue;
    }
    const color = cellColor(cell, part, elapsedMs, band);
    rects.push(
      rect(
        color,
        MONO_ORIGIN.x + cell.column * MONO_SCALE,
        MONO_ORIGIN.y + cell.row * MONO_SCALE,
        MONO_SCALE,
        MONO_SCALE,
      ),
    );
  }
  return rects;
}
