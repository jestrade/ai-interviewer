import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import {
  AUDIT_REASONS,
  CODES,
  COLLECTIONS,
  END_INTERVIEW_RESPONSES,
  INTERVIEW_STATUS,
} from "./constants.js";
import { getOffensiveKeywords } from "./config.js";
import { createAuditRecord } from "./services/audit-service.js";
import {
  generateFeedback,
  generateInterviewReply,
} from "./services/interview-service.js";
import Sessions from "./services/session-service.js";
import { createUser } from "./services/user-service.js";

const endResponse = (text) => ({ text, code: CODES.END_INTERVIEW });

const requireString = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field} is required`);
  }
  return value;
};

/** Loads the session or fails; also slides its expiry (was `extractSession`). */
const loadSession = async (sessionId) => {
  requireString(sessionId, "sessionId");
  const session = await Sessions.getSession(sessionId);
  if (!session) throw new HttpsError("not-found", "Session not found or expired");
  await Sessions.extendSession(sessionId);
  return session;
};

/** Returns an end-of-interview response when the session cannot continue (was `checkSession`). */
const sessionBlocker = (session) => {
  if (session.interviewStatus === INTERVIEW_STATUS.ENDED) return "Interview has ended";
  if (!session.interviewHistory) return "History missing";
  if (!session.role) return "Role missing";
  return null;
};

const wrap = (name, fn) => async (request) => {
  try {
    return await fn(request.data ?? {});
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error(`${name} failed`, error);
    throw new HttpsError("internal", `Failed in ${name}`);
  }
};

export const wakeup = wrap("wakeup", async () => ({ message: "wakeup", success: true }));

export const init = wrap("init", async ({ email, role }) => {
  requireString(email, "email");
  requireString(role, "role");
  const sessionId = await Sessions.createSession(email, role);
  await createAuditRecord({
    action: "init",
    collection: COLLECTIONS.interviews,
    user: { email, role },
  });
  return { message: "Session started", success: true, sessionId };
});

export const createUserHandler = wrap("createUser", async ({ name, email }) => {
  requireString(email, "email");
  const user = await createUser({ name, email });
  return { success: true, user };
});

export const sendMessage = wrap("sendMessage", async ({ sessionId, message, audio }) => {
  const session = await loadSession(sessionId);

  const blocked = sessionBlocker(session);
  if (blocked) return endResponse(blocked);

  const userText = typeof message === "string" ? message : "";
  if (!userText && !audio) {
    throw new HttpsError("invalid-argument", "Missing audio or text input");
  }

  const normalized = userText.toLowerCase();
  if (getOffensiveKeywords().some((word) => normalized.includes(word))) {
    await createAuditRecord({
      action: "end",
      reason: AUDIT_REASONS.offensiveLanguage,
      collection: COLLECTIONS.interviews,
      user: { email: session.email, role: session.role },
    });
    await Sessions.logout(sessionId);
    return endResponse("Offensive language detected. The interview has ended.");
  }

  const withUserTurn = await Sessions.addToHistory(sessionId, {
    role: "user",
    parts: [{ text: userText }],
  });

  const replyText = await generateInterviewReply({
    history: withUserTurn.interviewHistory,
    name: session.name,
    role: session.role,
    audio,
  });

  await Sessions.addToHistory(sessionId, {
    role: "model",
    parts: [{ text: replyText }],
  });

  let code = null;
  if (END_INTERVIEW_RESPONSES.some((item) => replyText.includes(item))) {
    await createAuditRecord({
      action: "end",
      reason: AUDIT_REASONS.ai,
      collection: COLLECTIONS.interviews,
      user: { email: session.email, role: session.role },
    });
    await Sessions.endSession(sessionId);
    code = CODES.END_INTERVIEW;
  }

  return { text: replyText, code };
});

export const endInterview = wrap("endInterview", async ({ sessionId }) => {
  const session = await loadSession(sessionId);
  await createAuditRecord({
    action: "end",
    reason: AUDIT_REASONS.userRequest,
    collection: COLLECTIONS.interviews,
    user: { email: session.email, role: session.role },
  });
  await Sessions.logout(sessionId);
  return endResponse("Interview ended.");
});

export const getFeedback = wrap("getFeedback", async ({ sessionId }) => {
  const session = await loadSession(sessionId);
  const feedback = await generateFeedback(session.interviewHistoryForFeedback ?? []);
  await createAuditRecord({
    action: "feedback",
    reason: AUDIT_REASONS.userRequest,
    collection: COLLECTIONS.interviews,
    user: { email: session.email, role: session.role },
  });
  return { feedback };
});
