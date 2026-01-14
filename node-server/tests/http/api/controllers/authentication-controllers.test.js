import { jest } from "@jest/globals";
import { init } from "../../../http/api/controllers/authentication-controllers.js";
import InterviewSessionService from "../../../services/session-service.js";
import { createAuditRecord } from "../../../services/audit-service.js";
import config from "../../../config/index.js";

// Mock dependencies
jest.mock("../../../services/session-service.js");
jest.mock("../../../services/audit-service.js");
jest.mock("../../../config/index.js");
jest.mock("@sentry/node");

describe("Authentication Controllers", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        role: "Junior",
        email: "test@example.com",
      },
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Mock config
    config.mode = {
      isProduction: false,
    };
  });

  describe("init", () => {
    it("should create a new session and return session ID", async () => {
      const mockSessionId = "test_session_123";
      InterviewSessionService.createSession.mockResolvedValue(mockSessionId);

      await init(mockReq, mockRes);

      expect(InterviewSessionService.createSession).toHaveBeenCalledWith(
        "test@example.com",
        "Junior"
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Session started",
        success: true,
        sessionId: mockSessionId,
      });
    });

    it("should create audit record in production", async () => {
      config.mode.isProduction = true;
      const mockSessionId = "test_session_123";
      InterviewSessionService.createSession.mockResolvedValue(mockSessionId);

      await init(mockReq, mockRes);

      expect(createAuditRecord).toHaveBeenCalledWith({
        action: "init",
        collection: "interviews",
        user: { email: "test@example.com", role: "Junior" },
      });
    });

    it("should not create audit record in development", async () => {
      config.mode.isProduction = false;
      const mockSessionId = "test_session_123";
      InterviewSessionService.createSession.mockResolvedValue(mockSessionId);

      await init(mockReq, mockRes);

      expect(createAuditRecord).not.toHaveBeenCalled();
    });

    it("should handle missing role in request body", async () => {
      mockReq.body = {
        email: "test@example.com",
      };

      await init(mockReq, mockRes);

      expect(InterviewSessionService.createSession).toHaveBeenCalledWith(
        "test@example.com",
        undefined
      );
    });

    it("should handle missing email in request body", async () => {
      mockReq.body = {
        role: "Junior",
      };

      await init(mockReq, mockRes);

      expect(InterviewSessionService.createSession).toHaveBeenCalledWith(
        undefined,
        "Junior"
      );
    });

    it("should handle session creation errors", async () => {
      const error = new Error("Session creation failed");
      InterviewSessionService.createSession.mockRejectedValue(error);

      await init(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to initialize session",
      });
      expect(
        jest.requireMock("@sentry/node").captureException
      ).toHaveBeenCalledWith(error);
    });

    it("should log session start message", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const mockSessionId = "test_session_123";
      InterviewSessionService.createSession.mockResolvedValue(mockSessionId);

      await init(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Session started for user: test@example.com with role: Junior"
      );

      consoleSpy.mockRestore();
    });
  });
});
