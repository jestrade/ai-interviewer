const config = {
  firebase: {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "test-app-id",
    measurementId: "G-TEST",
  },
  api: {
    url: "http://localhost:3000",
  },
  sentry: {
    dsn: "",
  },
  mode: {
    isProduction: false,
    isDevelopment: true,
    isStaging: false,
  },
};

export default config;
