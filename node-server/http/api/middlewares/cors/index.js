import config from "../../../../config/index.js";
import cors from "cors";

const corsMiddleware = () =>
  cors({
    origin: config.httpServer.frontendOrigin,
    credentials: true,
    secure: true,
  });

export default corsMiddleware;
