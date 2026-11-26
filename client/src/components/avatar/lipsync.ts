import type { Weights } from "./emotions";

/** Mouth shapes (Oculus/ARKit viseme set) used to speak English text. */
export type Viseme =
  | "sil" | "PP" | "FF" | "TH" | "DD" | "kk" | "CH" | "SS" | "nn" | "RR"
  | "aa" | "E" | "I" | "O" | "U";

/** `oculus`: the model has `viseme_*` shapes. `arkit`: build mouth shapes from ARKit blendshapes. */
export type MouthStyle = "oculus" | "arkit";

const SINGLE: Record<string, Viseme> = {
  a: "aa", e: "E", i: "I", y: "I", o: "O", u: "U", w: "U",
  b: "PP", p: "PP", m: "PP", f: "FF", v: "FF",
  d: "DD", t: "DD", l: "DD", n: "nn",
  k: "kk", g: "kk", c: "kk", q: "kk", x: "kk",
  s: "SS", z: "SS", j: "CH", r: "RR", h: "E",
};

const DIGRAPHS: Record<string, Viseme> = { th: "TH", sh: "CH", ch: "CH" };

/** The viseme for the character at `index`, looking at the next one for digraphs. */
export const visemeAt = (text: string, index: number): Viseme => {
  const char = text[index]?.toLowerCase();
  if (!char || !/[a-z]/.test(char)) return "sil"; // spaces and punctuation
  const digraph = DIGRAPHS[char + (text[index + 1]?.toLowerCase() ?? "")];
  if (digraph) return digraph;
  return SINGLE[char] ?? "DD";
};

const ARKIT: Record<Viseme, Weights> = {
  sil: {},
  aa: { jawOpen: 0.7, mouthLowerDown_L: 0.3, mouthLowerDown_R: 0.3 },
  E: { jawOpen: 0.35, mouthStretch_L: 0.35, mouthStretch_R: 0.35 },
  I: { jawOpen: 0.2, mouthSmile_L: 0.3, mouthSmile_R: 0.3, mouthStretch_L: 0.25, mouthStretch_R: 0.25 },
  O: { jawOpen: 0.4, mouthFunnel: 0.7 },
  U: { jawOpen: 0.15, mouthPucker: 0.75 },
  PP: { mouthClose: 0.7, mouthPress_L: 0.3, mouthPress_R: 0.3 },
  FF: { mouthRollLower: 0.5, mouthUpperUp_L: 0.25, mouthUpperUp_R: 0.25, jawOpen: 0.1 },
  TH: { jawOpen: 0.15, tongueOut: 0.3 },
  CH: { jawOpen: 0.12, mouthFunnel: 0.35 },
  SS: { jawOpen: 0.08, mouthStretch_L: 0.2, mouthStretch_R: 0.2 },
  DD: { jawOpen: 0.14 },
  kk: { jawOpen: 0.16 },
  nn: { jawOpen: 0.12 },
  RR: { jawOpen: 0.14, mouthPucker: 0.25 },
};

const OCULUS_STRENGTH = 0.85;

export const visemeWeights = (viseme: Viseme, style: MouthStyle): Weights => {
  if (style === "arkit") return ARKIT[viseme];
  return viseme === "sil" ? {} : { [`viseme_${viseme}`]: OCULUS_STRENGTH };
};

const VOWELS = new Set<Viseme>(["aa", "E", "I", "O", "U"]);
const LIPS_TOGETHER = new Set<Viseme>(["PP", "FF"]);

/** How long a character takes to say, relative to a plain consonant (= 1). */
export const charWeight = (char: string): number => {
  if (/[aeiouy]/i.test(char)) return 2.6; // vowels carry the syllable
  if (/[a-z]/i.test(char)) return 1;
  if (char === " ") return 0.7;
  if (/[.!?]/.test(char)) return 9; // sentence pause
  if (/[,;:]/.test(char)) return 5; // short pause
  return 0.5;
};

const KERNEL_RADIUS = 2.2;

/** How much the character at `index` counts for the mouth shape around it. */
const influence = (text: string, index: number): number => {
  const char = text[index];
  if (char === " ") return 0.5; // between words the mouth stays partly open
  if (!/[a-z]/i.test(char)) return 2.5; // punctuation: the mouth rests
  const viseme = visemeAt(text, index);
  if (VOWELS.has(viseme)) return 1.6;
  if (LIPS_TOGETHER.has(viseme)) return 2.2; // must reach closed lips
  return 1;
};

/**
 * Mouth shape at a fractional character `position`. It blends the neighbouring
 * characters (coarticulation): vowels open the jaw, "m/b/p" close the lips,
 * consonants only nudge the shape, and punctuation lets the mouth rest. This
 * is what stops the mouth from flickering through every single letter.
 */
export const blendedMouth = (text: string, position: number, style: MouthStyle): Weights => {
  const total: Weights = {};
  let sum = 0;
  const first = Math.floor(position) - 2;
  for (let index = first; index <= first + 4; index++) {
    if (index < 0 || index >= text.length) continue;
    const distance = Math.abs(index + 0.5 - position);
    const kernel = Math.max(0, 1 - distance / KERNEL_RADIUS);
    if (kernel === 0) continue;
    const k = kernel * influence(text, index);
    sum += k;
    for (const [name, weight] of Object.entries(visemeWeights(visemeAt(text, index), style))) {
      total[name] = (total[name] ?? 0) + weight * k;
    }
  }
  if (sum === 0) return {};
  for (const name of Object.keys(total)) total[name] /= sum;
  return total;
};
