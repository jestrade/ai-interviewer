import config from "../../config/index.js";
import { GoogleGenAI } from "@google/genai";

const apiKey = config.llm.gemini.apiKey;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenAI({ apiKey });

export async function handleInterview(req, res) {
  try {
    const audioBuffer = req.file?.buffer;
    const userText = req.body?.text || "";

    if (!req.session.interviewHistory) {
      req.session.interviewHistory = [];
    }

    const parts = [];
    if (userText) {
      console.log("Received text input:", userText);
      parts.push({ text: userText });
    } else if (audioBuffer) {
      console.log(
        "Received audioBuffer:",
        audioBuffer.toString("base64").slice(0, 30) + "..."
      );
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

    const systemPrompt = `
      You are a professional technical interviewer.
      Your job is to conduct a structured interview and ask ONE question at a time.

      You MUST:
      - Interpret each user message in context of past messages.
      - Decide whether it is:
          • a follow-up to a previous question,
          • a continuation of an answer,
          • or a request to change the topic.
      - Maintain coherence across turns.
      - Keep responses concise.
      - NEVER answer for the candidate — only ask or react as an interviewer.
      - NEVER say hello.
      - Do not introduce yourself, since it has been already done in the UI.
      - Do not repeat Let's start. 
    `;
    req.session.interviewHistory.push({
      role: "user",
      parts: parts,
    });

    const userPrompt = req.session.interviewHistory.join(" ");

    const result = await genAI.models.generateContent({
      model: config.llm.gemini.model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
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
