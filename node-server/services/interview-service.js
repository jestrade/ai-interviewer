import config from "../config/index.js";
import { GoogleGenAI } from "@google/genai";
import {
  getSystemPrompt,
  feedbackSystemPrompt,
} from "../data_models/prompts.js";
import { INTERVIEW_STATUS } from "../constants.js";
import * as Sentry from "@sentry/node";

const apiKey = config.llm.gemini.apiKey;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  Sentry.captureException(
    new Error("GEMINI_API_KEY is not set in environment variables.")
  );
}

const genAI = new GoogleGenAI({ apiKey });

const feedbackSchema = {
  type: "ARRAY", // Root type changed to array
  items: {
    // Your original object moves here
    type: "OBJECT",
    properties: {
      question: {
        type: "STRING",
        description: "The question asked",
      },
      answer: {
        type: "STRING",
        description: "The answer given by the candidate",
      },
      feedback: {
        type: "STRING",
        description: "The feedback for the answer",
      },
    },
    required: ["question", "answer", "feedback"],
  },
};

export async function processInterviewMessage(
  audioBuffer,
  userText,
  interviewHistory,
  interviewStatus,
  name,
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
      systemInstruction: getSystemPrompt(name, role),
    },
  });
  const replyText = result.text;

  return replyText;
}

export async function getFeedback(interviewHistory) {
  const userPrompt = JSON.stringify(interviewHistory);

  const result = await genAI.models.generateContent({
    model: config.llm.gemini.model,
    contents: userPrompt,
    config: {
      systemInstruction: feedbackSystemPrompt,
      responseMimeType: "application/json",
      responseSchema: feedbackSchema,
    },
  });

  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  console.log(result.text);
  const replyText = JSON.parse(result.text);

  return replyText;
}
