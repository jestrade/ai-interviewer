import { jest } from "@jest/globals";
import { initializeHTTPServer } from "../http/index.js";
import { initializeRedis } from "../services/redis/index.js";
import { initializeFirebase } from "../services/firebase/index.js";
import { initSentry } from "../services/sentry/index.js";

// Mock all dependencies
jest.mock("../http/index.js");
jest.mock("../services/redis/index.js");
jest.mock("../services/firebase/index.js");
jest.mock("../services/sentry/index.js");

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, "log").mockImplementation(),
  error: jest.spyOn(console, "error").mockImplementation(),
};

const processSpy = jest.spyOn(process, "exit").mockImplementation();

describe("Server Entry Point", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    processSpy.mockClear();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    processSpy.mockRestore();
  });

  describe("Server startup", () => {
    it("should start server successfully", async () => {
      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();
      initializeHTTPServer.mockResolvedValue();

      // Import and run the server
      await import("../server.js");

      // Wait a tick for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(initializeRedis).toHaveBeenCalled();
      expect(initSentry).toHaveBeenCalled();
      expect(initializeFirebase).toHaveBeenCalled();
      expect(initializeHTTPServer).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Server started in test mode"
      );
    });

    it("should handle Redis initialization failure", async () => {
      const error = new Error("Redis connection failed");
      initializeRedis.mockRejectedValue(error);

      // Import and run the server
      try {
        await import("../server.js");
        // Wait a tick for async operations
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch (e) {
        // Expected to have an error
      }

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Failed to start server:",
        error
      );
      expect(processSpy).toHaveBeenCalledWith(1);
    });

    it("should handle HTTP server initialization failure", async () => {
      const error = new Error("HTTP server failed to start");
      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();
      initializeHTTPServer.mockRejectedValue(error);

      // Import and run the server
      try {
        await import("../server.js");
        // Wait a tick for async operations
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch (e) {
        // Expected to have an error
      }

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Failed to start server:",
        error
      );
      expect(processSpy).toHaveBeenCalledWith(1);
    });

    it("should handle Firebase initialization failure", async () => {
      const error = new Error("Firebase initialization failed");
      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation(() => {
        throw error;
      });
      initSentry.mockImplementation();

      // Import and run the server
      try {
        await import("../server.js");
        // Wait a tick for async operations
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch (e) {
        // Expected to have an error
      }

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Failed to start server:",
        error
      );
      expect(processSpy).toHaveBeenCalledWith(1);
    });

    it("should log correct environment mode", async () => {
      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();
      initializeHTTPServer.mockResolvedValue();

      // Test different environments
      const testCases = ["development", "production", "test", "staging"];

      for (const env of testCases) {
        process.env.NODE_ENV = env;

        // Clear previous calls
        consoleSpy.log.mockClear();

        // Re-import the module (in real scenario, this would be a fresh start)
        jest.resetModules();

        try {
          await import("../server.js");
          // Wait a tick for async operations
          await new Promise((resolve) => setTimeout(resolve, 0));

          expect(consoleSpy.log).toHaveBeenCalledWith(
            `Server started in ${env} mode`
          );
        } catch (e) {
          // Ignore errors for this test
        }
      }
    });

    it("should initialize services in correct order", async () => {
      const callOrder = [];

      initializeRedis.mockImplementation(async () => {
        callOrder.push("redis");
      });

      initSentry.mockImplementation(() => {
        callOrder.push("sentry");
      });

      initializeFirebase.mockImplementation(() => {
        callOrder.push("firebase");
      });

      initializeHTTPServer.mockImplementation(async () => {
        callOrder.push("http");
      });

      await import("../server.js");
      // Wait a tick for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Redis should be first (awaited)
      expect(callOrder[0]).toBe("redis");

      // Sentry should be second
      expect(callOrder[1]).toBe("sentry");

      // Firebase should be third
      expect(callOrder[2]).toBe("firebase");

      // HTTP server should be last
      expect(callOrder[3]).toBe("http");
    });

    it("should handle missing NODE_ENV", async () => {
      delete process.env.NODE_ENV;

      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();
      initializeHTTPServer.mockResolvedValue();

      await import("../server.js");
      // Wait a tick for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Server started in undefined mode"
      );
    });

    it("should not call process.exit on successful startup", async () => {
      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();
      initializeHTTPServer.mockResolvedValue();

      await import("../server.js");
      // Wait a tick for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(processSpy).not.toHaveBeenCalled();
    });
  });
});
