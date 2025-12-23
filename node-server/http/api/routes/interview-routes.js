import { Router } from "express";

import {
  handleInterviewController,
  endInterviewController,
} from "../controllers/interview-controllers.js";
import { checkOffensiveLanguage } from "../middlewares/checks/check-offensive-language.js";
import { extractSession } from "../middlewares/session/extract-session.js";
import { checkSession } from "../middlewares/session/check-session.js";

const app = Router();

app.post(
  "/",
  extractSession,
  checkSession,
  checkOffensiveLanguage,
  handleInterviewController
);
app.post("/end", extractSession, endInterviewController);

export default app;
