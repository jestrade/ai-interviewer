import config from "../../config/index.js";
import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "../../lib/prompts.js";

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
      throw new Error("Interview history not initialized");
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
        systemInstruction: getSystemPrompt("staff-software-engineer"),
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

export const init = (req, res) => {
  req.session.interviewHistory = [];
  req.session.role = req.body.role;

  res.json({
    text: "Interview initialized",
  });
};
