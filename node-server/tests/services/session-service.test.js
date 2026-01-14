import { jest } from "@jest/globals";
import InterviewSessionService from "../../services/session-service.js";
import { getRedisClient } from "../../services/redis/index.js";

// Mock Redis client
jest.mock("../../services/redis/index.js");

describe("InterviewSessionService", () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      setEx: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
    };
    getRedisClient.mockReturnValue(mockClient);
  });

  describe("createSession", () => {
    it("should create a new session with correct data", async () => {
      const email = "test@example.com";
      const role = "Junior";

      const sessionId = await InterviewSessionService.createSession(
        email,
        role
      );

      expect(sessionId).toBeDefined();
      expect(sessionId).toContain(email);
      expect(mockClient.setEx).toHaveBeenCalledWith(
        expect.stringMatching(/^interview:/),
        3600,
        expect.stringContaining(email)
      );
    });

    it("should store session data with correct structure", async () => {
      const email = "test@example.com";
      const role = "Senior";

      await InterviewSessionService.createSession(email, role);

      const sessionData = JSON.parse(mockClient.setEx.mock.calls[0][2]);

      expect(sessionData).toEqual({
        email,
        role,
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
        numberOfQuestions: 0,
        createdAt: expect.any(String),
      });
    });
  });

  describe("getSession", () => {
    it("should return parsed session data when session exists", async () => {
      const sessionId = "test_session_123";
      const sessionData = JSON.stringify(global.mockSessionData);

      mockClient.get.mockResolvedValue(sessionData);

      const result = await InterviewSessionService.getSession(sessionId);

      expect(mockClient.get).toHaveBeenCalledWith("interview:test_session_123");
      expect(result).toEqual(global.mockSessionData);
    });

    it("should return null when session does not exist", async () => {
      const sessionId = "nonexistent_session";

      mockClient.get.mockResolvedValue(null);

      const result = await InterviewSessionService.getSession(sessionId);

      expect(result).toBeNull();
    });
  });

  describe("updateSession", () => {
    it("should update session with new data", async () => {
      const sessionId = "test_session_123";
      const currentSession = { ...global.mockSessionData };
      const updates = { interviewStatus: "ENDED" };

      mockClient.get.mockResolvedValue(JSON.stringify(currentSession));

      const result = await InterviewSessionService.updateSession(
        sessionId,
        updates
      );

      expect(mockClient.get).toHaveBeenCalledWith("interview:test_session_123");
      expect(mockClient.setEx).toHaveBeenCalledWith(
        "interview:test_session_123",
        3600,
        expect.stringContaining('"interviewStatus":"ENDED"')
      );
      expect(result.interviewStatus).toBe("ENDED");
    });

    it("should throw error when session not found", async () => {
      const sessionId = "nonexistent_session";
      const updates = { interviewStatus: "ENDED" };

      mockClient.get.mockResolvedValue(null);

      await expect(
        InterviewSessionService.updateSession(sessionId, updates)
      ).rejects.toThrow("Session not found");
    });
  });

  describe("addToHistory", () => {
    it("should add message to interview history", async () => {
      const sessionId = "test_session_123";
      const currentSession = {
        ...global.mockSessionData,
        interviewHistory: [{ role: "user", parts: [{ text: "Hello" }] }],
      };
      const newMessage = { role: "model", parts: [{ text: "Hi there!" }] };

      mockClient.get.mockResolvedValue(JSON.stringify(currentSession));

      await InterviewSessionService.addToHistory(sessionId, newMessage);

      const updatedSession = JSON.parse(mockClient.setEx.mock.calls[0][2]);
      expect(updatedSession.interviewHistory).toHaveLength(2);
      expect(updatedSession.interviewHistory[1]).toEqual(newMessage);
    });

    it("should throw error when session not found", async () => {
      const sessionId = "nonexistent_session";
      const message = { role: "user", parts: [{ text: "Hello" }] };

      mockClient.get.mockResolvedValue(null);

      await expect(
        InterviewSessionService.addToHistory(sessionId, message)
      ).rejects.toThrow("Session not found");
    });
  });

  describe("endSession", () => {
    it("should end session correctly", async () => {
      const sessionId = "test_session_123";
      const currentSession = { ...global.mockSessionData };

      mockClient.get.mockResolvedValue(JSON.stringify(currentSession));

      await InterviewSessionService.endSession(sessionId);

      const updatedSession = JSON.parse(mockClient.setEx.mock.calls[0][2]);
      expect(updatedSession.interviewStatus).toBe("ENDED");
      expect(updatedSession.interviewHistory).toEqual([]);
      expect(updatedSession.role).toBeNull();
    });
  });

  describe("deleteSession", () => {
    it("should delete session from Redis", async () => {
      const sessionId = "test_session_123";

      await InterviewSessionService.deleteSession(sessionId);

      expect(mockClient.del).toHaveBeenCalledWith("interview:test_session_123");
    });
  });

  describe("generateSessionId", () => {
    it("should generate unique session IDs", () => {
      const email = "test@example.com";
      const sessionId1 = InterviewSessionService.generateSessionId(email);
      const sessionId2 = InterviewSessionService.generateSessionId(email);

      expect(sessionId1).toContain(email);
      expect(sessionId2).toContain(email);
      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe("extendSession", () => {
    it("should extend session TTL", async () => {
      const sessionId = "test_session_123";

      await InterviewSessionService.extendSession(sessionId);

      expect(mockClient.expire).toHaveBeenCalledWith(
        "interview:test_session_123",
        3600
      );
    });
  });
});
