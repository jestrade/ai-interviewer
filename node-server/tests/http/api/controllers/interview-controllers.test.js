import { jest } from "@jest/globals";
import {
  handleInterviewController,
  endInterviewController,
} from "../../../http/api/controllers/interview-controllers.js";
import { processInterviewMessage } from "../../../services/interview-service.js";
import InterviewSessionService from "../../../services/session-service.js";
import { createAuditRecord } from "../../../services/audit-service.js";
import {
  END_INTERVIEW_RESPONSES,
  INTERVIEW_STATUS,
  CODES,
  AUDIT_REASONS,
} from "../../../constants.js";

// Mock dependencies
jest.mock("../../../services/interview-service.js");
jest.mock("../../../services/session-service.js");
jest.mock("../../../services/audit-service.js");
jest.mock("@sentry/node");

describe("Interview Controllers", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      file: {
        buffer: Buffer.from("mock audio data"),
      },
      body: {
        message: "This is my answer",
      },
      sessionId: "test_session_123",
      sessionData: {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
      },
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("handleInterviewController", () => {
    it("should process interview message and update history", async () => {
      const replyText = "That sounds good! Can you tell me more?";
      const updatedSession = {
        ...mockReq.sessionData,
        interviewHistory: [
          { role: "user", parts: [{ text: "This is my answer" }] },
        ],
      };

      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.getSession.mockResolvedValue(updatedSession);
      processInterviewMessage.mockResolvedValue(replyText);

      await handleInterviewController(mockReq, mockRes);

      expect(InterviewSessionService.addToHistory).toHaveBeenCalledWith(
        "test_session_123",
        {
          role: "user",
          parts: [{ text: "This is my answer" }],
        }
      );

      expect(processInterviewMessage).toHaveBeenCalledWith(
        mockReq.file.buffer,
        "This is my answer",
        updatedSession.interviewHistory,
        updatedSession.interviewStatus,
        updatedSession.name,
        updatedSession.role
      );

      expect(InterviewSessionService.addToHistory).toHaveBeenCalledWith(
        "test_session_123",
        {
          role: "model",
          parts: [{ text: replyText }],
        }
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        text: replyText,
        code: null,
      });
    });

    it("should end interview when AI response contains end phrase", async () => {
      const replyText =
        "Thank you for your time. This concludes our interview.";
      const updatedSession = {
        ...mockReq.sessionData,
        interviewHistory: [
          { role: "user", parts: [{ text: "This is my answer" }] },
        ],
      };

      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.getSession.mockResolvedValue(updatedSession);
      processInterviewMessage.mockResolvedValue(replyText);

      await handleInterviewController(mockReq, mockRes);

      expect(createAuditRecord).toHaveBeenCalledWith({
        action: "end",
        reason: AUDIT_REASONS.ai,
        collection: "interviews",
        user: { email: "test@example.com", role: "Junior" },
      });

      expect(InterviewSessionService.endSession).toHaveBeenCalledWith(
        "test_session_123"
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        text: replyText,
        code: CODES.END_INTERVIEW,
      });
    });

    it("should handle audio input when no text message provided", async () => {
      mockReq.body = {};
      const replyText = "I understand your audio response.";
      const updatedSession = {
        ...mockReq.sessionData,
        interviewHistory: [],
      };

      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.getSession.mockResolvedValue(updatedSession);
      processInterviewMessage.mockResolvedValue(replyText);

      await handleInterviewController(mockReq, mockRes);

      expect(processInterviewMessage).toHaveBeenCalledWith(
        mockReq.file.buffer,
        "",
        updatedSession.interviewHistory,
        updatedSession.interviewStatus,
        updatedSession.name,
        updatedSession.role
      );
    });

    it("should handle processing errors", async () => {
      const error = new Error("AI processing failed");
      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.getSession.mockRejectedValue(error);

      await handleInterviewController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "AI interview error",
        details: "AI processing failed",
      });
      expect(
        jest.requireMock("@sentry/node").captureException
      ).toHaveBeenCalledWith(error);
    });

    it("should handle missing audio buffer", async () => {
      mockReq.file = null;
      const replyText = "I understand your response.";
      const updatedSession = {
        ...mockReq.sessionData,
        interviewHistory: [],
      };

      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.getSession.mockResolvedValue(updatedSession);
      processInterviewMessage.mockResolvedValue(replyText);

      await handleInterviewController(mockReq, mockRes);

      expect(processInterviewMessage).toHaveBeenCalledWith(
        undefined,
        "This is my answer",
        updatedSession.interviewHistory,
        updatedSession.interviewStatus,
        updatedSession.name,
        updatedSession.role
      );
    });
  });

  describe("endInterviewController", () => {
    it("should end interview and create audit record", async () => {
      InterviewSessionService.endSession.mockResolvedValue();

      await endInterviewController(mockReq, mockRes);

      expect(createAuditRecord).toHaveBeenCalledWith({
        action: "end",
        reason: AUDIT_REASONS.userRequest,
        collection: "interviews",
        user: { email: "test@example.com", role: "Junior" },
      });

      expect(InterviewSessionService.endSession).toHaveBeenCalledWith(
        "test_session_123"
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        text: "Interview ended.",
        code: CODES.END_INTERVIEW,
      });
    });

    it("should handle end interview errors", async () => {
      const error = new Error("Failed to end interview");
      InterviewSessionService.endSession.mockRejectedValue(error);

      await endInterviewController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to end interview",
      });
      expect(
        jest.requireMock("@sentry/node").captureException
      ).toHaveBeenCalledWith(error);
    });

    it("should handle missing session data", async () => {
      mockReq.sessionData = null;

      await endInterviewController(mockReq, mockRes);

      expect(createAuditRecord).toHaveBeenCalledWith({
        action: "end",
        reason: AUDIT_REASONS.userRequest,
        collection: "interviews",
        user: { email: undefined, role: undefined },
      });
    });
  });
});
