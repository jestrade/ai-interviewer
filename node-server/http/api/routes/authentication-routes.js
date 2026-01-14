import { Router } from "express";

import { init, wakeup } from "../controllers/authentication-controllers.js";

const app = Router();

app.post("/", init);
app.post("/wakeup", wakeup);

export default app;
