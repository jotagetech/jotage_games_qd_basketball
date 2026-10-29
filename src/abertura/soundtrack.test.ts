import { describe, expect, it } from "vitest";

import { synthesize } from "./chiptune";
import { STUDIO_SOUND_NAMES } from "./cues";
import { STUDIO_CUES, studioScore } from "./soundtrack";
import {
  CABLE_SWEEP,
  FIRST_WORD_TIMES_MS,
  G_PART,
  J_PART,
  LANDINGS_MS,
  PULSE_SWEEP,
  SHINE_SWEEP,
  START_PRESS_MS,
  STUDIO_DURATION_MS,
} from "./timing";

const SAMPLE_RATE = 8000;
const SHINE_SOUND_MS = 3270;

function atMsOf(name: string): number | undefined {
  const cue = STUDIO_CUES.find((candidate) => candidate.name === name);
  return cue?.atMs;
}

describe("deixas da vinheta", () => {
  it.each(STUDIO_SOUND_NAMES)("%s sintetiza algo audível e limitado", (name) => {
    const samples = synthesize(studioScore(name), SAMPLE_RATE);

    expect(samples.length).toBeGreaterThan(0);
    expect(samples.some((sample) => Math.abs(sample) > 0.01)).toBe(true);
    expect(samples.every((sample) => sample >= -1 && sample <= 1)).toBe(true);
  });

  it("há uma deixa para cada nome, em ordem crescente de tempo", () => {
    const names = STUDIO_CUES.map((cue) => cue.name);
    const times = STUDIO_CUES.map((cue) => cue.atMs);

    expect(names).toEqual([...STUDIO_SOUND_NAMES]);
    expect(times).toEqual([...times].sort((first, second) => first - second));
  });

  it("os tempos das deixas batem com os da arte", () => {
    expect(atMsOf("studio_ligar")).toBe(0);
    expect(atMsOf("studio_quiques")).toBe(LANDINGS_MS[0]);
    expect(atMsOf("studio_j")).toBe(J_PART.start);
    expect(atMsOf("studio_g")).toBe(G_PART.start);
    expect(atMsOf("studio_fio")).toBe(CABLE_SWEEP.start);
    expect(atMsOf("studio_start")).toBe(START_PRESS_MS);
    expect(atMsOf("studio_brilho")).toBe(SHINE_SOUND_MS);
    expect(SHINE_SOUND_MS).toBeGreaterThan(SHINE_SWEEP.start);
  });

  it("toda deixa dispara antes do fim da vinheta", () => {
    for (const cue of STUDIO_CUES) {
      expect(cue.atMs).toBeLessThan(STUDIO_DURATION_MS);
    }
  });

  it("as quedas do controle ficam dentro da deixa dos quiques, nos instantes da arte", () => {
    const starts = studioScore("studio_quiques")
      .filter((note) => note.wave === "triangle")
      .map((note) => Math.round(note.startSec * 1000 + LANDINGS_MS[0]));

    expect(starts).toEqual([...LANDINGS_MS]);
  });

  it("na deixa do Start o ding cai no fim do pulso e o baixo na primeira letra do nome", () => {
    const notes = studioScore("studio_start");
    const absoluteMs = (startSec: number): number => Math.round(startSec * 1000 + START_PRESS_MS);

    const triangleStarts = notes.filter((note) => note.wave === "triangle").map((note) => absoluteMs(note.startSec));

    expect(triangleStarts).toContain(PULSE_SWEEP.end);
    expect(triangleStarts).toContain(FIRST_WORD_TIMES_MS[0]);
  });

  it("nenhuma nota começa antes do disparo da deixa", () => {
    for (const name of STUDIO_SOUND_NAMES) {
      for (const note of studioScore(name)) {
        expect(note.startSec).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
