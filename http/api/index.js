import { Router } from "express";
import interviewRouter from "./interview/routes.js";
import authenticateRouter from "./authenticate/routes.js";

const api = Router();

api.use("/interview", interviewRouter);
api.use("/init", authenticateRouter);

export default api;
