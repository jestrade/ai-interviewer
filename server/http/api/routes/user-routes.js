import { Router } from "express";

import {
  createUserController,
  getUserController,
} from "../controllers/user-controllers.js";

const app = Router();

app.post("/", createUserController);
app.get("/:field/:value", getUserController);

export default app;
