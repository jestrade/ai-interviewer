import { initializeHTTPServer } from "./http/index.js";
import { initializeFirebase } from "./services/firebase/index.js";
import { initSentry } from "./services/sentry/index.js";
import { initializeRedis } from "./services/redis/index.js";

const startServer = async () => {
  try {
    await initializeRedis();
    initSentry();
    initializeFirebase();
    await initializeHTTPServer();
  } catch (error) {
    console.error("Failed to start server:" + error);
    process.exit(1);
  }
};

startServer();
