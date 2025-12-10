import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  httpServer: {
    port: process.env.PORT || process.env.HTTP_PORT || 3000,
    baseUrl: `${process.env.HTTP_BASE_URL}:${process.env.HTTP_PORT}`,
    sessionKey: process.env.HTTP_SESSION_KEY,
    frontendOrigin: process.env.HTTP_FRONTEND_ORIGIN,
  },
  llm: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    },
  },
  offensiveKeywords: process.env.OFFESNSIVE_KEYWORDS.split(",").map((word) =>
    word.trim()
  ),
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};

export default config;
