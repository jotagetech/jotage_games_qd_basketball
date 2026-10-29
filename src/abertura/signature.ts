import { synthesize } from "./chiptune";
import { STUDIO_SOUND_NAMES } from "./cues";
import { studioFrame } from "./frame";
import type { Rect } from "./rect";
import { studioScore } from "./soundtrack";

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const BYTE_MASK = 0xff;
const BITS_PER_BYTE = 8;
const HEX_DIGITS = 8;
const HEX_RADIX = 16;
const INT16_MAX = 32767;

const FRAME_STEP_MS = 10;
const LAST_FRAME_MS = 4000;

interface Hasher {
  addText(text: string): void;
  addInt16(value: number): void;
  digest(): string;
}

/** Hash FNV-1a de 32 bits, só com aritmética de inteiros, igual no navegador e no Node. O texto serializado é só ASCII. */
function createHasher(): Hasher {
  let state = FNV_OFFSET_BASIS;
  const addByte = (value: number): void => {
    state = Math.imul(state ^ (value & BYTE_MASK), FNV_PRIME) >>> 0;
  };
  const addText = (text: string): void => {
    for (let index = 0; index < text.length; index += 1) {
      addByte(text.charCodeAt(index));
    }
  };
  const addInt16 = (value: number): void => {
    addByte(value);
    addByte(value >> BITS_PER_BYTE);
  };
  const digest = (): string => {
    const hex = state.toString(HEX_RADIX).padStart(HEX_DIGITS, "0");
    return hex;
  };
  return { addText, addInt16, digest };
}

function serializeRect(part: Rect): string {
  const text = `${part.x},${part.y},${part.width},${part.height},${part.color}`;
  return text;
}

function serializeFrame(elapsedMs: number): string {
  const rects = studioFrame(elapsedMs).map(serializeRect);
  const text = `F${elapsedMs}:${rects.join(";")}\n`;
  return text;
}

function quantize(sample: number): number {
  const quantized = Math.round(sample * INT16_MAX);
  return quantized;
}

function addFrames(hasher: Hasher): void {
  for (let elapsedMs = 0; elapsedMs <= LAST_FRAME_MS; elapsedMs += FRAME_STEP_MS) {
    hasher.addText(serializeFrame(elapsedMs));
  }
}

function addCues(hasher: Hasher, sampleRate: number): void {
  for (const name of STUDIO_SOUND_NAMES) {
    const samples = synthesize(studioScore(name), sampleRate);
    hasher.addText(`S${name}:${samples.length}\n`);
    for (const sample of samples) {
      hasher.addInt16(quantize(sample));
    }
  }
}

/** Assinatura do que a vinheta desenha e soa: duas cópias com a mesma assinatura se comportam igual. */
export function studioSignature(sampleRate: number): string {
  const hasher = createHasher();
  addFrames(hasher);
  addCues(hasher, sampleRate);
  const signature = hasher.digest();
  return signature;
}
