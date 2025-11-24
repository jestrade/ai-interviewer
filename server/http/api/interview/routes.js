import { Router } from "express";

import { handleInterview } from "./controllers.js";
import { endInterview } from "./controllers.js";
import { checkOffensiveLanguage } from "../middlewares/checks/checkOffensiveLanguage.js";

const app = Router();

app.post("/", checkOffensiveLanguage, handleInterview);
app.post("/end", endInterview);

export default app;
