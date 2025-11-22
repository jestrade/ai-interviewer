import session from "express-session";
import config from "../../config/index.js";

const sessionMiddleware = () =>
  session({
    secret: config.httpServer.sessionKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      secure: false,
    },
  });

export default sessionMiddleware;
