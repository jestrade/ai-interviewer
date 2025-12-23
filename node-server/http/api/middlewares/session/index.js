import session from "express-session";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "../../../../services/redis/index.js";
import config from "../../../../config/index.js";

const sessionMiddleware = () =>
  session({
    name: "sid",
    store: new RedisStore({
      client: getRedisClient({
        client: getRedisClient(),
        prefix: config.mode.isProduction ? "session:" : "session-dev:",
      }),
    }),
    secret: config.httpServer.sessionKey,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
      secure: config.mode.isProduction,
      sameSite: "lax",
    },
  });

export default sessionMiddleware;
