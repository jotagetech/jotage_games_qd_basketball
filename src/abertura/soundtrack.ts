import type { Note, Score } from "./chiptune";
import { STUDIO_SOUND_NAMES, type StudioSoundName } from "./cues";
import {
  CABLE_SWEEP,
  FIRST_WORD_TIMES_MS,
  G_PART,
  J_PART,
  LANDINGS_MS,
  PULSE_SWEEP,
  SECOND_WORD_TIMES_MS,
  SHINE_SWEEP,
  START_PRESS_MS,
} from "./timing";

const SHINE_SOUND_OFFSET_MS = 120;
const MS_PER_SECOND = 1000;

export interface StudioCue {
  readonly name: StudioSoundName;
  readonly atMs: number;
}

const CUE_MS: Readonly<Record<StudioSoundName, number>> = {
  studio_ligar: 0,
  studio_quiques: LANDINGS_MS[0],
  studio_j: J_PART.start,
  studio_g: G_PART.start,
  studio_fio: CABLE_SWEEP.start,
  studio_start: START_PRESS_MS,
  studio_brilho: SHINE_SWEEP.start + SHINE_SOUND_OFFSET_MS,
};

/** Instante de cada deixa na vinheta, em ordem crescente. */
export const STUDIO_CUES: readonly StudioCue[] = STUDIO_SOUND_NAMES.map((name) => ({
  name,
  atMs: CUE_MS[name],
}));

type AtSeconds = (ms: number) => number;

interface MelodySpec {
  readonly timesMs: readonly number[];
  readonly midiNotes: readonly number[];
  readonly durationSec: number;
  readonly lastDurationSec: number;
  readonly gain: number;
}

const LANDING_VOLUMES = [1, 0.55, 0.3] as const;
const ARPEGGIO_OFFSETS_MS = [0, 45, 90, 135] as const;
const LANDING_DUST_NOISE_HZ = 900;
const CABLE_TICKS = 6;
const CABLE_TICK_SPACING_MS = 33;
const DEFAULT_MELODY_GAIN = 0.12;

function midiFrequency(note: number): number {
  const frequencyHz = 440 * 2 ** ((note - 69) / 12);
  return frequencyHz;
}

function hiss(
  startSec: number,
  durationSec: number,
  gain: number,
  filter: NonNullable<Note["filter"]>,
): Note {
  const note: Note = { startSec, durationSec, frequencyHz: 0, wave: "noise", gain, filter };
  return note;
}

function melody(at: AtSeconds, spec: MelodySpec): Score {
  const lastIndex = spec.timesMs.length - 1;
  const notes = spec.timesMs.map((ms, index): Note => ({
    startSec: at(ms),
    durationSec: index === lastIndex ? spec.lastDurationSec : spec.durationSec,
    frequencyHz: midiFrequency(spec.midiNotes[index] ?? 0),
    wave: "pulse25",
    gain: spec.gain,
  }));
  return notes;
}

function powerOn(at: AtSeconds): Score {
  const score: Score = [
    { startSec: at(0), durationSec: 0.22, frequencyHz: 220, slideToHz: 1320, wave: "pulse12", gain: 0.05 },
    hiss(at(0), 0.16, 0.12, { type: "highpass", cutoffHz: 3000 }),
  ];
  return score;
}

function landings(at: AtSeconds): Score {
  const score = LANDINGS_MS.flatMap((ms, index): Score => {
    const volume = LANDING_VOLUMES[index] ?? 0;
    return [
      { startSec: at(ms), durationSec: 0.14, frequencyHz: 170, slideToHz: 50, wave: "triangle", gain: 0.55 * volume },
      hiss(at(ms), 0.05, 0.15 * volume, { type: "lowpass", cutoffHz: LANDING_DUST_NOISE_HZ }),
    ];
  });
  return score;
}

function click(at: AtSeconds, ms: number): Score {
  const score: Score = [
    { startSec: at(ms), durationSec: 0.025, frequencyHz: 1800, wave: "pulse25", gain: 0.05 },
    hiss(at(ms), 0.015, 0.06, { type: "highpass", cutoffHz: 5000 }),
  ];
  return score;
}

