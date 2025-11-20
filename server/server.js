import express from "express";
import cors from "cors";
import api from "./api/index.js";
import config from "./config/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", api);

app.listen(config.httpServer.port, () => console.log(`Server running on ${config.httpServer.baseUrl}`));
