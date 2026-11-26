import type { Weights } from "./emotions";
import type { MouthStyle } from "./lipsync";

/** Head angles in radians, added on top of the pose the face driver creates itself. */
export interface HeadPose {
  yaw: number;
  pitch: number;
}

/**
 * How a loaded model shows a face. The avatar scene only talks to this
 * interface; the model decides how: blendshapes plus a head bone, or a shader
 * that bends a plain mesh (Strategy).
 */
export interface FaceDriver {
  /** Which mouth shapes the model can show. */
  readonly mouthStyle: MouthStyle;
  apply(target: Weights, deltaSeconds: number, head: HeadPose): void;
}
