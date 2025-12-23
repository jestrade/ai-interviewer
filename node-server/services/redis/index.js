import config from "../../config/index.js";

import { createClient } from "redis";

const client = createClient({
  username: config.redis.username,
  password: config.redis.password,
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

export default client;
