import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import config from "../config";

const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
  measurementId: config.firebase.measurementId,
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
