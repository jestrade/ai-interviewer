import { Router } from "express";

import { handleInterview } from "./controllers.js";
import { endInterview } from "./controllers.js";
import { checkOffensiveLanguage } from "../middlewares/checks/checkOffensiveLanguage.js";
import { checkSession } from "../middlewares/checks/checkSession.js";

const app = Router();

app.post("/", checkSession, checkOffensiveLanguage, handleInterview);
app.post("/end", endInterview);

export default app;
