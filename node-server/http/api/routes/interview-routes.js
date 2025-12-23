import { Router } from "express";

import {
  handleInterviewController,
  endInterviewController,
} from "../controllers/interview-controllers.js";
import { checkOffensiveLanguage } from "../middlewares/checks/check-offensive-language.js";
import { checkSession } from "../middlewares/session/check-session.js";

const app = Router();

app.post("/", checkSession, checkOffensiveLanguage, handleInterviewController);
app.post("/end", endInterviewController);

export default app;
