import express from "express";
import cors from "cors";
import config from "./config/index.js";
import api from "./api/index.js";
import sessionMiddleware from "./middlewares/session/index.js";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json());

app.use(sessionMiddleware());

app.use("/api", api);

app.listen(config.httpServer.port, () =>
  console.log(`Server running on ${config.httpServer.baseUrl}`)
);
