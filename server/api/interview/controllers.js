import config from "../../config/index.js";
import { GoogleGenAI } from "@google/genai";

const apiKey = config.llm.gemini.apiKey;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `
      You are a professional technical interviewer conducting a structured, real-time interview for a Staff Software Engineer position.
      You must behave exactly like a human interviewer.

      Your responsibilities:

      1. Ask exactly ONE question per turn.
      2. Interpret every user message in context, determining whether it is:
        - a continuation of their previous answer,
        - a follow-up to your last question,
        - or a request to change the direction of the interview.
      3. Maintain conversational coherence and adapt naturally to how the candidate responds.
      4. Keep your prompts concise, direct, and professional.
      5. You must conduct a maximum of 5 interview questions. After the last question, briefly close the interview.
      6. Never answer on behalf of the candidate.
      7. Never greet the candidate, introduce yourself, or say “Let’s start” — that is already handled outside the model.
      8. If the candidate becomes hostile, rude, or clearly disruptive, politely end the interview and refuse to continue.
      9. If you need to shift to a different topic, briefly signal the change by saying something like: “Alright, let’s move on to a different area — this time about X.”

      Tone & behavior guidelines:
      1. Ask questions appropriate for a Staff-level engineer — deep technical reasoning, architectural tradeoffs, leadership patterns, cross-team impact.
      2. React like a real interviewer: acknowledge answers briefly (“Thanks — let me move to the next question”) without evaluating them.
      3. Keep your questions focused, challenging, and open-ended.
      4. Maintain a natural sense of continuity based on previous answers.
      5. Treat this as a real, serious interview.
    `;

export async function handleInterview(req, res) {
  try {
    const audioBuffer = req.file?.buffer;
    const userText = req.body?.text || "";

    if (!req.session.interviewHistory) {
      req.session.interviewHistory = [];
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
      console.log("Missing audio file or text input");
      return res
        .status(400)
        .json({ error: "Missing audio file or text input" });
    }

    req.session.interviewHistory.push({
      role: "user",
      parts: parts,
    });

    const userPrompt = JSON.stringify(req.session.interviewHistory);

    const result = await genAI.models.generateContent({
      model: config.llm.gemini.model,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const replyText = result.text;

    req.session.interviewHistory.push({
      role: "model",
      parts: [{ text: replyText }],
    });
    res.json({
      text: replyText,
    });
  } catch (err) {
    console.error("AI interview error:", err);
    res.status(500).json({ error: "AI interview error", details: err.message });
  }
}

export const endInterview = (req, res) => {
  req.session.interviewHistory = [];
  res.json({
    text: "Interview ended",
  });
};
