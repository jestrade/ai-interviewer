import { Euler, Material, Matrix3, Matrix4, Mesh, Object3D, Vector3, Vector4, type WebGLProgramParametersWithUniforms } from "three";
import type { Weights } from "./emotions";
import type { FaceDriver, HeadPose } from "./face-driver";
import type { MouthStyle } from "./lipsync";
import { rigidControls } from "./rigid-controls";

const SMOOTHING = 18; // higher = snappier

/**
 * Where the face is, in the mesh's own coordinates (metres; the model faces +X,
 * Y is up and Z runs between the ears). Measured on `interviewer.glb`: change
 * these when the model changes.
 */
export const FACE = {
  /** Centre line of the face on the Z axis. */
  centerZ: 0.0045,
  mouthY: 0.3608,
  mouthHalfWidth: 0.0135,
  eyeY: 0.3993,
  eyeHalfSpacing: 0.0206,
  /** Where the head turns: the base of the neck. */
  neck: [0.0, 0.31, 0.0045] as const,
  /** Vertices above `neckLow` follow the head fully from `neckHigh` up. */
  neckLow: 0.322,
  neckHigh: 0.358,
};

const VERTEX_HEADER = /* glsl */ `
uniform float uJaw;
uniform float uNarrow;
uniform float uSmile;
uniform float uBlink;
uniform mat3 uHeadRot;
uniform vec3 uHeadPivot;
uniform vec4 uMouth;  // centerZ, mouthY, halfWidth, unused
uniform vec4 uEyes;   // eyeY, halfSpacing, neckLow, neckHigh
varying float vCavity;

float band(float x, float a, float b) { return smoothstep(a, b, x); }

// Lets the top of a vertical stack of vertices squash down onto its bottom.
float lidY(float y, float eyeY, float k) {
  float y0 = eyeY - 0.0042;
  float yt = eyeY + 0.0065;
  if (y <= y0) return y;
  if (y <= yt) return y0 + (y - y0) * (1.0 - k);
  return y - k * (yt - y0) * (1.0 - band(y, yt, yt + 0.007));
}
`;

const BEGIN_VERTEX = /* glsl */ `
vec3 transformed = vec3(position);
float headW = band(position.y, uEyes.z, uEyes.w);
vCavity = 0.0;
{
  float cz = uMouth.x;
  float my = uMouth.y;
  float hw = uMouth.z;
  float dz = abs(position.z - cz);
  float front = band(position.x, 0.045, 0.07);

  // Jaw: the lower lip and chin drop and swing back; the upper lip stays.
  float wy = band(-(position.y - my), -0.0008, 0.0016) * (1.0 - band(-(position.y - my), 0.017, 0.034));
  float wz = 1.0 - band(dz, 0.032, 0.056);
  float wJaw = wy * wz * front;
  transformed.y -= uJaw * 0.0085 * wJaw;
  transformed.x -= uJaw * 0.0035 * wJaw;
  float mouthMask = 1.0 - band(dz, hw * 0.55, hw * 1.05);
  vCavity = uJaw * band(wJaw, 0.03, 0.2) * (1.0 - band(wJaw, 0.85, 1.0)) * mouthMask * front;

  // Rounded vowels draw the corners in; a smile lifts them.
  float lips = (1.0 - band(dz, hw * 1.1, hw * 2.2)) * (1.0 - band(abs(position.y - my), 0.011, 0.02)) * front;
  transformed.z = cz + (transformed.z - cz) * (1.0 - 0.28 * uNarrow * lips);
  float corner = band(dz, hw * 0.45, hw * 1.0) * (1.0 - band(dz, hw * 1.0, hw * 1.9))
               * (1.0 - band(abs(position.y - my), 0.0, 0.013)) * front;
  transformed.y += uSmile * 0.0035 * corner;

  // Blink: squash each eye vertically so the lids meet.
  float ez = min(abs(position.z - cz - uEyes.y), abs(position.z - cz + uEyes.y));
  float eyeMask = (1.0 - band(ez, 0.0105, 0.0165)) * front;
  transformed.y = mix(transformed.y, lidY(transformed.y, uEyes.x, 0.92 * uBlink), eyeMask);
}
// The head turns on the neck; hair and collar below the neck stay put.
transformed = mix(transformed, uHeadPivot + uHeadRot * (transformed - uHeadPivot), headW);
`;

