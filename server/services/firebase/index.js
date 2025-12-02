import { initializeApp, cert } from "firebase-admin/app";
const serviceAccount = require("../../firebaseServiceAccountKey.json");

export const initializeFirebase = () => {
  initializeApp({ credential: cert(serviceAccount) });
};
