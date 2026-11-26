/** Facial expressions the interviewer can show. Keep in sync with the backend enum. */
export const EMOTIONS = [
  "neutral",
  "friendly",
  "curious",
  "encouraging",
  "serious",
  "thoughtful",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const toEmotion = (value: unknown): Emotion =>
  EMOTIONS.includes(value as Emotion) ? (value as Emotion) : "neutral";

/** Blendshape weights (ARKit names, as used by the model) by morph target name. */
export type Weights = Record<string, number>;

export const EMOTION_PRESETS: Record<Emotion, Weights> = {
  neutral: {},
  friendly: { mouthSmile_L: 0.35, mouthSmile_R: 0.35, cheekSquint_L: 0.2, cheekSquint_R: 0.2, browInnerUp: 0.1 },
  curious: { browInnerUp: 0.5, browOuterUp_L: 0.35, browOuterUp_R: 0.2, eyeWide_L: 0.15, eyeWide_R: 0.15 },
  encouraging: { mouthSmile_L: 0.5, mouthSmile_R: 0.5, cheekSquint_L: 0.3, cheekSquint_R: 0.3, browInnerUp: 0.25 },
  serious: { browDown_L: 0.35, browDown_R: 0.35, mouthPress_L: 0.15, mouthPress_R: 0.15 },
  thoughtful: { browInnerUp: 0.3, browOuterUp_L: 0.2, eyeLookUp_L: 0.2, eyeLookUp_R: 0.2, mouthPucker: 0.1 },
};
