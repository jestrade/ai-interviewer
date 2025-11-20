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
        You are a professional technical interviewer. Ask one question at a time and adapt based on candidate answers. Keep your response concise.
          `;
    const userPrompt = `
    Objective: Conduct a technical interview for a software engineering position.
    Context: ${parts.join(" ")}
    `;

    const result = await genAI.models.generateContent({
      model: config.llm.gemini.model,
      contents: [systemPrompt, userPrompt],
    });

    const replyText = result.text;

    res.json({
      text: replyText,
    });
  } catch (err) {
    console.error("AI interview error:", err);
    res.status(500).json({ error: "AI interview error", details: err.message });
  }
}
