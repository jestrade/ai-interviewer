import config from "../config/index.js";
import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "../data_models/prompts.js";
import { INTERVIEW_STATUS } from "../constants.js";

const apiKey = config.llm.gemini.apiKey;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenAI({ apiKey });

export async function processInterviewMessage(
  audioBuffer,
  userText,
  interviewHistory,
  interviewStatus,
  role
) {
  if (interviewStatus === INTERVIEW_STATUS.ENDED) {
    throw new Error("Interview has ended");
  }
  if (!interviewHistory) {
    throw new Error("History missing");
  }
  if (!role) {
    throw new Error("Role missing");
  }

  const parts = [];

  if (userText) {
    parts.push({ text: userText });
  } else if (audioBuffer) {
    parts.push({
      inline_data: {
        mime_type: "audio/webm",
        data: audioBuffer.toString("base64"),
      },
    });
  } else {
    throw new Error("Missing audio file or text input");
  }

  const userPrompt = JSON.stringify(interviewHistory);

  const result = await genAI.models.generateContent({
    model: config.llm.gemini.model,
    contents: userPrompt,
    config: {
      systemInstruction: getSystemPrompt(role),
    },
  });
  const replyText = result.text;

  return replyText;
}
