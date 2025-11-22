import * as Sentry from "@sentry/react";
import config from "../config";

export const initSentry = () => {
  if (config.mode.isProduction) {
    Sentry.init({
      dsn: config.sentry.dsn,
      sendDefaultPii: true,
    });
  }
};

export const notifyError = (
  message: string,
  severityLevel: "error" | "warning" | "info" | "debug" | "fatal" = "error"
) => {
  if (config.mode.isProduction) {
    Sentry.captureMessage(message, severityLevel);
  }
  if (config.mode.isDevelopment) {
    console.error(message);
  }
};

export const notifyException = (error: Error) => {
  if (config.mode.isProduction) {
    Sentry.captureException(error);
  }
  if (config.mode.isDevelopment) {
    console.error(error);
  }
};
