import { jest } from "@jest/globals";

// Mock Redis
jest.mock("redis", () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn().mockResolvedValue(),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    on: jest.fn(),
    ping: jest.fn().mockResolvedValue("PONG"),
  })),
}));

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

// Mock Sentry
jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  configureScope: jest.fn(),
}));

jest.mock("@sentry/profiling-node", () => ({
  nodeProfilingIntegration: jest.fn(),
}));

// Mock Google Gemini AI
jest.mock("@google/genai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(),
      startChat: jest.fn(() => ({
        sendMessage: jest.fn(),
      })),
    })),
  })),
}));

// Mock multer
jest.mock("multer", () => ({
  single: jest.fn(() => (req, res, next) => {
    req.file = {
      buffer: Buffer.from("mock audio data"),
      originalname: "test.wav",
      mimetype: "audio/wav",
    };
    next();
  }),
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.HTTP_PORT = "3001";
process.env.HTTP_BASE_URL = "http://localhost";
process.env.HTTP_SESSION_KEY = "test-session-secret";
process.env.GEMINI_API_KEY = "test-gemini-key";
process.env.GEMINI_MODEL = "gemini-pro";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
process.env.REDIS_USERNAME = "test-user";
process.env.REDIS_PASSWORD = "test-pass";
process.env.SENTRY_DSN = "test-sentry-dsn";

// Mock Firebase service account
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_PRIVATE_KEY_ID = "test-key-id";
process.env.FIREBASE_PRIVATE_KEY = "test-private-key";
process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
process.env.FIREBASE_CLIENT_ID = "test-client-id";
process.env.FIREBASE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth";
process.env.FIREBASE_TOKEN_URI = "https://oauth2.googleapis.com/token";
process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL =
  "https://www.googleapis.com/oauth2/v1/certs";
process.env.FIREBASE_CLIENT_X509_CERT_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/test%40test.iam.gserviceaccount.com";
process.env.FIREBASE_UNIVERSE_DOMAIN = "googleapis.com";

// Global test utilities
global.mockSessionData = {
  email: "test@example.com",
  role: "Junior",
  interviewHistory: [],
  interviewStatus: "IN_PROGRESS",
  numberOfQuestions: 0,
  createdAt: new Date().toISOString(),
};

global.mockRedisClient = {
  get: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  expire: jest.fn(),
  connect: jest.fn().mockResolvedValue(),
  disconnect: jest.fn().mockResolvedValue(),
  on: jest.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
