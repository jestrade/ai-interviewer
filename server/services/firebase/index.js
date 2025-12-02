import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "../../firebase-service-account-key.json" with { type: "json" };

export const initializeFirebase = () => {
  initializeApp({ credential: cert(serviceAccount) });
};
