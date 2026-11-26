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
  headRoll: ((w.browOuterUp_L ?? 0) - (w.browOuterUp_R ?? 0)) * 0.3,
  headPitch:
    mean(w.browDown_L, w.browDown_R) * 0.07 - // serious: chin down
    mean(w.eyeLookUp_L, w.eyeLookUp_R) * 0.25 - // thoughtful: look up
    (w.browInnerUp ?? 0) * 0.02, // curious/encouraging: chin slightly up
});
