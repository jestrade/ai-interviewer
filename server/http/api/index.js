import { Router } from "express";
import interviewRouter from "./routes/interviews-routes.js";
import authenticateRouter from "./routes/authentications-routes.js";
import userRouter from "./routes/users-routes.js";

const api = Router();

api.use("/interviews", interviewRouter);
api.use("/users", userRouter);
api.use("/init", authenticateRouter);

export default api;
