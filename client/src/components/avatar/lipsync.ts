import type { Weights } from "./emotions";

const CLOSED: Weights = {};

const VOWELS: Record<string, Weights> = {
  a: { jawOpen: 0.7, mouthLowerDown_L: 0.3, mouthLowerDown_R: 0.3 },
  e: { jawOpen: 0.35, mouthStretch_L: 0.35, mouthStretch_R: 0.35 },
  i: { jawOpen: 0.2, mouthSmile_L: 0.3, mouthSmile_R: 0.3, mouthStretch_L: 0.25, mouthStretch_R: 0.25 },
  o: { jawOpen: 0.4, mouthFunnel: 0.7 },
  u: { jawOpen: 0.15, mouthPucker: 0.75 },
};

const LIPS_TOGETHER: Weights = { mouthClose: 0.7, mouthPress_L: 0.3, mouthPress_R: 0.3 };
const LABIODENTAL: Weights = { mouthRollLower: 0.5, mouthUpperUp_L: 0.25, mouthUpperUp_R: 0.25, jawOpen: 0.1 };
const CONSONANT: Weights = { jawOpen: 0.14 };

/** Maps one character of English text to a mouth shape (a coarse viseme). */
export const visemeForChar = (char: string | undefined): Weights => {
  if (!char) return CLOSED;
  const c = char.toLowerCase();
  if (VOWELS[c]) return VOWELS[c];
  if ("bpm".includes(c)) return LIPS_TOGETHER;
  if ("fv".includes(c)) return LABIODENTAL;
  if ("wq".includes(c)) return VOWELS.u;
  if (/[a-z]/.test(c)) return CONSONANT;
  return CLOSED; // spaces and punctuation
};