function jNote(at: AtSeconds): Score {
  const arpeggio = melody(at, {
    timesMs: ARPEGGIO_OFFSETS_MS.map((offset) => J_PART.start + offset),
    midiNotes: [60, 64, 67, 72],
    durationSec: 0.08,
    lastDurationSec: 0.12,
    gain: 0.1,
  });
  const score = [...click(at, J_PART.start), ...arpeggio];
  return score;
}

function gNote(at: AtSeconds): Score {
  const arpeggio = melody(at, {
    timesMs: ARPEGGIO_OFFSETS_MS.map((offset) => G_PART.start + offset),
    midiNotes: [65, 69, 72, 77],
    durationSec: 0.08,
    lastDurationSec: 0.12,
    gain: 0.1,
  });
  const score = [...click(at, G_PART.start), ...arpeggio];
  return score;
}

function cableTicks(at: AtSeconds): Score {
  const score = Array.from({ length: CABLE_TICKS }, (_, index): Score => {
    const ms = CABLE_SWEEP.start + index * CABLE_TICK_SPACING_MS;
    return [
      hiss(at(ms), 0.012, 0.05, { type: "highpass", cutoffHz: 6000 }),
      { startSec: at(ms), durationSec: 0.02, frequencyHz: 900 + index * 150, wave: "pulse12", gain: 0.03 },
    ];
  }).flat();
  return score;
}

function charge(at: AtSeconds): Score {
  const score: Score = [
    { startSec: at(PULSE_SWEEP.start), durationSec: 0.28, frequencyHz: 330, slideToHz: 1320, wave: "pulse12", gain: 0.05 },
    { startSec: at(PULSE_SWEEP.end), durationSec: 0.25, frequencyHz: midiFrequency(91), wave: "triangle", gain: 0.1 },
  ];
  return score;
}

function nameRun(at: AtSeconds): Score {
  const first = melody(at, {
    timesMs: FIRST_WORD_TIMES_MS,
    midiNotes: [67, 72, 74, 76, 79, 84],
    durationSec: 0.07,
    lastDurationSec: 0.07,
    gain: DEFAULT_MELODY_GAIN,
  });
  const second = melody(at, {
    timesMs: SECOND_WORD_TIMES_MS,
    midiNotes: [79, 81, 84, 86, 88],
    durationSec: 0.07,
    lastDurationSec: 0.6,
    gain: DEFAULT_MELODY_GAIN,
  });
  return [...first, ...second];
}

function bassAndHarmony(at: AtSeconds): Score {
  const lastSecondWordMs = SECOND_WORD_TIMES_MS[SECOND_WORD_TIMES_MS.length - 1] ?? 0;
  const score: Score = [
    { startSec: at(FIRST_WORD_TIMES_MS[0]), durationSec: 0.9, frequencyHz: midiFrequency(48), wave: "triangle", gain: 0.3 },
    { startSec: at(lastSecondWordMs), durationSec: 0.6, frequencyHz: midiFrequency(84), wave: "pulse12", gain: 0.06 },
  ];
  return score;
}

function startPress(at: AtSeconds): Score {
  const score = [
    ...click(at, START_PRESS_MS),
    ...charge(at),
    ...nameRun(at),
    ...bassAndHarmony(at),
  ];
  return score;
}

function sparkle(at: AtSeconds): Score {
  const sparkleMs = SHINE_SWEEP.start + SHINE_SOUND_OFFSET_MS;
  const score: Score = [
    { startSec: at(sparkleMs), durationSec: 0.05, frequencyHz: midiFrequency(96), wave: "triangle", gain: 0.07 },
    { startSec: at(sparkleMs + 60), durationSec: 0.12, frequencyHz: midiFrequency(103), wave: "triangle", gain: 0.06 },
  ];
  return score;
}

const SCORE_BUILDERS: Readonly<Record<StudioSoundName, (at: AtSeconds) => Score>> = {
  studio_ligar: powerOn,
  studio_quiques: landings,
  studio_j: jNote,
  studio_g: gNote,
  studio_fio: cableTicks,
  studio_start: startPress,
  studio_brilho: sparkle,
};

/** Partitura da deixa, com o tempo contado a partir do instante em que ela dispara. */
export function studioScore(name: StudioSoundName): Score {
  const cueMs = CUE_MS[name];
  const at: AtSeconds = (ms) => (ms - cueMs) / MS_PER_SECOND;
  const score = SCORE_BUILDERS[name](at);
  return score;
}
