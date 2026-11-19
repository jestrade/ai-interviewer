import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  Box3,
  Clock,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useAvatarStore } from "./avatar-context";
import { blinkWeights, composeWeights, emotionWeights } from "./compose";
import { FaceRig } from "./face-rig";
import { IdleBehavior } from "./idle";

const MODEL_URL = `${import.meta.env.BASE_URL}models/avatar.glb`;
const TRANSCODER_PATH = `${import.meta.env.BASE_URL}basis/`;

interface Props {
  /** Called when the model can not be loaded, so the caller can hide the avatar. */
  onError?: (error: unknown) => void;
}

/** The face is the biggest mesh that has morph targets (eyes and teeth have them too). */
const findFace = (root: Object3D): Mesh | undefined => {
  let face: Mesh | undefined;
  let biggest = 0;
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh || !mesh.morphTargetDictionary) return;
    const size = new Box3().setFromObject(mesh).getSize(new Vector3());
    const volume = size.x * size.y * size.z;
    if (volume > biggest) {
      biggest = volume;
      face = mesh;
    }
  });
  return face;
};

/** Renders the 3D interviewer and animates it from the shared avatar store. */
const InterviewerAvatar = ({ onError }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useAvatarStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let frame = 0;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Soft studio lighting from an environment map gives skin and hair a natural look.
    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;
    scene.add(new HemisphereLight(0xffffff, 0x8a7f78, 0.35));
    const key = new DirectionalLight(0xfff1e6, 1.4);
    key.position.set(0.8, 1.2, 2);
    scene.add(key);

    const camera = new PerspectiveCamera(22, 1, 0.01, 100);
    const pivot = new Group();
    scene.add(pivot);

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
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
        pivot.add(gltf.scene);
        // Glasses hide the eyes, which carry most of the expression.
        gltf.scene.traverse((object) => {
          if (/glasses/i.test(object.name)) object.visible = false;
        });
        gltf.scene.updateMatrixWorld(true);

        // Frame head and shoulders: aim at the face and fit ~2x its height.
        const face = findFace(gltf.scene);
        const box = new Box3().setFromObject(face ?? gltf.scene);
        const center = box.getCenter(new Vector3());
        const height = box.getSize(new Vector3()).y;
        const visibleHeight = face ? height * 1.25 : height * 1.1;
        const distance = visibleHeight / 2 / Math.tan((camera.fov * Math.PI) / 360);
        const target = new Vector3(center.x, center.y - (face ? height * 0.04 : 0), center.z);
        camera.position.set(target.x, target.y, target.z + distance);
        camera.lookAt(target);

        const head = gltf.scene.getObjectByName("Head");
        const headBase = head?.rotation.clone();

        const rig = new FaceRig(gltf.scene);
        const style = rig.hasVisemes ? "oculus" : "arkit";
        const idle = new IdleBehavior();
        const clock = new Clock();

        const tick = () => {
          frame = requestAnimationFrame(tick);
          const delta = Math.min(clock.getDelta(), 0.1);
          const time = clock.elapsedTime;
          const mouth = store?.track?.mouthAt(performance.now(), style) ?? null;
          const idleFrame = idle.update(time, mouth !== null);

          rig.apply(
            composeWeights([
              emotionWeights(store?.emotion ?? "neutral"),
              mouth,
              blinkWeights(idleFrame.blink),
              idleFrame.gaze,
            ]),
            delta
          );

          // Move the head bone when the model has one; otherwise turn the whole model.
          if (head && headBase) {
            head.rotation.y = headBase.y + idleFrame.headYaw;
            head.rotation.x = headBase.x + idleFrame.headPitch;
          } else {
            pivot.rotation.y = idleFrame.headYaw;
            pivot.rotation.x = idleFrame.headPitch;
          }
          renderer.render(scene, camera);
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
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [store, onError]);

  return <div ref={containerRef} className="h-full w-full" role="img" aria-label="Interviewer avatar" />;
};

export default InterviewerAvatar;
