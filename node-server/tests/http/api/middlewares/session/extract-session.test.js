import { jest } from "@jest/globals";
import { extractSession } from "../../../../http/api/middlewares/session/extract-session.js";
import InterviewSessionService from "../../../../services/session-service.js";

// Mock dependencies
jest.mock("../../../../services/session-service.js");

describe("Extract Session Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("Session ID extraction", () => {
    it("should extract session ID from headers", async () => {
      const sessionId = "test_session_123";
      mockReq.headers["x-session-id"] = sessionId;

      const sessionData = { email: "test@example.com", role: "Junior" };
      InterviewSessionService.getSession.mockResolvedValue(sessionData);

      await extractSession(mockReq, mockRes, mockNext);

      expect(InterviewSessionService.getSession).toHaveBeenCalledWith(
        sessionId
      );
      expect(mockReq.sessionData).toBe(sessionData);
      expect(mockReq.sessionId).toBe(sessionId);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should extract session ID from query parameters", async () => {
      const sessionId = "test_session_123";
      mockReq.query.sessionId = sessionId;

      const sessionData = { email: "test@example.com", role: "Junior" };
      InterviewSessionService.getSession.mockResolvedValue(sessionData);

      await extractSession(mockReq, mockRes, mockNext);

      expect(InterviewSessionService.getSession).toHaveBeenCalledWith(
        sessionId
      );
      expect(mockReq.sessionData).toBe(sessionData);
      expect(mockReq.sessionId).toBe(sessionId);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should prioritize headers over query parameters", async () => {
      const headerSessionId = "header_session_123";
      const querySessionId = "query_session_456";

      mockReq.headers["x-session-id"] = headerSessionId;
      mockReq.query.sessionId = querySessionId;

      const sessionData = { email: "test@example.com", role: "Junior" };
      InterviewSessionService.getSession.mockResolvedValue(sessionData);

      await extractSession(mockReq, mockRes, mockNext);

      expect(InterviewSessionService.getSession).toHaveBeenCalledWith(
        headerSessionId
      );
      expect(mockReq.sessionId).toBe(headerSessionId);
    });

    it("should return 400 when no session ID provided", async () => {
      await extractSession(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Session ID is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 404 when session not found", async () => {
      mockReq.headers["x-session-id"] = "nonexistent_session";
      InterviewSessionService.getSession.mockResolvedValue(null);

      await extractSession(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Session not found or expired",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 500 when session retrieval fails", async () => {
      mockReq.headers["x-session-id"] = "test_session_123";
      const error = new Error("Redis connection failed");
      InterviewSessionService.getSession.mockRejectedValue(error);

      await extractSession(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to extract session",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should extend session TTL on successful extraction", async () => {
      const sessionId = "test_session_123";
      mockReq.headers["x-session-id"] = sessionId;

      const sessionData = { email: "test@example.com", role: "Junior" };
      InterviewSessionService.getSession.mockResolvedValue(sessionData);
      InterviewSessionService.extendSession.mockResolvedValue();

      await extractSession(mockReq, mockRes, mockNext);

      expect(InterviewSessionService.extendSession).toHaveBeenCalledWith(
        sessionId
      );
    });

    it("should handle case-insensitive header name", async () => {
      const sessionId = "test_session_123";
      mockReq.headers["X-Session-Id"] = sessionId;

      const sessionData = { email: "test@example.com", role: "Junior" };
      InterviewSessionService.getSession.mockResolvedValue(sessionData);

      await extractSession(mockReq, mockRes, mockNext);

      expect(InterviewSessionService.getSession).toHaveBeenCalledWith(
        sessionId
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle empty session ID string", async () => {
      mockReq.headers["x-session-id"] = "";

      await extractSession(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Session ID is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle whitespace-only session ID", async () => {
      mockReq.headers["x-session-id"] = "   ";

      await extractSession(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Session ID is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
