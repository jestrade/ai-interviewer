import { Router } from "express";

import { createUserController, getUserController } from "./controllers.js";

const app = Router();

app.post("/", createUserController);
app.get("/:id", getUserController);

export default app;
