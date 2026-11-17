import { randomUUID } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";
import {
  COLLECTIONS,
  INTERVIEW_STATUS,
} from "../constants.js";
import { SESSION_TTL_MS } from "../config.js";

const sessions = () => getFirestore().collection(COLLECTIONS.sessions);
const expiry = () => new Date(Date.now() + SESSION_TTL_MS);

/**
 * Session persistence on Firestore (replaces the former Redis store).
 * Sessions expire SESSION_TTL_MS after their last use; `expiresAt` also
 * allows a Firestore TTL policy to purge old documents.
 */
export class InterviewSessionService {
  static async createSession(email, role) {
    const sessionId = randomUUID();
    await sessions().doc(sessionId).set({
      email,
      role,
      interviewHistory: [],
      interviewStatus: INTERVIEW_STATUS.IN_PROGRESS,
      numberOfQuestions: 0,
      createdAt: new Date().toISOString(),
      expiresAt: expiry(),
    });
    return sessionId;
  }

  static async getSession(sessionId) {
    if (!sessionId || typeof sessionId !== "string") return null;
    const snapshot = await sessions().doc(sessionId).get();
    if (!snapshot.exists) return null;

    const { expiresAt, ...data } = snapshot.data();
    if (expiresAt && expiresAt.toMillis() < Date.now()) return null;
    return data;
  }

  static async updateSession(sessionId, updates) {
    const ref = sessions().doc(sessionId);
    await ref.update({ ...updates, expiresAt: expiry() });
    return this.getSession(sessionId);
  }

  static async addToHistory(sessionId, message) {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");
    return this.updateSession(sessionId, {
      interviewHistory: [...session.interviewHistory, message],
    });
  }

  /** Interview concluded by the AI: keep the transcript for feedback. */
  static async endSession(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");
    return this.updateSession(sessionId, {
      interviewStatus: INTERVIEW_STATUS.ENDED,
      interviewHistoryForFeedback: session.interviewHistory,
      interviewHistory: [],
      role: null,
    });
  }

  /** Interview ended by the user or by a violation: discard the transcript. */
  static async logout(sessionId) {
    return this.updateSession(sessionId, {
      interviewStatus: INTERVIEW_STATUS.ENDED,
      interviewHistoryForFeedback: [],
      interviewHistory: [],
      role: null,
    });
  }

  static async extendSession(sessionId) {
    await sessions().doc(sessionId).update({ expiresAt: expiry() });
  }
}

export default InterviewSessionService;
