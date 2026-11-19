import { useEffect, useRef } from "react";
import {
  Box3,
  Clock,
  DirectionalLight,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
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
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    scene.add(new HemisphereLight(0xffffff, 0x445566, 1.1));
    const key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(1, 1.5, 2);
    scene.add(key);

    const camera = new PerspectiveCamera(24, 1, 0.01, 100);
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

        // Centre the model on the pivot and frame it.
        const box = new Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3());
        gltf.scene.position.sub(center);
        const distance = (Math.max(size.x, size.y) * 0.4) / Math.tan((camera.fov * Math.PI) / 360);
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);

        const rig = new FaceRig(gltf.scene);
        const idle = new IdleBehavior();
        const clock = new Clock();

        const tick = () => {
          frame = requestAnimationFrame(tick);
          const delta = Math.min(clock.getDelta(), 0.1);
          const time = clock.elapsedTime;
          const mouth = store?.track?.mouthAt(performance.now()) ?? null;
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
          pivot.rotation.y = idleFrame.headYaw;
          pivot.rotation.x = idleFrame.headPitch;
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
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [store, onError]);

  return <div ref={containerRef} className="h-full w-full" role="img" aria-label="Interviewer avatar" />;
};

export default InterviewerAvatar;
