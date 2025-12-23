import { getRedisClient } from "../redis/index.js";

const SESSION_PREFIX = "interview:";
const SESSION_TTL = 3600; // 1 hour in seconds

export class InterviewSessionService {
  static async createSession(email, role) {
    const client = getRedisClient();
    const sessionId = this.generateSessionId(email);
    const sessionKey = SESSION_PREFIX + sessionId;

    const sessionData = {
      email,
      role,
      interviewHistory: [],
      interviewStatus: "IN_PROGRESS",
      numberOfQuestions: 0,
      createdAt: new Date().toISOString(),
    };

    await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(sessionData));
    return sessionId;
  }

  static async getSession(sessionId) {
    const client = getRedisClient();
    const sessionKey = SESSION_PREFIX + sessionId;
    const sessionData = await client.get(sessionKey);

    if (!sessionData) {
      return null;
    }

    return JSON.parse(sessionData);
  }

  static async updateSession(sessionId, updates) {
    const client = getRedisClient();
    const sessionKey = SESSION_PREFIX + sessionId;
    const currentSession = await this.getSession(sessionId);

    if (!currentSession) {
      throw new Error("Session not found");
    }

    const updatedSession = { ...currentSession, ...updates };
    await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(updatedSession));
    return updatedSession;
  }

  static async addToHistory(sessionId, message) {
    const client = getRedisClient();
    const sessionKey = SESSION_PREFIX + sessionId;
    const currentSession = await this.getSession(sessionId);

    if (!currentSession) {
      throw new Error("Session not found");
    }

    const updatedHistory = [...currentSession.interviewHistory, message];
    return await this.updateSession(sessionId, {
      interviewHistory: updatedHistory,
    });
  }

  static async endSession(sessionId) {
    return await this.updateSession(sessionId, {
      interviewStatus: "ENDED",
      interviewHistory: [],
      role: null,
    });
  }

  static async deleteSession(sessionId) {
    const client = getRedisClient();
    const sessionKey = SESSION_PREFIX + sessionId;
    await client.del(sessionKey);
  }

  static generateSessionId(email) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${email}_${timestamp}_${random}`;
  }

  static async extendSession(sessionId) {
    const client = getRedisClient();
    const sessionKey = SESSION_PREFIX + sessionId;
    await client.expire(sessionKey, SESSION_TTL);
  }
}

export default InterviewSessionService;
