import dotenv from "dotenv";

dotenv.config();

const config = {
  httpServer: {
    port: Number(process.env.HTTP_PORT),
    baseUrl: `${process.env.HTTP_BASE_URL}:${process.env.HTTP_PORT}`,
  },
  llm: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    },
  },
};

export default config;