import * as Sentry from "@sentry/react";
import config from "../config";

export const initSentry = () => {
  Sentry.init({
    dsn: config.sentry.dsn,
    sendDefaultPii: true,
  });
};
export const notifyError = (
  message: string,
  severityLevel: "error" | "warning" | "info" | "debug" | "fatal" = "error"
) => {
  Sentry.captureMessage(message, severityLevel);
};
export const notifyException = (error: Error) => {
  Sentry.captureException(error);
};