const BEGIN_NORMAL = /* glsl */ `
vec3 objectNormal = vec3(normal);
objectNormal = mix(objectNormal, uHeadRot * objectNormal, band(position.y, uEyes.z, uEyes.w));
#ifdef USE_TANGENT
  vec3 objectTangent = vec3(tangent.xyz);
#endif
`;

const FRAGMENT_HEADER = /* glsl */ `
varying float vCavity;
`;

const MAP_FRAGMENT = /* glsl */ `
#include <map_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.05, 0.009, 0.012), clamp(vCavity * 1.8, 0.0, 0.96));
`;

/** Wraps a mesh material so its vertex shader can bend the face. Returns the uniforms. */
const patchMaterial = (material: Material) => {
  const uniforms = {
    uJaw: { value: 0 },
    uNarrow: { value: 0 },
    uSmile: { value: 0 },
    uBlink: { value: 0 },
    uHeadRot: { value: new Matrix3() },
    uHeadPivot: { value: new Vector3(...FACE.neck) },
    uMouth: { value: new Vector4(FACE.centerZ, FACE.mouthY, FACE.mouthHalfWidth, 0) },
    uEyes: { value: new Vector4(FACE.eyeY, FACE.eyeHalfSpacing, FACE.neckLow, FACE.neckHigh) },
  };
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERTEX_HEADER}`)
      .replace("#include <beginnormal_vertex>", BEGIN_NORMAL)
      .replace("#include <begin_vertex>", BEGIN_VERTEX);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAGMENT_HEADER}`)
      .replace("#include <map_fragment>", MAP_FRAGMENT);
  };
  material.customProgramCacheKey = () => "rigid-face-rig";
  material.needsUpdate = true;
  return uniforms;
};

/**
 * Brings a mesh without skeleton or blendshapes to life: the vertex shader
 * drops the jaw, closes the lids, shapes the lips and turns the head. The
 * ARKit-style weights from the rest of the avatar code are reduced to those few
 * controls by `rigidControls`.
 */
export class RigidFaceRig implements FaceDriver {
  readonly mouthStyle: MouthStyle = "arkit";
  private readonly uniforms: ReturnType<typeof patchMaterial>[] = [];
  private readonly current = { jaw: 0, narrow: 0, smile: 0, blink: 0, headRoll: 0, headPitch: 0 };
  private readonly euler = new Euler(0, 0, 0, "YZX");
  private readonly matrix = new Matrix4();

  constructor(root: Object3D) {
    const seen = new Set<Material>();
    root.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        if (seen.has(material)) continue;
        seen.add(material);
        this.uniforms.push(patchMaterial(material));
      }
    });
  }

  apply(target: Weights, deltaSeconds: number, head: HeadPose) {
    const goal = rigidControls(target);
    const k = 1 - Math.exp(-deltaSeconds * SMOOTHING);
    const c = this.current;
    // Blinks are quick and must not be smoothed away.
    const blinkK = Math.min(1, k * 2.5);
    c.jaw += (goal.jaw - c.jaw) * k;
    c.narrow += (goal.narrow - c.narrow) * k;
    c.smile += (goal.smile - c.smile) * k;
    c.blink += (goal.blink - c.blink) * blinkK;
    c.headRoll += (goal.headRoll - c.headRoll) * k * 0.35;
    c.headPitch += (goal.headPitch - c.headPitch) * k * 0.35;

    // Mesh axes: X forward, Y up, Z sideways. Pitch nods about Z, roll about X.
    this.euler.set(c.headRoll, head.yaw, -(head.pitch + c.headPitch));
    this.matrix.makeRotationFromEuler(this.euler);
    for (const u of this.uniforms) {
      u.uJaw.value = c.jaw;
      u.uNarrow.value = c.narrow;
      u.uSmile.value = c.smile;
      u.uBlink.value = c.blink;
      u.uHeadRot.value.setFromMatrix4(this.matrix);
    }
  }
}
