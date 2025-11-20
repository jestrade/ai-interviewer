import { Router } from "express";
import multer from "multer";
import { handleInterview } from "./controllers.js";

const upload = multer({ storage: multer.memoryStorage() });
const app = Router();

app.post("/", upload.single("audio"), handleInterview);

export default app;
