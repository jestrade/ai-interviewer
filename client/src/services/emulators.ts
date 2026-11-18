import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, Functions } from "firebase/functions";
import type { FirebaseApp } from "firebase/app";

const AUTH_URL = "http://127.0.0.1:9099";
const FUNCTIONS_HOST = "127.0.0.1";
const FUNCTIONS_PORT = 5001;

/**
 * Local development only. Enabled by the explicit `emulator` Vite mode
 * (`npm run dev:emulator`) and never in a production build, so a deployed
 * bundle can not be pointed at the emulators by accident.
 */
export const isEmulatorMode = (): boolean =>
  import.meta.env.MODE === "emulator" && !import.meta.env.PROD;

export const connectEmulators = (app: FirebaseApp, functions: Functions) => {
  connectAuthEmulator(getAuth(app), AUTH_URL, { disableWarnings: true });
  connectFunctionsEmulator(functions, FUNCTIONS_HOST, FUNCTIONS_PORT);
};
