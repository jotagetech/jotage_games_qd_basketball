export type ShadeKey = "D" | "N" | "M" | "B" | "C" | "W";

/** Os seis azuis da marca; cada letra da grade do monograma é um tom. */
export const MONO_COLORS: Readonly<Record<ShadeKey, string>> = {
  D: "#041f4a",
  N: "#053265",
  M: "#044088",
  B: "#0178da",
  C: "#00b7f4",
  W: "#00daee",
};

export const BRAND = {
  black: "#000000",
  ice: "#e6eef8",
  frost: "#93a9c4",
  glow: "#9ff8ff",
  flash: "#e6ffff",
  shadow: "#0a1a33",
} as const;

export function isShadeKey(char: string): char is ShadeKey {
  const known = char in MONO_COLORS;
  return known;
}
