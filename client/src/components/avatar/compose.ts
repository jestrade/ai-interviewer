import { EMOTION_PRESETS, Emotion, Weights } from "./emotions";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Adds up the layers that drive the face and keeps every weight in 0..1. */
export const composeWeights = (layers: (Weights | null | undefined)[]): Weights => {
  const total: Weights = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [name, weight] of Object.entries(layer)) {
      total[name] = (total[name] ?? 0) + weight;
    }
  }
  for (const name of Object.keys(total)) total[name] = clamp01(total[name]);
  return total;
};

export const emotionWeights = (emotion: Emotion): Weights => EMOTION_PRESETS[emotion];

export const blinkWeights = (amount: number): Weights => ({
  eyeBlink_L: amount,
  eyeBlink_R: amount,
});
