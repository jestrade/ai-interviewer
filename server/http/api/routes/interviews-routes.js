import { Router } from "express";

import {
  handleInterviewController,
  endInterviewController,
} from "../controllers/interviews-controllers.js";
import { checkOffensiveLanguage } from "../_middlewares/checks/check-offensive-language.js";
import { checkSession } from "../_middlewares/checks/check-session.js";

const app = Router();

app.post("/", checkSession, checkOffensiveLanguage, handleInterviewController);
app.post("/end", endInterviewController);

export default app;
