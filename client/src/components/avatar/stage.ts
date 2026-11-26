import {
  AdditiveBlending,
  ACESFilmicToneMapping,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  HalfFloatType,
  LinearFilter,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Points,
  PointsMaterial,
  PointLight,
  Scene,
  ShaderMaterial,
  SpotLight,
  Texture,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
  DirectionalLight,
  CanvasTexture,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { buildRoom } from "./room";

/** Vignette, film grain, a touch of chromatic aberration and lifted shadows (as in the reference game). */
const FilmShader = {
  uniforms: {
    tDiffuse: { value: null as Texture | null },
    uTime: { value: 0 },
    uVignette: { value: 0.34 },
    uGrain: { value: 0.022 },
    uAberration: { value: 0.0011 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uVignette, uGrain, uAberration;
    varying vec2 vUv;
    float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c) * 4.0;
      vec2 shift = c * uAberration * (0.4 + r2);
      vec3 col = vec3(
        texture2D(tDiffuse, vUv + shift).r,
        texture2D(tDiffuse, vUv).g,
        texture2D(tDiffuse, vUv - shift).b);
      float vr = smoothstep(0.2, 1.1, r2);
      col *= 1.0 - uVignette * vr * vr * (3.0 - 2.0 * vr);
      col += vec3(0.0016, 0.0022, 0.003); // slightly teal, lifted blacks
      vec2 seed = gl_FragCoord.xy + fract(uTime * vec2(7.31, 3.17)) * vec2(311.7, 173.3);
      float g = hash12(seed) + hash12(seed + 57.3) - 1.0;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col += g * uGrain * (0.35 + 0.65 * smoothstep(0.0, 0.08, l)) * mix(1.0, 0.3, smoothstep(0.25, 0.9, l));
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const BlurShader = {
  uniforms: { tDiffuse: { value: null as Texture | null }, uStep: { value: new Vector2() } },
  vertexShader: FilmShader.vertexShader,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uStep;
    varying vec2 vUv;
    void main() {
      // 9-tap Gaussian, taps spread by uStep.
      vec3 sum = texture2D(tDiffuse, vUv).rgb * 0.2270270270;
      sum += (texture2D(tDiffuse, vUv + uStep * 1.3846153846).rgb + texture2D(tDiffuse, vUv - uStep * 1.3846153846).rgb) * 0.3162162162;
      sum += (texture2D(tDiffuse, vUv + uStep * 3.2307692308).rgb + texture2D(tDiffuse, vUv - uStep * 3.2307692308).rgb) * 0.0702702703;
      gl_FragColor = vec4(sum, 1.0);
    }
  `,
};

/** A soft round sprite so dust motes are not hard-edged squares. */
const dotTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new CanvasTexture(canvas);
};

export interface Stage {
  /** Add the interviewer (and anything else that stands in the room) here. */
  readonly scene: Scene;
  setSize(width: number, height: number): void;
  /** Re-draw the shadows on the next frame (call it when the figure moved). */
  refreshShadows(): void;
  render(deltaSeconds: number, elapsedSeconds: number): void;
  dispose(): void;
}

/**
 * The room, the lights and the camera effects around the interviewer.
 *
 * The room is drawn once, blurred like a lens would at this distance, and used
 * as the backdrop; it also becomes the environment map, so reflections and
 * bounce light on the skin come from the same window and lamp you see behind.
 */
export const createStage = (renderer: WebGLRenderer, camera: PerspectiveCamera): Stage => {
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new Scene();
  const roomScene = buildRoom();

  // Environment: capture the room from head height.
  const pmrem = new PMREMGenerator(renderer);
  roomScene.position.y = -0.4;
  const environment = pmrem.fromScene(roomScene, 0.02, 0.02, 8);
  roomScene.position.y = 0;
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.6;

  // Lights on the figure. Window light from the left, a cool fill, a warm rim from the lamp side.
  const key = new SpotLight("#fff1e0", 5.5, 0, 0.55, 1, 2);
  key.position.set(-0.75, 0.95, 1.05);
  key.target.position.set(0, 0.38, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.0015;
  key.shadow.radius = 5;
  const fill = new DirectionalLight("#bcd0ff", 0.35);
  fill.position.set(1, 0.2, 1.2);
  const rim = new SpotLight("#ffcf99", 7, 0, 0.6, 1, 2);
  rim.position.set(0.55, 0.85, -0.55);
  rim.target.position.set(0, 0.4, 0);
  const bounce = new PointLight("#ffb878", 0.28, 0, 2);
  bounce.position.set(0.5, 0.3, 0.45);
  scene.add(key, key.target, fill, rim, rim.target, bounce);

  // Dust motes catching the window light.
  const dust = new Group();
  const count = 70;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.7;
    positions[i * 3 + 1] = 0.1 + Math.random() * 0.6;
    positions[i * 3 + 2] = -0.4 + Math.random() * 1.0;
    seeds[i] = Math.random() * 100;
  }
  const dustGeometry = new BufferGeometry();
  dustGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  const dustMap = dotTexture();
  const dustMaterial = new PointsMaterial({
    size: 0.006,
    map: dustMap,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: AdditiveBlending,
    color: "#fff2dd",
  });
  dust.add(new Points(dustGeometry, dustMaterial));
  scene.add(dust);

  // Blurred backdrop.
  const roomTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType, minFilter: LinearFilter, magFilter: LinearFilter });
  const blurA = new WebGLRenderTarget(1, 1, { type: HalfFloatType, minFilter: LinearFilter, magFilter: LinearFilter });
  const blurB = new WebGLRenderTarget(1, 1, { type: HalfFloatType, minFilter: LinearFilter, magFilter: LinearFilter });
  const blurMaterial = new ShaderMaterial(BlurShader);
  const quad = new FullScreenQuad(blurMaterial);
  scene.background = blurB.texture;

  const drawBackdrop = (width: number, height: number) => {
    const w = Math.max(2, Math.round(width / 2));
    const h = Math.max(2, Math.round(height / 2));
    for (const target of [roomTarget, blurA, blurB]) target.setSize(w, h);
    const previous = renderer.getRenderTarget();
    renderer.setRenderTarget(roomTarget);
    renderer.render(roomScene, camera);
    // Three separable passes at growing spread read as a lens blur (like a 85 mm at f/2).
    let source = roomTarget.texture;
    const spread = [1.6, 2.8, 4.2];
    spread.forEach((radius, index) => {
      blurMaterial.uniforms.tDiffuse.value = source;
      blurMaterial.uniforms.uStep.value.set((radius / w) * 1, 0);
      renderer.setRenderTarget(blurA);
      quad.render(renderer);
      blurMaterial.uniforms.tDiffuse.value = blurA.texture;
      blurMaterial.uniforms.uStep.value.set(0, (radius / h) * 1);
      renderer.setRenderTarget(blurB);
      quad.render(renderer);
      source = blurB.texture;
      void index;
    });
    renderer.setRenderTarget(previous);
  };

  // Post chain.
  const composerTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, composerTarget);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.18, 0.6, 1.5);
  composer.addPass(bloom);
  const film = new ShaderPass(FilmShader);
  composer.addPass(film);
  composer.addPass(new OutputPass());

  let shadowsDirty = true;

  return {
    scene,
    setSize(width, height) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(width, height);
      drawBackdrop(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
      shadowsDirty = true;
    },
    refreshShadows() {
      shadowsDirty = true;
    },
    render(delta, elapsed) {
      if (shadowsDirty) {
        renderer.shadowMap.needsUpdate = true;
        shadowsDirty = false;
      }
      const positionAttribute = dustGeometry.getAttribute("position");
      for (let i = 0; i < count; i++) {
        const t = elapsed * 0.05 + seeds[i];
        positionAttribute.setY(i, positions[i * 3 + 1] + Math.sin(t * 3.1) * 0.03 + ((elapsed * 0.004 + seeds[i]) % 0.02));
        positionAttribute.setX(i, positions[i * 3] + Math.cos(t * 2.3) * 0.04);
      }
      positionAttribute.needsUpdate = true;
      film.uniforms.uTime.value = elapsed;
      composer.render(delta);
    },
    dispose() {
      composer.dispose();
      composerTarget.dispose();
      roomTarget.dispose();
      blurA.dispose();
      blurB.dispose();
      blurMaterial.dispose();
      quad.dispose();
      environment.dispose();
      pmrem.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      dustMap.dispose();
    },
  };
};
