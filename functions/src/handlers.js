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
import { requireAccess, requireAdmin, identify, normalizeEmail } from "./access.js";
import { invite, listInvitees, revoke } from "./services/invitation-service.js";
import { recordInterviewAttempt, upsertUser } from "./services/user-service.js";

const endResponse = (text) => ({ text, emotion: "serious", code: CODES.END_INTERVIEW });

const requireString = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field} is required`);
  }
  return value;
};

/** Loads the session or fails; also slides its expiry (was `extractSession`). */
const loadSession = async (sessionId, email) => {
  requireString(sessionId, "sessionId");
  const session = await Sessions.getSession(sessionId);
  if (!session || session.email !== email) {
    throw new HttpsError("not-found", "Session not found or expired");
  }
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
    return await fn(request.data ?? {}, request);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error(`${name} failed`, error);
    throw new HttpsError("internal", `Failed in ${name}`);
  }
};

export const wakeup = wrap("wakeup", async () => ({ message: "wakeup", success: true }));

/** Who am I and may I use the app? Never throws for uninvited users. */
export const whoami = wrap("whoami", async (_data, request) => {
  const { email, isAdmin, allowed } = await identify(request);
  return { email, isAdmin, allowed };
});

export const init = wrap("init", async ({ role }, request) => {
  const { email, name, isAdmin } = await requireAccess(request);
  requireString(role, "role");
  const sessionId = await Sessions.createSession(email, role);
  await recordInterviewAttempt({ email, name, role });
  await createAuditRecord({
    action: "init",
    collection: COLLECTIONS.interviews,
    user: { email, role },
  });
  return { message: "Session started", success: true, sessionId, isAdmin };
});

export const createUserHandler = wrap("createUser", async ({ name }, request) => {
  const caller = await requireAccess(request);
  const user = await upsertUser({ email: caller.email, name: name || caller.name });
  return { success: true, user };
});

export const sendMessage = wrap("sendMessage", async ({ sessionId, message, audio }, request) => {
  const { email } = await requireAccess(request);
  const session = await loadSession(sessionId, email);

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

  const { text: replyText, emotion } = await generateInterviewReply({
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

  return { text: replyText, emotion, code };
});

export const endInterview = wrap("endInterview", async ({ sessionId }, request) => {
  const { email } = await requireAccess(request);
  const session = await loadSession(sessionId, email);
  await createAuditRecord({
    action: "end",
    reason: AUDIT_REASONS.userRequest,
    collection: COLLECTIONS.interviews,
    user: { email: session.email, role: session.role },
  });
  await Sessions.logout(sessionId);
  return endResponse("Interview ended.");
});

export const getFeedback = wrap("getFeedback", async ({ sessionId }, request) => {
  const { email } = await requireAccess(request);
  const session = await loadSession(sessionId, email);
  const feedback = await generateFeedback(session.interviewHistoryForFeedback ?? []);
  await createAuditRecord({
    action: "feedback",
    reason: AUDIT_REASONS.userRequest,
    collection: COLLECTIONS.interviews,
    user: { email: session.email, role: session.role },
  });
  return { feedback };
});

// ---- Admin ----

export const listInvitations = wrap("listInvitations", async (_data, request) => {
  await requireAdmin(request);
  return { invitations: await listInvitees() };
});

export const inviteUser = wrap("inviteUser", async ({ email }, request) => {
  const admin = await requireAdmin(request);
  const target = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
    throw new HttpsError("invalid-argument", "A valid email is required");
  }
  const { created } = await invite(target, admin.email);
  return { email: target, created };
});

export const revokeInvitation = wrap("revokeInvitation", async ({ email }, request) => {
  await requireAdmin(request);
  await revoke(normalizeEmail(email));
  return { success: true };
});
