import { blendedMouth, charWeight, MouthStyle } from "./lipsync";
import type { Weights } from "./emotions";

// Time is measured in "speech weight" (see charWeight), not characters: a vowel
// takes longer than a consonant and a full stop is a pause, so the position in
// the text follows the voice much more closely than a constant letters-per-second.
const DEFAULT_WEIGHT_PER_MS = 0.02; // ~50 ms per consonant at the default rate
const MIN_WEIGHT_PER_MS = 0.008;
const MAX_WEIGHT_PER_MS = 0.05;

/**
 * Follows one spoken utterance and tells where the voice is in the text.
 * Word-boundary events re-anchor the position; between them it is extrapolated
 * with the speaking rate measured so far, so it also works for voices that
 * never emit boundaries.
 */
export class SpeechTrack {
  /** Speech weight spoken before each character: `before[i]` is the start of char i. */
  private readonly before: number[];
  private anchorChar = 0;
  private anchorTime = 0;
  private weightPerMs = DEFAULT_WEIGHT_PER_MS;
  private started = false;
  private finished = false;

  constructor(
    readonly text: string,
    private readonly now: () => number = () => performance.now()
  ) {
    this.before = [0];
    for (const char of text) this.before.push(this.before[this.before.length - 1] + charWeight(char));
  }

  start() {
    this.started = true;
    this.anchorChar = 0;
    this.anchorTime = this.now();
  }

  boundary(charIndex: number) {
    if (!this.started) this.start();
    const t = this.now();
    const index = Math.min(this.text.length, Math.max(0, charIndex));
    const weight = this.before[index] - this.before[this.anchorChar];
    const ms = t - this.anchorTime;
    if (weight > 0 && ms > 0) {
      const measured = weight / ms;
      const blended = (this.weightPerMs + measured) / 2;
      this.weightPerMs = Math.min(MAX_WEIGHT_PER_MS, Math.max(MIN_WEIGHT_PER_MS, blended));
    }
    this.anchorChar = index;
    this.anchorTime = t;
  }

  finish() {
    this.finished = true;
  }

  get isActive() {
    return this.started && !this.finished;
  }

  /** Fractional character position of the voice at time `t`. */
  positionAt(t: number) {
    const spoken = this.before[this.anchorChar] + Math.max(0, t - this.anchorTime) * this.weightPerMs;
    const end = this.before[this.text.length];
    if (spoken >= end) return this.text.length;
    // Largest character whose start is not after `spoken` (binary search).
    let low = 0;
    let high = this.text.length;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (this.before[mid] <= spoken) low = mid;
      else high = mid - 1;
    }
    const width = this.before[low + 1] - this.before[low];
    return low + (width > 0 ? (spoken - this.before[low]) / width : 0);
  }

  charIndexAt(t: number) {
    return Math.min(this.text.length, Math.floor(this.positionAt(t)));
  }

  /** Mouth shape for time `t`, or null when nothing is being said. */
  mouthAt(t: number, style: MouthStyle = "arkit"): Weights | null {
    if (!this.isActive) return null;
    return blendedMouth(this.text, this.positionAt(t), style);
  }
}
