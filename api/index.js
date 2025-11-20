import { Router } from "express";
import interviewRouter from "./interview/routes.js";

const api = Router();

api.use("/interview", interviewRouter);

export default api;
