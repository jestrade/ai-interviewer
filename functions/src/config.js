import { defineSecret, defineString } from "firebase-functions/params";

export const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const GEMINI_MODEL = defineString("GEMINI_MODEL", { default: "gemini-2.5-flash" });
const OFFENSIVE_KEYWORDS = defineString("OFFENSIVE_KEYWORDS", { default: "" });

export const REGION = "us-central1";
export const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export const getGeminiModel = () => GEMINI_MODEL.value();

export const getOffensiveKeywords = () =>
  OFFENSIVE_KEYWORDS.value()
    .split(",")
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
