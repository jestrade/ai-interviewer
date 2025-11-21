import { Router } from "express";

import { handleInterview } from "./controllers.js";
import { endInterview } from "./controllers.js";

const app = Router();

app.post("/", handleInterview);
app.post("/end", endInterview);

export default app;
