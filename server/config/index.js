import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  httpServer: {
    port: Number(process.env.HTTP_PORT),
    baseUrl: `${process.env.HTTP_BASE_URL}:${process.env.HTTP_PORT}`,
    sessionKey: process.env.HTTP_SESSION_KEY,
  },
  llm: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    },
  },
};

export default config;
