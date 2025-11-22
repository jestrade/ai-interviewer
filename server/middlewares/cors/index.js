import config from "../../config/index.js";
import cors from "cors";

const corsMiddleware = () =>
  cors({
    origin: config.httpServer.frontendOrigin,
    credentials: true,
  });

export default corsMiddleware;
