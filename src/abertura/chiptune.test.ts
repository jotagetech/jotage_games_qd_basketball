import { describe, expect, it } from "vitest";

import { synthesize, type Note, type Score, type Waveform } from "./chiptune";

const SAMPLE_RATE = 8000;

function noteOf(wave: Waveform, overrides: Partial<Note> = {}): Note {
  const note: Note = {
    startSec: 0.1,
    durationSec: 0.1,
    frequencyHz: 440,
    wave,
    gain: 0.5,
    ...overrides,
  };
  return note;
}

function energyBetween(samples: Float32Array, fromSec: number, toSec: number): number {
  let energy = 0;
  const first = Math.round(fromSec * SAMPLE_RATE);
  const last = Math.min(samples.length, Math.round(toSec * SAMPLE_RATE));
  for (let index = first; index < last; index += 1) {
    const sample = samples[index] ?? 0;
    energy += sample * sample;
  }
  return energy;
}

const ALL_WAVES: readonly Waveform[] = ["pulse25", "pulse12", "triangle", "noise"];

describe("synthesize", () => {
  it.each(ALL_WAVES)("é determinístico para a onda %s", (wave) => {
    const score: Score = [noteOf(wave, { filter: { type: "highpass", cutoffHz: 2000 } })];

    expect(synthesize(score, SAMPLE_RATE)).toEqual(synthesize(score, SAMPLE_RATE));
  });

  it("devolve amostras até o fim da última nota", () => {
    const score: Score = [noteOf("pulse25"), noteOf("triangle", { startSec: 0.5, durationSec: 0.25 })];

    expect(synthesize(score, SAMPLE_RATE)).toHaveLength(0.75 * SAMPLE_RATE);
  });

  it("mantém todas as amostras entre -1 e 1 mesmo com notas somadas acima do limite", () => {
    const loud = ALL_WAVES.map((wave) => noteOf(wave, { gain: 3, startSec: 0 }));

    const samples = synthesize(loud, SAMPLE_RATE);

    expect(samples.every((sample) => sample >= -1 && sample <= 1)).toBe(true);
    expect(samples.some((sample) => sample === 1 || sample === -1)).toBe(true);
  });

  it("deixa a partitura vazia em silêncio", () => {
    const samples = synthesize([], SAMPLE_RATE);

    expect(samples.every((sample) => sample === 0)).toBe(true);
  });

  it.each(ALL_WAVES)("concentra a energia da onda %s dentro da janela da nota", (wave) => {
    const samples = synthesize([noteOf(wave, { startSec: 0.2, durationSec: 0.1 })], SAMPLE_RATE);

    expect(energyBetween(samples, 0, 0.2)).toBe(0);
    expect(energyBetween(samples, 0.2, 0.3)).toBeGreaterThan(0);
  });

  it("desliza a frequência até o destino", () => {
    const fixed = synthesize([noteOf("triangle")], SAMPLE_RATE);
    const sliding = synthesize([noteOf("triangle", { slideToHz: 1320 })], SAMPLE_RATE);

    expect(sliding).not.toEqual(fixed);
  });

  it("o filtro passa-baixa tira energia do ruído e o passa-alta também", () => {
    const raw = synthesize([noteOf("noise", { gain: 1 })], SAMPLE_RATE);
    const low = synthesize([noteOf("noise", { gain: 1, filter: { type: "lowpass", cutoffHz: 300 } })], SAMPLE_RATE);
    const high = synthesize([noteOf("noise", { gain: 1, filter: { type: "highpass", cutoffHz: 3000 } })], SAMPLE_RATE);

    expect(energyBetween(low, 0, 1)).toBeLessThan(energyBetween(raw, 0, 1));
    expect(energyBetween(high, 0, 1)).toBeLessThan(energyBetween(raw, 0, 1));
  });
});
