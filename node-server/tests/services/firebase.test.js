import { jest } from "@jest/globals";
import { initializeFirebase } from "../../services/firebase/index.js";
import { initializeApp, credential } from "firebase-admin";
import config from "../../config/index.js";

// Mock dependencies
jest.mock("firebase-admin");
jest.mock("../../config/index.js");

describe("Firebase Service", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock config
    config.firebase = {
      projectId: "test-project",
      clientEmail: "test@test.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n",
      universeDomain: "googleapis.com",
    };
  });

  describe("initializeFirebase", () => {
    it("should initialize Firebase with correct configuration", () => {
      const mockApp = { name: "test-app" };
      initializeApp.mockReturnValue(mockApp);
      credential.cert.mockReturnValue({});

      initializeFirebase();

      expect(credential.cert).toHaveBeenCalledWith({
        projectId: "test-project",
        clientEmail: "test@test.com",
        privateKey:
          "-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n",
        universeDomain: "googleapis.com",
      });

      expect(initializeApp).toHaveBeenCalledWith({
        credential: expect.any(Object),
        projectId: "test-project",
      });
    });

    it("should validate all required Firebase environment variables", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      delete config.firebase.projectId;

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );

      consoleSpy.mockRestore();
    });

    it("should throw error when projectId is missing", () => {
      delete config.firebase.projectId;

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should throw error when clientEmail is missing", () => {
      delete config.firebase.clientEmail;

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should throw error when privateKey is missing", () => {
      delete config.firebase.privateKey;

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should throw error when universeDomain is missing", () => {
      delete config.firebase.universeDomain;

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should log successful initialization", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const mockApp = { name: "test-app" };
      initializeApp.mockReturnValue(mockApp);
      credential.cert.mockReturnValue({});

      initializeFirebase();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Firebase initialized successfully"
      );

      consoleSpy.mockRestore();
    });

    it("should handle empty string values", () => {
      config.firebase.projectId = "";
      config.firebase.clientEmail = "";
      config.firebase.privateKey = "";
      config.firebase.universeDomain = "";

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should handle null values", () => {
      config.firebase.projectId = null;
      config.firebase.clientEmail = null;
      config.firebase.privateKey = null;
      config.firebase.universeDomain = null;

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should handle undefined values", () => {
      config.firebase.projectId = undefined;
      config.firebase.clientEmail = undefined;
      config.firebase.privateKey = undefined;
      config.firebase.universeDomain = undefined;

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should work with valid configuration", () => {
      const mockApp = { name: "test-app" };
      initializeApp.mockReturnValue(mockApp);
      credential.cert.mockReturnValue({});

      expect(() => initializeFirebase()).not.toThrow();
      expect(initializeApp).toHaveBeenCalled();
    });

    it("should handle whitespace-only values", () => {
      config.firebase.projectId = "   ";
      config.firebase.clientEmail = "   ";
      config.firebase.privateKey = "   ";
      config.firebase.universeDomain = "   ";

      expect(() => initializeFirebase()).toThrow(
        "Missing required Firebase environment variables"
      );
    });

    it("should validate all required fields are present", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const mockApp = { name: "test-app" };
      initializeApp.mockReturnValue(mockApp);
      credential.cert.mockReturnValue({});

      // All required fields are present
      expect(() => initializeFirebase()).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
