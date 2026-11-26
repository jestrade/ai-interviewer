import type { Weights } from "./emotions";

export interface IdleFrame {
  /** 0 (open) to 1 (closed). */
  blink: number;
  gaze: Weights;
  headYaw: number;
  headPitch: number;
}

const BLINK_DURATION = 0.16;

/**
 * Small involuntary movements that make the face look alive: blinking, eye
 * wandering and a slight head sway (with a gentle nod while speaking).
 */
export class IdleBehavior {
  private nextBlinkAt = 1.5;
  private blinkStartedAt = -1;
  private nextGazeAt = 2;
  private gaze: Weights = {};

  constructor(private readonly random: () => number = Math.random) {}

  update(time: number, speaking: boolean): IdleFrame {
    if (this.blinkStartedAt < 0 && time >= this.nextBlinkAt) {
      this.blinkStartedAt = time;
      this.nextBlinkAt = time + 2 + this.random() * 3;
    }
    let blink = 0;
    if (this.blinkStartedAt >= 0) {
      const progress = (time - this.blinkStartedAt) / BLINK_DURATION;
      if (progress >= 1) this.blinkStartedAt = -1;
      else blink = 1 - Math.abs(progress * 2 - 1); // 0 → 1 → 0
    }

    if (time >= this.nextGazeAt) {
      this.nextGazeAt = time + 1.2 + this.random() * 2.5;
      this.gaze = this.pickGaze();
    }

    const nod = speaking ? Math.sin(time * 4.2) * 0.02 : 0;
    return {
      blink,
      gaze: this.gaze,
      headYaw: Math.sin(time * 0.45) * 0.05,
      headPitch: Math.sin(time * 0.31) * 0.025 + nod,
    };
  }

  private pickGaze(): Weights {
    const side = (this.random() - 0.5) * 0.4;
    const up = (this.random() - 0.5) * 0.3;
    return {
      eyeLookOut_L: Math.max(0, -side),
      eyeLookIn_L: Math.max(0, side),
      eyeLookIn_R: Math.max(0, -side),
      eyeLookOut_R: Math.max(0, side),
      eyeLookUp_L: Math.max(0, up),
      eyeLookUp_R: Math.max(0, up),
      eyeLookDown_L: Math.max(0, -up),
      eyeLookDown_R: Math.max(0, -up),
    };
  }
}
