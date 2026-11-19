import { Mesh, Object3D } from "three";
import type { Weights } from "./emotions";

const SMOOTHING = 16; // higher = snappier

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
      const index = mesh.morphTargetDictionary?.[name];
      if (index !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[index] = value;
      }
    }
  }
}
