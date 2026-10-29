export const START_PROMPT = "TOQUE OU APERTE UMA TECLA";
export const START_PROMPT_COLOR = "#e6eef8";
export const START_PROMPT_SCALE = 2;

const BLINK_HALF_PERIOD_MS = 500;
const SCANLINE_MIN_SCALE = 3;
const SCANLINE_FRACTION = 4;

export const SCANLINE_COLOR = "rgba(0, 0, 0, 0.22)";

/** O texto da tela de toque pisca: aparece nos meios segundos de ordem par. */
export function startPromptVisible(elapsedMs: number): boolean {
  const visible = Math.floor(elapsedMs / BLINK_HALF_PERIOD_MS) % 2 === 0;
  return visible;
}

/** Altura, em pixels do dispositivo, da linha de varredura sobre cada pixel da arte; 0 quando o pixel é pequeno demais. */
export function scanlineHeight(devicePixelsPerArtPixel: number): number {
  if (devicePixelsPerArtPixel < SCANLINE_MIN_SCALE) {
    return 0;
  }
  const height = Math.max(1, Math.floor(devicePixelsPerArtPixel / SCANLINE_FRACTION));
  return height;
}
