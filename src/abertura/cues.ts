/** Deixas da vinheta, sintetizadas na hora em vez de lidas de arquivo. */
export const STUDIO_SOUND_NAMES = [
  "studio_ligar",
  "studio_quiques",
  "studio_j",
  "studio_g",
  "studio_fio",
  "studio_start",
  "studio_brilho",
] as const;

export type StudioSoundName = (typeof STUDIO_SOUND_NAMES)[number];
