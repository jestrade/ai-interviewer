import { Router } from "express";
import interviewRouter from "./interviews/routes.js";
import authenticateRouter from "./authenticate/routes.js";
import userRouter from "./users/routes.js";

const api = Router();

api.use("/interviews", interviewRouter);
api.use("/users", userRouter);
api.use("/init", authenticateRouter);

export default api;
