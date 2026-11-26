import { MouthStyle, visemeAt, visemeWeights } from "./lipsync";
import type { Weights } from "./emotions";

const DEFAULT_CHARS_PER_MS = 0.0125; // ~12 chars/s at the default speech rate
const MIN_CHARS_PER_MS = 0.005;
const MAX_CHARS_PER_MS = 0.03;

/**
 * Follows one spoken utterance and tells where the voice is in the text.
 * Word-boundary events re-anchor the position; between them it is extrapolated
 * with the speaking rate measured so far, so it also works for voices that
 * never emit boundaries.
 */
export class SpeechTrack {
  private anchorChar = 0;
  private anchorTime = 0;
  private charsPerMs = DEFAULT_CHARS_PER_MS;
  private started = false;
  private finished = false;

  constructor(
    readonly text: string,
    private readonly now: () => number = () => performance.now()
  ) {}

  start() {
    this.started = true;
    this.anchorChar = 0;
    this.anchorTime = this.now();
  }

  boundary(charIndex: number) {
    if (!this.started) this.start();
    const t = this.now();
    const chars = charIndex - this.anchorChar;
    const ms = t - this.anchorTime;
    if (chars > 0 && ms > 0) {
      const measured = chars / ms;
      const blended = (this.charsPerMs + measured) / 2;
      this.charsPerMs = Math.min(MAX_CHARS_PER_MS, Math.max(MIN_CHARS_PER_MS, blended));
    }
    this.anchorChar = charIndex;
    this.anchorTime = t;
  }

  finish() {
    this.finished = true;
  }

  get isActive() {
    return this.started && !this.finished;
  }

  charIndexAt(t: number) {
    const index = this.anchorChar + (t - this.anchorTime) * this.charsPerMs;
    return Math.min(this.text.length, Math.max(0, Math.floor(index)));
  }

  /** Mouth shape for time `t`, or null when nothing is being said. */
  mouthAt(t: number, style: MouthStyle = "arkit"): Weights | null {
    if (!this.isActive) return null;
    return visemeWeights(visemeAt(this.text, this.charIndexAt(t)), style);
  }
}
