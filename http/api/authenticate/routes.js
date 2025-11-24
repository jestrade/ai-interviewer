import { Router } from "express";

import { init } from "./controllers.js";

const app = Router();

app.post("/", init);

export default app;
