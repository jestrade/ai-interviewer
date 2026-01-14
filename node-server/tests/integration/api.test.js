import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import cors from "cors";
import { initializeRedis } from "../../services/redis/index.js";
import InterviewSessionService from "../../services/session-service.js";
import { init } from "../../http/api/controllers/authentication-controllers.js";
import {
  handleInterviewController,
  endInterviewController,
} from "../../http/api/controllers/interview-controllers.js";
import { extractSession } from "../../http/api/middlewares/session/extract-session.js";
import { checkSession } from "../../http/api/middlewares/session/check-session.js";

// Mock dependencies
jest.mock("../../services/redis/index.js");
jest.mock("../../services/session-service.js");
jest.mock("../../services/firebase/data-access.js");
jest.mock("@sentry/node");

describe("API Integration Tests", () => {
  let app;
  let mockClient;

  beforeEach(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use(cors());

    // Mock Redis client
    mockClient = {
      connect: jest.fn().mockResolvedValue(),
      disconnect: jest.fn().mockResolvedValue(),
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
      on: jest.fn(),
    };

    initializeRedis.mockResolvedValue(mockClient);

    // Setup routes
    app.post("/init", init);

    // Interview routes with middleware
    app.post(
      "/interviews",
      extractSession,
      checkSession,
      handleInterviewController
    );
    app.post("/interviews/end", extractSession, endInterviewController);

    jest.clearAllMocks();
  });

  describe("Authentication Flow", () => {
    it("should complete full interview flow", async () => {
      const sessionId = "test_session_123";
      const userData = {
        email: "test@example.com",
        role: "Junior",
      };

      // Mock session creation
      InterviewSessionService.createSession.mockResolvedValue(sessionId);

      // Step 1: Initialize session
      const initResponse = await request(app)
        .post("/init")
        .send(userData)
        .expect(200);

      expect(initResponse.body).toEqual({
        message: "Session started",
        success: true,
        sessionId,
      });

      expect(InterviewSessionService.createSession).toHaveBeenCalledWith(
        userData.email,
        userData.role
      );

      // Mock session data for subsequent requests
      const sessionData = {
        email: userData.email,
        role: userData.role,
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
      };

      InterviewSessionService.getSession.mockResolvedValue(sessionData);
      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.extendSession.mockResolvedValue();

      // Step 2: Send interview message
      const messageResponse = await request(app)
        .post("/interviews")
        .set("X-Session-ID", sessionId)
        .send({ message: "I want to discuss my experience" })
        .expect(200);

      expect(messageResponse.body).toHaveProperty("text");
      expect(messageResponse.body).toHaveProperty("code");

      expect(InterviewSessionService.getSession).toHaveBeenCalledWith(
        sessionId
      );
      expect(InterviewSessionService.addToHistory).toHaveBeenCalledTimes(2); // User message + AI response

      // Step 3: End interview
      const endResponse = await request(app)
        .post("/interviews/end")
        .set("X-Session-ID", sessionId)
        .expect(200);

      expect(endResponse.body).toEqual({
        text: "Interview ended.",
        code: "END_INTERVIEW",
      });

      expect(InterviewSessionService.endSession).toHaveBeenCalledWith(
        sessionId
      );
    });

    it("should handle requests without session ID", async () => {
      const response = await request(app)
        .post("/interviews")
        .send({ message: "Hello" })
        .expect(400);

      expect(response.body).toEqual({
        error: "Session ID is required",
      });
    });

    it("should handle requests with invalid session ID", async () => {
      InterviewSessionService.getSession.mockResolvedValue(null);

      const response = await request(app)
        .post("/interviews")
        .set("X-Session-ID", "invalid_session")
        .send({ message: "Hello" })
        .expect(404);

      expect(response.body).toEqual({
        error: "Session not found or expired",
      });
    });

    it("should handle ended interview sessions", async () => {
      const sessionId = "ended_session_123";
      const sessionData = {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: [],
        interviewStatus: "ENDED",
      };

      InterviewSessionService.getSession.mockResolvedValue(sessionData);

      const response = await request(app)
        .post("/interviews")
        .set("X-Session-ID", sessionId)
        .send({ message: "Hello" })
        .expect(200);

      expect(response.body).toEqual({
        text: "Interview has ended",
        code: "END_INTERVIEW",
      });
    });

    it("should handle session ID in query parameters", async () => {
      const sessionId = "query_session_123";
      const sessionData = {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
      };

      InterviewSessionService.getSession.mockResolvedValue(sessionData);
      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.extendSession.mockResolvedValue();

      const response = await request(app)
        .post("/interviews")
        .query({ sessionId })
        .send({ message: "Hello" })
        .expect(200);

      expect(response.body).toHaveProperty("text");
      expect(InterviewSessionService.getSession).toHaveBeenCalledWith(
        sessionId
      );
    });

    it("should prioritize session ID from headers over query", async () => {
      const headerSessionId = "header_session_123";
      const querySessionId = "query_session_456";
      const sessionData = {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
      };

      InterviewSessionService.getSession.mockResolvedValue(sessionData);
      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.extendSession.mockResolvedValue();

      const response = await request(app)
        .post("/interviews")
        .set("X-Session-ID", headerSessionId)
        .query({ sessionId: querySessionId })
        .send({ message: "Hello" })
        .expect(200);

      expect(response.body).toHaveProperty("text");
      expect(InterviewSessionService.getSession).toHaveBeenCalledWith(
        headerSessionId
      );
      expect(InterviewSessionService.getSession).not.toHaveBeenCalledWith(
        querySessionId
      );
    });

    it("should handle missing interview history", async () => {
      const sessionId = "no_history_session_123";
      const sessionData = {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: null,
        interviewStatus: "IN_PROGRESS",
      };

      InterviewSessionService.getSession.mockResolvedValue(sessionData);

      const response = await request(app)
        .post("/interviews")
        .set("X-Session-ID", sessionId)
        .send({ message: "Hello" })
        .expect(200);

      expect(response.body).toEqual({
        text: "History missing",
        code: "END_INTERVIEW",
      });
    });

    it("should handle missing role", async () => {
      const sessionId = "no_role_session_123";
      const sessionData = {
        email: "test@example.com",
        role: null,
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
      };

      InterviewSessionService.getSession.mockResolvedValue(sessionData);

      const response = await request(app)
        .post("/interviews")
        .set("X-Session-ID", sessionId)
        .send({ message: "Hello" })
        .expect(200);

      expect(response.body).toEqual({
        text: "Role missing",
        code: "END_INTERVIEW",
      });
    });

    it("should handle initialization with missing data", async () => {
      const sessionId = "test_session_123";
      InterviewSessionService.createSession.mockResolvedValue(sessionId);

      const response = await request(app).post("/init").send({}).expect(200);

      expect(response.body).toHaveProperty("sessionId");
      expect(InterviewSessionService.createSession).toHaveBeenCalledWith(
        undefined,
        undefined
      );
    });

    it("should handle initialization errors", async () => {
      const error = new Error("Session creation failed");
      InterviewSessionService.createSession.mockRejectedValue(error);

      const response = await request(app)
        .post("/init")
        .send({ email: "test@example.com", role: "Junior" })
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to initialize session",
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON in request body", async () => {
      const response = await request(app)
        .post("/init")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);
    });

    it("should handle very large request payloads", async () => {
      const largeMessage = "a".repeat(1000000); // 1MB string

      InterviewSessionService.createSession.mockResolvedValue("test_session");

      const response = await request(app)
        .post("/init")
        .send({
          email: "test@example.com",
          role: "Junior",
          message: largeMessage,
        })
        .expect(200);
    });

    it("should handle concurrent requests", async () => {
      const sessionId = "concurrent_session_123";
      InterviewSessionService.createSession.mockResolvedValue(sessionId);

      const sessionData = {
        email: "test@example.com",
        role: "Junior",
        interviewHistory: [],
        interviewStatus: "IN_PROGRESS",
      };

      InterviewSessionService.getSession.mockResolvedValue(sessionData);
      InterviewSessionService.addToHistory.mockResolvedValue();
      InterviewSessionService.extendSession.mockResolvedValue();

      // Send multiple concurrent requests
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .post("/init")
          .send({ email: "test@example.com", role: "Junior" })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("sessionId");
      });
    });
  });
});
