import { describe, expect, it } from "vitest";

import { studioSignature } from "./signature";

const FIXED_SIGNATURES: readonly (readonly [number, string])[] = [
  [8000, "493a6e56"],
  [44100, "b8301f03"],
  [48000, "3198ada7"],
];

describe("studioSignature", () => {
  it.each(FIXED_SIGNATURES)("a assinatura a %i Hz fica fixa", (sampleRate, expected) => {
    expect(studioSignature(sampleRate)).toBe(expected);
  });

  it("a mesma entrada dá a mesma assinatura", () => {
    expect(studioSignature(8000)).toBe(studioSignature(8000));
  });

  it("taxas diferentes dão assinaturas diferentes", () => {
    expect(studioSignature(8000)).not.toBe(studioSignature(44100));
  });

  it("tem oito dígitos hexadecimais", () => {
    expect(studioSignature(8000)).toMatch(/^[0-9a-f]{8}$/);
  });
});
