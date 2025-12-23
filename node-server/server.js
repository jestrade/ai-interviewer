import { initializeHTTPServer } from "./http/index.js";
import { initializeFirebase } from "./services/firebase/index.js";
import { initSentry } from "./services/sentry/index.js";

const startServer = async () => {
  try {
    initSentry();
    initializeFirebase();
    await initializeHTTPServer();
  } catch (error) {
    console.error("Failed to start server:" + error);
    process.exit(1);
  }
};

startServer();
