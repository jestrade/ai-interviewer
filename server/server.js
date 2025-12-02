import { initializeHTTPServer } from "./http/index.js";
import { initializeFirebase } from "./services/firebase/index.js";

initializeFirebase();
initializeHTTPServer();
