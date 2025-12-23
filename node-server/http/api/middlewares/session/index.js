import session from "express-session";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "../../../../services/redis/index.js";
import config from "../../../../config/index.js";

const sessionMiddleware = () =>
  session({
    store: new RedisStore({ client: getRedisClient() }),
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
