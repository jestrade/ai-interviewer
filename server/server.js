import { initializeHTTPServer } from "./http/index.js";
import { initializeFirebase } from "./services/firebase/index.js";
import { initSentry } from "./services/sentry/index.js";

initSentry();
initializeFirebase();
initializeHTTPServer();
