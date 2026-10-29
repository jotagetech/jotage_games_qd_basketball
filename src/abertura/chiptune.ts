export type Waveform = "pulse25" | "pulse12" | "triangle" | "noise";

export interface NoiseFilter {
  readonly type: "highpass" | "lowpass";
  readonly cutoffHz: number;
}

export interface Note {
  readonly startSec: number;
  readonly durationSec: number;
  readonly frequencyHz: number;
  readonly slideToHz?: number;
  readonly wave: Waveform;
  readonly gain: number;
  readonly filter?: NoiseFilter;
}

export type Score = readonly Note[];

type PeriodicWave = Exclude<Waveform, "noise">;

const PULSE_DUTY: Readonly<Record<"pulse25" | "pulse12", number>> = {
  pulse25: 0.25,
  pulse12: 0.125,
};

const ENVELOPE_FLOOR = 0.0001;
const ATTACK_SEC = 0.006;
const NOISE_HOLD_SAMPLES = 2;
const NOISE_REGISTER_SEED = 1;
const NOISE_REGISTER_TOP_BIT = 14;

function pulseSample(phase: number, duty: number): number {
  const sample = phase < duty ? 1 : -1;
  return sample;
}

function triangleSample(phase: number): number {
  const sample = 4 * Math.abs(phase - 0.5) - 1;
  return sample;
}

/** Ruído de registrador de 15 bits, como o canal de ruído dos consoles de 8 bits: o mesmo timbre a cada execução. */
function createNoiseSource(): () => number {
  let register = NOISE_REGISTER_SEED;
  let value = 1;
  let counter = 0;
  const next = (): number => {
    if (counter % NOISE_HOLD_SAMPLES === 0) {
      const feedback = (register ^ (register >> 1)) & 1;
      register = (register >> 1) | (feedback << NOISE_REGISTER_TOP_BIT);
      value = register & 1 ? 1 : -1;
    }
    counter += 1;
    return value;
  };
  return next;
}

function exponentialBetween(from: number, to: number, progress: number): number {
  const value = from * (to / from) ** progress;
  return value;
}

function toneEnvelope(gain: number, elapsedSec: number, durationSec: number): number {
  const attackSec = Math.min(ATTACK_SEC, durationSec);
  if (elapsedSec < attackSec) {
    return exponentialBetween(ENVELOPE_FLOOR, gain, elapsedSec / attackSec);
  }
  const decayProgress = (elapsedSec - attackSec) / (durationSec - attackSec);
  return exponentialBetween(gain, ENVELOPE_FLOOR, decayProgress);
}

function noiseEnvelope(gain: number, elapsedSec: number, durationSec: number): number {
  const envelope = exponentialBetween(gain, ENVELOPE_FLOOR, elapsedSec / durationSec);
  return envelope;
}

function onePoleCoefficient(cutoffHz: number, sampleRate: number): number {
  const coefficient = 1 - Math.exp((-2 * Math.PI * cutoffHz) / sampleRate);
  return coefficient;
}

function createFilter(filter: NoiseFilter | undefined, sampleRate: number): (input: number) => number {
  if (!filter) {
    return (input) => input;
  }
  const coefficient = onePoleCoefficient(filter.cutoffHz, sampleRate);
  let lowPassed = 0;
  return (input) => {
    lowPassed += coefficient * (input - lowPassed);
    const output = filter.type === "lowpass" ? lowPassed : input - lowPassed;
    return output;
  };
}

function periodicSample(wave: PeriodicWave, phase: number): number {
  const sample = wave === "triangle" ? triangleSample(phase) : pulseSample(phase, PULSE_DUTY[wave]);
  return sample;
}

function createOscillator(note: Note, sampleRate: number): (progress: number) => number {
  const { wave } = note;
  if (wave === "noise") {
    const noise = createNoiseSource();
    const filter = createFilter(note.filter, sampleRate);
    return () => filter(noise());
  }
  const slideToHz = note.slideToHz ?? note.frequencyHz;
  let phase = 0;
  return (progress) => {
    const frequencyHz = exponentialBetween(note.frequencyHz, slideToHz, progress);
    const sample = periodicSample(wave, phase);
    phase += frequencyHz / sampleRate;
    phase -= Math.floor(phase);
    return sample;
  };
}

function noteSample(note: Note, elapsedSec: number): number {
  const envelope =
    note.wave === "noise"
      ? noiseEnvelope(note.gain, elapsedSec, note.durationSec)
      : toneEnvelope(note.gain, elapsedSec, note.durationSec);
  return envelope;
}

function mixNote(note: Note, sampleRate: number, mix: Float32Array): void {
  const firstSample = Math.round(note.startSec * sampleRate);
  const endSample = Math.min(mix.length, Math.round((note.startSec + note.durationSec) * sampleRate));
  const oscillator = createOscillator(note, sampleRate);
  for (let index = firstSample; index < endSample; index += 1) {
    const elapsedSec = (index - firstSample) / sampleRate;
    const progress = elapsedSec / note.durationSec;
    const current = mix[index] ?? 0;
    mix[index] = current + oscillator(progress) * noteSample(note, elapsedSec);
  }
}

function scoreLength(score: Score, sampleRate: number): number {
  let length = 0;
  for (const note of score) {
    length = Math.max(length, Math.round((note.startSec + note.durationSec) * sampleRate));
  }
  return length;
}

function clampToUnit(mix: Float32Array): void {
  for (let index = 0; index < mix.length; index += 1) {
    mix[index] = Math.max(-1, Math.min(1, mix[index] ?? 0));
  }
}

/** Transforma a partitura em amostras mono entre -1 e 1; o resultado só depende da partitura e da taxa. */
export function synthesize(score: Score, sampleRate: number): Float32Array<ArrayBuffer> {
  const mix = new Float32Array(scoreLength(score, sampleRate));
  for (const note of score) {
    mixNote(note, sampleRate, mix);
  }
  clampToUnit(mix);
  return mix;
}
