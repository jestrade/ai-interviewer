import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "../../firebaseServiceAccountKey.json" with { type: "json" };

export const initializeFirebase = () => {
  initializeApp({ credential: cert(serviceAccount) });
};
