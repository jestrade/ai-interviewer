const config = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  api: {
    url: import.meta.env.VITE_API_BASE_URL,
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
  },
  mode: {
    isProduction: import.meta.env.MODE === "production",
    isDevelopment: import.meta.env.MODE === "development",
    isStaging: import.meta.env.MODE === "staging",
  },
};

export default config;
