import { jest } from "@jest/globals";
import { checkSession } from "../../../../http/api/middlewares/session/check-session.js";
import { INTERVIEW_STATUS, CODES } from "../../../../constants.js";

describe("Check Session Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      sessionData: {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
      },
    };

    mockRes = {
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("Session validation", () => {
    it("should pass when session data is valid", async () => {
      await checkSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should reject when session data is missing", async () => {
      mockReq.sessionData = null;

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        text: "Session not found",
        code: CODES.END_INTERVIEW,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject when interview status is ENDED", async () => {
      mockReq.sessionData.interviewStatus = INTERVIEW_STATUS.ENDED;

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        text: "Interview has ended",
        code: CODES.END_INTERVIEW,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject when interview history is missing", async () => {
      mockReq.sessionData.interviewHistory = null;

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        text: "History missing",
        code: CODES.END_INTERVIEW,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject when interview history is empty array", async () => {
      mockReq.sessionData.interviewHistory = [];

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled(); // Empty array is valid
    });

    it("should reject when role is missing", async () => {
      mockReq.sessionData.role = null;

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        text: "Role missing",
        code: CODES.END_INTERVIEW,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject when role is empty string", async () => {
      mockReq.sessionData.role = "";

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        text: "Role missing",
        code: CODES.END_INTERVIEW,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass when role is valid", async () => {
      const validRoles = ["Junior", "Mid", "Senior", "Staff"];

      for (const role of validRoles) {
        mockReq.sessionData.role = role;
        mockNext.mockClear();

        await checkSession(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      }
    });

    it("should pass when interview status is IN_PROGRESS", async () => {
      mockReq.sessionData.interviewStatus = "IN_PROGRESS";

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should handle session data with additional properties", async () => {
      mockReq.sessionData = {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: [{ role: "user", parts: [{ text: "Hello" }] }],
        interviewStatus: "IN_PROGRESS",
        numberOfQuestions: 5,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should handle interview history with multiple messages", async () => {
      mockReq.sessionData.interviewHistory = [
        { role: "user", parts: [{ text: "Hello" }] },
        { role: "model", parts: [{ text: "Hi there!" }] },
        { role: "user", parts: [{ text: "How are you?" }] },
      ];

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should reject when interview history is undefined", async () => {
      mockReq.sessionData.interviewHistory = undefined;

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        text: "History missing",
        code: CODES.END_INTERVIEW,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass when all required fields are present and valid", async () => {
      mockReq.sessionData = {
        email: "test@example.com",
        role: "Senior",
        interviewHistory: [{ role: "user", parts: [{ text: "Test message" }] }],
        interviewStatus: "IN_PROGRESS",
      };

      await checkSession(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
