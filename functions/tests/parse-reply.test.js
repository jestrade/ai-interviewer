import { jest } from "@jest/globals";

jest.unstable_mockModule("@google/genai", () => ({ GoogleGenAI: class {} }));
jest.unstable_mockModule("../src/config.js", () => ({
  GEMINI_API_KEY: { value: () => "test" },
  getGeminiModel: () => "test-model",
}));

const { parseReply } = await import("../src/services/interview-service.js");

describe("parseReply", () => {
  it("reads reply and emotion from JSON", () => {
    expect(parseReply('{"reply":"Hello","emotion":"friendly"}')).toEqual({
      text: "Hello",
      emotion: "friendly",
    });
  });

  it("uses neutral for unknown emotions", () => {
    expect(parseReply('{"reply":"Hi","emotion":"angry"}').emotion).toBe("neutral");
  });

  it("falls back to the raw text when it is not JSON", () => {
    expect(parseReply("Plain answer")).toEqual({ text: "Plain answer", emotion: "neutral" });
  });
});
