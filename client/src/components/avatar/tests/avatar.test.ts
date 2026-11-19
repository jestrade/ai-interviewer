import { composeWeights, blinkWeights } from "../compose";
import { toEmotion } from "../emotions";
import { IdleBehavior } from "../idle";
import { visemeAt, visemeWeights } from "../lipsync";
import { SpeechTrack } from "../speech-track";

describe("visemeAt", () => {
  it("maps vowels, lips-together and labiodental sounds", () => {
    expect(visemeAt("a", 0)).toBe("aa");
    expect(visemeAt("o", 0)).toBe("O");
    expect(visemeAt("Bob", 0)).toBe("PP");
    expect(visemeAt("fan", 0)).toBe("FF");
  });

  it("reads digraphs from the next letter", () => {
    expect(visemeAt("the", 0)).toBe("TH");
    expect(visemeAt("she", 0)).toBe("CH");
  });

  it("rests on spaces, punctuation and missing input", () => {
    expect(visemeAt("a b", 1)).toBe("sil");
    expect(visemeAt("a.", 1)).toBe("sil");
    expect(visemeAt("a", 5)).toBe("sil");
  });
});

describe("visemeWeights", () => {
  it("uses the model's viseme shapes in oculus style", () => {
    expect(visemeWeights("aa", "oculus")).toEqual({ viseme_aa: 0.85 });
    expect(visemeWeights("sil", "oculus")).toEqual({});
  });

  it("builds shapes from ARKit blendshapes in arkit style", () => {
    expect(visemeWeights("aa", "arkit").jawOpen).toBeGreaterThan(0.5);
    expect(visemeWeights("PP", "arkit").mouthClose).toBeGreaterThan(0.5);
  });
});

describe("SpeechTrack", () => {
  const make = () => {
    let now = 0;
    const track = new SpeechTrack("hello world", () => now);
    return { track, at: (t: number) => (now = t) };
  };

  it("has no mouth shape before it starts or after it finishes", () => {
    const { track, at } = make();
    expect(track.mouthAt(0)).toBeNull();
    at(0);
    track.start();
    expect(track.mouthAt(10)).not.toBeNull();
    track.finish();
    expect(track.mouthAt(20)).toBeNull();
  });

  it("moves through the text over time and stays within it", () => {
    const { track, at } = make();
    at(0);
    track.start();
    expect(track.charIndexAt(0)).toBe(0);
    expect(track.charIndexAt(400)).toBeGreaterThan(0);
    expect(track.charIndexAt(1_000_000)).toBe("hello world".length);
  });

  it("re-anchors on word boundaries", () => {
    const { track, at } = make();
    at(0);
    track.start();
    at(100);
    track.boundary(6);
    expect(track.charIndexAt(100)).toBe(6);
  });
});

describe("composeWeights", () => {
  it("adds layers and clamps to 1", () => {
    const result = composeWeights([{ jawOpen: 0.7 }, null, { jawOpen: 0.6, mouthFunnel: 0.2 }]);
    expect(result).toEqual({ jawOpen: 1, mouthFunnel: 0.2 });
  });

  it("maps blink to both eyes", () => {
    expect(blinkWeights(0.5)).toEqual({ eyeBlink_L: 0.5, eyeBlink_R: 0.5 });
  });
});

describe("toEmotion", () => {
  it("accepts known emotions and falls back to neutral", () => {
    expect(toEmotion("curious")).toBe("curious");
    expect(toEmotion("furious")).toBe("neutral");
    expect(toEmotion(undefined)).toBe("neutral");
  });
});

describe("IdleBehavior", () => {
  it("blinks: closed mid-blink and open again afterwards", () => {
    const idle = new IdleBehavior(() => 0.5);
    idle.update(1.5, false); // starts the first blink
    expect(idle.update(1.5 + 0.08, false).blink).toBeGreaterThan(0.9);
    expect(idle.update(1.5 + 0.5, false).blink).toBe(0);
  });
});
