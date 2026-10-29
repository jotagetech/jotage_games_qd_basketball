export const STUDIO_DURATION_MS = 4000;
export const STUDIO_HOLD_MS = 1000;

export const POWER_LINE_MS = 140;
export const POWER_OPEN_MS = 320;
export const DROP_START_MS = 360;
export const LANDINGS_MS = [660, 880, 1020] as const;

export const J_PART = { start: 1250, end: 1450 } as const;
export const G_PART = { start: 1700, end: 1900 } as const;
export const CABLE_SWEEP = { start: 2000, end: 2200 } as const;
export const START_PRESS_MS = 2250;
export const PULSE_SWEEP = { start: 2300, end: 2580 } as const;
export const SHINE_SWEEP = { start: 3150, end: 3550 } as const;

export const FIRST_WORD_TIMES_MS = [2600, 2645, 2690, 2735, 2780, 2825] as const;
export const SECOND_WORD_TIMES_MS = [2870, 2915, 2960, 3005, 3050] as const;
