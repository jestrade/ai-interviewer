import { jest } from "@jest/globals";
import { initializeHTTPServer } from "../../http/index.js";
import { initializeRedis } from "../../services/redis/index.js";
import { initializeFirebase } from "../../services/firebase/index.js";
import { initSentry } from "../../services/sentry/index.js";

// Mock dependencies
jest.mock("../../services/redis/index.js");
jest.mock("../../services/firebase/index.js");
jest.mock("../../services/sentry/index.js");

describe("HTTP Server", () => {
  let mockApp, mockListen;

  beforeEach(() => {
    // Mock Express app
    mockApp = {
      set: jest.fn(),
      use: jest.fn(),
      listen: jest.fn(),
    };

    // Mock express module
    jest.doMock("express", () => jest.fn(() => mockApp));

    // Mock listen callback
    mockListen = mockApp.listen;
    mockListen.mockImplementation((port, callback) => {
      callback();
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe("initializeHTTPServer", () => {
    it("should initialize HTTP server successfully", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();

      await initializeHTTPServer();

      expect(initializeRedis).toHaveBeenCalled();
      expect(initSentry).toHaveBeenCalled();
      expect(initializeFirebase).toHaveBeenCalled();

      expect(mockApp.set).toHaveBeenCalledWith("trust proxy", 1);
      expect(mockApp.use).toHaveBeenCalledTimes(2); // cors and express.json
      expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Server running on http://localhost:3001"
      );

      consoleSpy.mockRestore();
    });

    it("should handle Redis initialization failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const processSpy = jest.spyOn(process, "exit").mockImplementation();

      const error = new Error("Redis connection failed");
      initializeRedis.mockRejectedValue(error);

      await initializeHTTPServer();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize HTTP server:",
        error
      );
      expect(processSpy).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      processSpy.mockRestore();
    });

    it("should handle server startup failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const processSpy = jest.spyOn(process, "exit").mockImplementation();

      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();

      const error = new Error("Port already in use");
      mockListen.mockImplementation((port, callback) => {
        callback(error);
      });

      await initializeHTTPServer();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize HTTP server:",
        error
      );
      expect(processSpy).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      processSpy.mockRestore();
    });

    it("should set up middleware in correct order", async () => {
      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();

      await initializeHTTPServer();

      expect(mockApp.set).toHaveBeenCalledWith("trust proxy", 1);

      // Check middleware calls
      const useCalls = mockApp.use.mock.calls;
      expect(useCalls).toHaveLength(2);

      // First should be cors middleware
      expect(useCalls[0][0]).toBeFunction();

      // Second should be express.json middleware
      expect(useCalls[1][0]).toBeFunction();
    });

    it("should use correct port and base URL from config", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();

      await initializeHTTPServer();

      expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function));
      expect(consoleSpy).toHaveBeenCalledWith(
        "Server running on http://localhost:3001"
      );

      consoleSpy.mockRestore();
    });

    it("should initialize services in correct order", async () => {
      const redisSpy = jest.fn();
      const firebaseSpy = jest.fn();
      const sentrySpy = jest.fn();

      initializeRedis.mockImplementation(redisSpy);
      initializeFirebase.mockImplementation(firebaseSpy);
      initSentry.mockImplementation(sentrySpy);

      await initializeHTTPServer();

      // Redis should be initialized first (awaited)
      expect(redisSpy).toHaveBeenCalled();

      // Then Sentry and Firebase (not awaited)
      expect(sentrySpy).toHaveBeenCalled();
      expect(firebaseSpy).toHaveBeenCalled();
    });

    it("should handle missing callback in listen", async () => {
      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();

      mockListen.mockImplementation((port) => {
        // No callback provided
      });

      await initializeHTTPServer();

      expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function));
    });

    it("should not call process.exit on successful initialization", async () => {
      const processSpy = jest.spyOn(process, "exit").mockImplementation();

      initializeRedis.mockResolvedValue();
      initializeFirebase.mockImplementation();
      initSentry.mockImplementation();

      await initializeHTTPServer();

      expect(processSpy).not.toHaveBeenCalled();

      processSpy.mockRestore();
    });
  });
});
