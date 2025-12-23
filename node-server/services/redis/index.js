import config from "../../config/index.js";
import { createClient } from "redis";
import * as Sentry from "@sentry/node";

let client = null;

export const initializeRedis = async () => {
  try {
    client = createClient({
      username: config.redis.username,
      password: config.redis.password,
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
      Sentry.captureException(err);
    });

    client.on("connect", () => {
      console.log("Redis Client Connected");
    });

    client.on("ready", () => {
      console.log("Redis Client Ready");
    });

    await client.connect();
    console.log("Redis connection established successfully");
    return client;
  } catch (error) {
    console.error("Failed to connect to Redis:" + error);
    Sentry.captureException(error);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!client) {
    throw new Error(
      "Redis client not initialized. Call initializeRedis() first."
    );
  }
  return client;
};

export default client;
