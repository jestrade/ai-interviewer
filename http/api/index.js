import { Router } from "express";
import interviewRouter from "./routes/interview-routes.js";
import authenticateRouter from "./routes/authentication-routes.js";
import userRouter from "./routes/user-routes.js";

const api = Router();

api.use("/interviews", interviewRouter);
api.use("/users", userRouter);
api.use("/init", authenticateRouter);

export default api;
