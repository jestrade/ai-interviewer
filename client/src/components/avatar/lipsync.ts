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
