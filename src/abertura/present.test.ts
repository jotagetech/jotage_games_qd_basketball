import { describe, expect, it } from "vitest";

import { scanlineHeight, startPromptVisible } from "./present";

describe("piscada da tela de toque", () => {
  it("fica visível nos meios segundos pares e apagada nos ímpares", () => {
    expect(startPromptVisible(0)).toBe(true);
    expect(startPromptVisible(499)).toBe(true);
    expect(startPromptVisible(500)).toBe(false);
    expect(startPromptVisible(999)).toBe(false);
    expect(startPromptVisible(1000)).toBe(true);
    expect(startPromptVisible(3250)).toBe(true);
    expect(startPromptVisible(3750)).toBe(false);
  });
});

describe("linhas de varredura", () => {
  it("só aparecem quando cada pixel da arte ocupa 3 ou mais pixels do dispositivo", () => {
    expect(scanlineHeight(2.99)).toBe(0);
    expect(scanlineHeight(3)).toBe(1);
  });

  it("crescem com o pixel da arte, a um quarto dele", () => {
    expect(scanlineHeight(4)).toBe(1);
    expect(scanlineHeight(8)).toBe(2);
    expect(scanlineHeight(10)).toBe(2);
    expect(scanlineHeight(12)).toBe(3);
  });
});
