import { useEffect, useRef } from "react";
import {
  Clock,
  Group,
  Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { useAvatarStore } from "./avatar-context";
import { blinkWeights, composeWeights, emotionWeights } from "./compose";
import type { FaceDriver } from "./face-driver";
import { FaceRig } from "./face-rig";
import { IdleBehavior } from "./idle";
import { RigidFaceRig } from "./rigid-face-rig";
import { createStage } from "./stage";

const MODEL_URL = `${import.meta.env.BASE_URL}models/interviewer.glb`;
const TRANSCODER_PATH = `${import.meta.env.BASE_URL}basis/`;

/** The model lies facing +X; the camera looks down -Z. */
const FACE_THE_CAMERA = -Math.PI / 2;

/** Head and shoulders, in the model's units (the whole figure is ~1 unit tall). */
const FRAME = { targetY: 0.385, height: 0.36, cameraY: 0.4 };

interface Props {
  /** Called when the model can not be loaded, so the caller can hide the avatar. */
  onError?: (error: unknown) => void;
}

const hasMorphTargets = (root: Object3D) => {
  let found = false;
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (mesh.isMesh && mesh.morphTargetDictionary) found = true;
  });
  return found;
};

/**
 * AI-generated models ship plain PBR materials. Rebuild them as physical
 * materials so fabric and hair get a soft sheen, and use the red channel of the
 * ORM texture as ambient occlusion, as glTF intends.
 */
const upgradeMaterial = (material: Material, maxAnisotropy: number): Material => {
  const standard = material as MeshStandardMaterial;
  if (!standard.isMeshStandardMaterial) return material;
  [standard.map, standard.normalMap, standard.roughnessMap, standard.metalnessMap].forEach((texture) => {
    if (texture) texture.anisotropy = maxAnisotropy;
  });
  const physical = new MeshPhysicalMaterial({
    map: standard.map,
    normalMap: standard.normalMap,
    normalScale: standard.normalScale ?? new Vector2(1, 1),
    roughnessMap: standard.roughnessMap,
    metalnessMap: standard.metalnessMap,
    aoMap: standard.roughnessMap, // ORM: occlusion lives in red
    aoMapIntensity: 0.9,
    roughness: standard.roughness,
    metalness: standard.metalness,
    sheen: 0.55,
    sheenRoughness: 0.55,
    sheenColor: "#b9aca0",
    specularIntensity: 0.8,
  });
  standard.dispose();
  return physical;
};

const prepare = (root: Object3D, maxAnisotropy: number) => {
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false; // the shader moves vertices outside the rest bounds
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((material) => upgradeMaterial(material, maxAnisotropy))
      : upgradeMaterial(mesh.material, maxAnisotropy);
  });
};

/** Renders the 3D interviewer in her office and animates her from the shared avatar store. */
const InterviewerAvatar = ({ onError }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useAvatarStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let frame = 0;

    const renderer = new WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const camera = new PerspectiveCamera(22, 1, 0.01, 100);
    const distance = FRAME.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(0, FRAME.cameraY, distance);
    camera.lookAt(0, FRAME.targetY, 0);

    const stage = createStage(renderer, camera);

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      stage.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const ktx2 = new KTX2Loader().setTranscoderPath(TRANSCODER_PATH).detectSupport(renderer);
    const loader = new GLTFLoader().setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        prepare(gltf.scene, renderer.capabilities.getMaxAnisotropy());
        const figure = new Group();
        figure.rotation.y = FACE_THE_CAMERA;
        figure.add(gltf.scene);
        stage.scene.add(figure);
        stage.refreshShadows();

        // A model with blendshapes uses them; a plain mesh is bent by a shader.
        const face: FaceDriver = hasMorphTargets(gltf.scene) ? new FaceRig(gltf.scene) : new RigidFaceRig(gltf.scene);
        const idle = new IdleBehavior();
        const clock = new Clock();

        const tick = () => {
          frame = requestAnimationFrame(tick);
          const delta = Math.min(clock.getDelta(), 0.1);
          const time = clock.elapsedTime;
          const mouth = store?.track?.mouthAt(performance.now(), face.mouthStyle) ?? null;
          const idleFrame = idle.update(time, mouth !== null);

          face.apply(
            composeWeights([
              emotionWeights(store?.emotion ?? "neutral"),
              mouth,
              blinkWeights(idleFrame.blink),
              idleFrame.gaze,
            ]),
            delta,
            { yaw: idleFrame.headYaw, pitch: idleFrame.headPitch }
          );

          // Slow breathing: the whole body rises a hair.
          figure.position.y = Math.sin(time * 1.5) * 0.0007;
          stage.render(delta, time);
        };
        tick();
      },
      undefined,
      (error) => !disposed && onError?.(error)
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      ktx2.dispose();
      stage.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [store, onError]);

  return <div ref={containerRef} className="h-full w-full" role="img" aria-label="Interviewer avatar" />;
};

export default InterviewerAvatar;
