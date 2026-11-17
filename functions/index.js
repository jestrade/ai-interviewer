import { initializeApp } from "firebase-admin/app";
import { onCall } from "firebase-functions/v2/https";
import { GEMINI_API_KEY, REGION } from "./src/config.js";
import * as handlers from "./src/handlers.js";

initializeApp();

const options = { region: REGION, cors: true };
const llmOptions = { ...options, secrets: [GEMINI_API_KEY], timeoutSeconds: 120, memory: "512MiB" };

export const wakeup = onCall(options, handlers.wakeup);
export const init = onCall(options, handlers.init);
export const createUser = onCall(options, handlers.createUserHandler);
export const sendMessage = onCall(llmOptions, handlers.sendMessage);
export const endInterview = onCall(options, handlers.endInterview);
export const getFeedback = onCall(llmOptions, handlers.getFeedback);
