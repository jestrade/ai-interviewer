import { Router } from "express";

import {
  handleInterviewController,
  endInterviewController,
} from "./controllers.js";
import { checkOffensiveLanguage } from "../_middlewares/checks/checkOffensiveLanguage.js";
import { checkSession } from "../_middlewares/checks/checkSession.js";

const app = Router();

app.post("/", checkSession, checkOffensiveLanguage, handleInterviewController);
app.post("/end", endInterviewController);

export default app;
