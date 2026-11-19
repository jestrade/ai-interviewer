import { Mesh, Object3D } from "three";
import type { Weights } from "./emotions";

const SMOOTHING = 16; // higher = snappier

/**
 * Weights are named with the `_L`/`_R` suffix; models may use `Left`/`Right`
 * (ARKit/Ready Player Me). Returns the name the model actually has.
 */
const aliases = (name: string) => [name, name.replace(/_L$/, "Left").replace(/_R$/, "Right")];

/** Drives every morph target (blendshape) found in a loaded model, with smoothing. */
export class FaceRig {
  private readonly meshes: Mesh[] = [];
  private readonly current: Weights = {};

  constructor(root: Object3D) {
    root.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        this.meshes.push(mesh);
      }
    });
  }

  /** True when the model ships dedicated viseme shapes (`viseme_aa`, ...). */
  get hasVisemes() {
    return this.meshes.some((mesh) => mesh.morphTargetDictionary?.viseme_aa !== undefined);
  }

  get morphTargetCount() {
    return this.meshes.reduce((sum, mesh) => sum + Object.keys(mesh.morphTargetDictionary ?? {}).length, 0);
  }

  apply(target: Weights, deltaSeconds: number) {
    const k = 1 - Math.exp(-deltaSeconds * SMOOTHING);
    const names = new Set([...Object.keys(this.current), ...Object.keys(target)]);

    for (const name of names) {
      const goal = target[name] ?? 0;
      const next = (this.current[name] ?? 0) + (goal - (this.current[name] ?? 0)) * k;
      if (goal === 0 && next < 0.001) delete this.current[name];
      else this.current[name] = next;
      this.setInfluence(name, goal === 0 && next < 0.001 ? 0 : next);
    }
  }

  private setInfluence(name: string, value: number) {
    for (const mesh of this.meshes) {
      const dictionary = mesh.morphTargetDictionary;
      const match = dictionary && aliases(name).find((alias) => dictionary[alias] !== undefined);
      if (dictionary && match && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[dictionary[match]] = value;
      }
    }
  }
}
