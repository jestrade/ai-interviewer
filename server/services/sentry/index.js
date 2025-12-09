import config from "../../config/index.js";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export const initSentry = () => {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
      nodeProfilingIntegration(),
    ],
    sendDefaultPii: true,
  });
};
