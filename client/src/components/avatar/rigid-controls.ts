import type { Weights } from "./emotions";

/**
 * Controls for a model that has no skeleton and no blendshapes. They are the
 * few things the vertex shader can do to a plain mesh, all in the range 0..1
 * except the head angles (radians).
 */
export interface RigidControls {
  /** Mouth opening: the lower lip and chin drop, a dark cavity shows. */
  jaw: number;
  /** Lips drawn together (rounded vowels: "o", "u"). */
  narrow: number;
  /** Mouth corners lifted. */
  smile: number;
  /** Eyelids closed. */
  blink: number;
  /** Lids narrowed (smiling eyes, a hard look), 0..1. */
  squint: number;
  /** Brows: inner and outer ends raised, and pulled down, each 0..1. */
  browInner: number;
  browOuter: number;
  browDown: number;
  /** Extra head angles that carry the expression (radians). */
  headRoll: number;
  headPitch: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mean = (a = 0, b = 0) => (a + b) / 2;

/**
 * Reduces the ARKit-style weights used by the rest of the avatar code to the
 * controls a rigid mesh can show. Expressions that need a face rig become small
 * head poses: a tilt for curiosity, a lowered chin for a serious look.
 */
export const rigidControls = (w: Weights): RigidControls => ({
  jaw: clamp01((w.jawOpen ?? 0) * (1 - 0.85 * clamp01(w.mouthClose ?? 0))),
  narrow: clamp01(Math.max(w.mouthFunnel ?? 0, w.mouthPucker ?? 0)),
  smile: clamp01(mean(w.mouthSmile_L, w.mouthSmile_R)),
  blink: clamp01(mean(w.eyeBlink_L, w.eyeBlink_R)),
  squint: clamp01(mean(w.cheekSquint_L, w.cheekSquint_R) * 1.2 + mean(w.browDown_L, w.browDown_R) * 0.5 - mean(w.eyeWide_L, w.eyeWide_R)),
  browInner: clamp01(w.browInnerUp ?? 0),
  browOuter: clamp01(mean(w.browOuterUp_L, w.browOuterUp_R) * 1.4),
  browDown: clamp01(mean(w.browDown_L, w.browDown_R) * 1.6),
  headRoll: ((w.browOuterUp_L ?? 0) - (w.browOuterUp_R ?? 0)) * 0.7, // curious: tilt
  headPitch:
    mean(w.browDown_L, w.browDown_R) * 0.16 - // serious: chin down
    mean(w.eyeLookUp_L, w.eyeLookUp_R) * 0.5 - // thoughtful: look up
    (w.browInnerUp ?? 0) * 0.04, // curious/encouraging: chin slightly up
});
