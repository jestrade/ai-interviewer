import { composeWeights, blinkWeights } from "../compose";
import { toEmotion } from "../emotions";
import { IdleBehavior } from "../idle";
import { blendedMouth, charWeight, visemeAt, visemeWeights } from "../lipsync";
import { rigidControls } from "../rigid-controls";
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

describe("rigidControls", () => {
  it("opens the jaw from jawOpen and closes it when the lips press together", () => {
    expect(rigidControls({ jawOpen: 0.6 }).jaw).toBeCloseTo(0.6);
    expect(rigidControls({ jawOpen: 0.6, mouthClose: 1 }).jaw).toBeLessThan(0.1);
  });

  it("averages the left and right sides and keeps every control in range", () => {
    const controls = rigidControls({ mouthSmile_L: 0.4, mouthSmile_R: 0.2, eyeBlink_L: 1, eyeBlink_R: 1, mouthFunnel: 3 });
    expect(controls.smile).toBeCloseTo(0.3);
    expect(controls.blink).toBe(1);
    expect(controls.narrow).toBe(1);
  });

  it("turns expressions into head poses", () => {
    expect(rigidControls({ browOuterUp_L: 0.35, browOuterUp_R: 0.2 }).headRoll).toBeGreaterThan(0);
    expect(rigidControls({ browDown_L: 0.35, browDown_R: 0.35 }).headPitch).toBeGreaterThan(0);
    expect(rigidControls({}).headPitch).toBe(0);
  });
});

describe("blendedMouth", () => {
  const jaw = (text: string, position: number) => blendedMouth(text, position, "arkit").jawOpen ?? 0;

  it("opens wide on a vowel and stays nearly shut on a plain consonant", () => {
    expect(jaw("ssaass", 2.5)).toBeGreaterThan(jaw("ssaass", 0.5));
  });

  it("does not flicker: moving half a letter changes the jaw only a little", () => {
    const text = "interviewer";
    for (let p = 0; p < text.length - 1; p += 0.5) {
      expect(Math.abs(jaw(text, p + 0.5) - jaw(text, p))).toBeLessThan(0.3);
    }
  });

  it("closes the lips on m/b/p and rests at a full stop", () => {
    expect(blendedMouth("ama", 1.5, "arkit").mouthClose ?? 0).toBeGreaterThan(0.2);
    expect(jaw("yes. no", 3.5)).toBeLessThan(jaw("yes no", 1.5));
  });

  it("keeps the mouth partly open between words", () => {
    expect(jaw("ha ha", 2.5)).toBeGreaterThan(0.1);
  });
});

describe("speech timing", () => {
  it("gives vowels more time than consonants and pauses at punctuation", () => {
    expect(charWeight("a")).toBeGreaterThan(charWeight("t"));
    expect(charWeight(".")).toBeGreaterThan(charWeight(","));
    expect(charWeight(",")).toBeGreaterThan(charWeight(" "));
  });

  it("stays on a pause longer than on the same number of letters", () => {
    let now = 0;
    const track = new SpeechTrack("ab. cd", () => now);
    now = 0;
    track.start();
    // Time to cross "b" (a consonant) vs time spent on the full stop.
    const at = (t: number) => track.positionAt(t);
    const step = 10;
    let t = 0;
    while (at(t) < 2) t += step;
    const reachedStop = t;
    while (at(t) < 3) t += step;
    const pastStop = t;
    expect(pastStop - reachedStop).toBeGreaterThan(reachedStop / 2);
  });
});
