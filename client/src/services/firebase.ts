import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

import config from "../config";
import { connectEmulators, isEmulatorMode } from "./emulators";

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
export const functions = getFunctions(app, "us-central1");

// Emulator mode talks to local Auth/Functions and skips analytics.
if (isEmulatorMode()) connectEmulators(app, functions);
export const analytics = isEmulatorMode() ? null : getAnalytics(app);
