import { jest } from "@jest/globals";
import { createClient } from "redis";
import { initializeRedis, getRedisClient } from "../../services/redis/index.js";

// Mock the redis module
jest.mock("redis");

describe("Redis Service", () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      connect: jest.fn().mockResolvedValue(),
      disconnect: jest.fn().mockResolvedValue(),
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
      on: jest.fn(),
      ping: jest.fn().mockResolvedValue("PONG"),
    };

    createClient.mockReturnValue(mockClient);

    // Reset the module state
    jest.resetModules();
  });

  describe("initializeRedis", () => {
    it("should initialize Redis client successfully", async () => {
      const result = await initializeRedis();

      expect(createClient).toHaveBeenCalledWith({
        username: "test-user",
        password: "test-pass",
        socket: {
          host: "localhost",
          port: 6379,
        },
      });

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.on).toHaveBeenCalledWith("error", expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith(
        "connect",
        expect.any(Function)
      );
      expect(result).toBe(mockClient);
    });

    it("should handle Redis connection errors", async () => {
      const error = new Error("Connection failed");
      mockClient.connect.mockRejectedValue(error);

      await expect(initializeRedis()).rejects.toThrow("Connection failed");
    });

    it("should handle Redis client errors", async () => {
      const error = new Error("Redis error");

      await initializeRedis();

      // Get the error handler function
      const errorHandler = mockClient.on.mock.calls.find(
        (call) => call[0] === "error"
      )[1];

      // Call the error handler
      errorHandler(error);

      // Verify Sentry is called (mocked in setup)
      expect(
        jest.requireMock("@sentry/node").captureException
      ).toHaveBeenCalledWith(error);
    });

    it("should log successful connection", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await initializeRedis();

      // Get the connect handler
      const connectHandler = mockClient.on.mock.calls.find(
        (call) => call[0] === "connect"
      )[1];

      // Call the connect handler
      connectHandler();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Redis connection established successfully"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getRedisClient", () => {
    it("should return the initialized client", async () => {
      await initializeRedis();
      const client = getRedisClient();

      expect(client).toBe(mockClient);
    });

    it("should throw error if Redis not initialized", () => {
      expect(() => getRedisClient()).toThrow("Redis client not initialized");
    });
  });

  describe("Redis client operations", () => {
    beforeEach(async () => {
      await initializeRedis();
    });

    it("should perform get operation", async () => {
      mockClient.get.mockResolvedValue("test-value");

      const client = getRedisClient();
      const result = await client.get("test-key");

      expect(mockClient.get).toHaveBeenCalledWith("test-key");
      expect(result).toBe("test-value");
    });

    it("should perform setEx operation", async () => {
      mockClient.setEx.mockResolvedValue("OK");

      const client = getRedisClient();
      const result = await client.setEx("test-key", 3600, "test-value");

      expect(mockClient.setEx).toHaveBeenCalledWith(
        "test-key",
        3600,
        "test-value"
      );
      expect(result).toBe("OK");
    });

    it("should perform del operation", async () => {
      mockClient.del.mockResolvedValue(1);

      const client = getRedisClient();
      const result = await client.del("test-key");

      expect(mockClient.del).toHaveBeenCalledWith("test-key");
      expect(result).toBe(1);
    });

    it("should perform expire operation", async () => {
      mockClient.expire.mockResolvedValue(1);

      const client = getRedisClient();
      const result = await client.expire("test-key", 3600);

      expect(mockClient.expire).toHaveBeenCalledWith("test-key", 3600);
      expect(result).toBe(1);
    });
  });
});
