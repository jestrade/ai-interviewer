import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, getGeminiModel } from "../config.js";
import { getSystemPrompt, feedbackSystemPrompt } from "../data/prompts.js";

const feedbackSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      question: { type: "STRING", description: "The question asked" },
      answer: {
        type: "STRING",
        description: "The answer given by the candidate",
      },
      feedback: { type: "STRING", description: "The feedback for the answer" },
    },
    required: ["question", "answer", "feedback"],
  },
};

const client = () => new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });

/** `history` already contains the latest user turn; `audio` is optional base64 webm. */
export async function generateInterviewReply({ history, name, role, audio }) {
  const parts = [{ text: JSON.stringify(history) }];
  if (audio) parts.push({ inlineData: { mimeType: "audio/webm", data: audio } });

  const result = await client().models.generateContent({
    model: getGeminiModel(),
    contents: [{ role: "user", parts }],
    config: { systemInstruction: getSystemPrompt(name, role) },
  });
  return result.text;
}

export async function generateFeedback(history) {
  const result = await client().models.generateContent({
    model: getGeminiModel(),
    contents: JSON.stringify(history),
    config: {
      systemInstruction: feedbackSystemPrompt,
      responseMimeType: "application/json",
      responseSchema: feedbackSchema,
    },
  });
  return JSON.parse(result.text);
}
