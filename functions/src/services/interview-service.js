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

export const EMOTIONS = ["neutral", "friendly", "curious", "encouraging", "serious", "thoughtful"];

const replySchema = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING", description: "Exactly what the interviewer says out loud" },
    emotion: {
      type: "STRING",
      enum: EMOTIONS,
      description: "The facial expression the interviewer shows while saying it",
    },
  },
  required: ["reply", "emotion"],
};

const EMOTION_INSTRUCTIONS = `

Answer as JSON with two fields: "reply" (exactly what you say out loud, plain text) and "emotion" (one of: ${EMOTIONS.join(", ")}) describing the facial expression that fits the reply.`;

/** Turns the model output into `{ text, emotion }`; falls back to plain text. */
export const parseReply = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.reply === "string" && parsed.reply.trim()) {
      const emotion = EMOTIONS.includes(parsed.emotion) ? parsed.emotion : "neutral";
      return { text: parsed.reply, emotion };
    }
  } catch {
    // not JSON: use the raw text below
  }
  return { text: String(raw ?? ""), emotion: "neutral" };
};

const client = () => new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });

/** `history` already contains the latest user turn; `audio` is optional base64 webm. */
export async function generateInterviewReply({ history, name, role, audio }) {
  const parts = [{ text: JSON.stringify(history) }];
  if (audio) parts.push({ inlineData: { mimeType: "audio/webm", data: audio } });

  const result = await client().models.generateContent({
    model: getGeminiModel(),
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: getSystemPrompt(name, role) + EMOTION_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: replySchema,
    },
  });
  return parseReply(result.text);
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
