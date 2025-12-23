import express from "express";
import config from "../config/index.js";
import api from "./api/index.js";
import sessionMiddleware from "./api/middlewares/session/index.js";
import corsMiddleware from "./api/middlewares/cors/index.js";

const app = express();

export const initializeHTTPServer = async () => {
  try {
    app.use(corsMiddleware());
    app.use(express.json());
    app.use(sessionMiddleware());

    app.use("/api", api);

    app.listen(config.httpServer.port, () =>
      console.log(`Server running on ${config.httpServer.baseUrl}`)
    );
  } catch (error) {
    console.error("Failed to initialize HTTP server:" + error);
    process.exit(1);
  }
};
