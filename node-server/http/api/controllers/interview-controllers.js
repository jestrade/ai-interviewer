import { processInterviewMessage } from "../../../services/interview-service.js";
import { END_INTERVIEW_RESPONSES } from "../../../constants.js";
import { INTERVIEW_STATUS, CODES } from "../../../constants.js";
import { createAuditRecord } from "../../../services/audit-service.js";
import { COLLECTIONS, AUDIT_REASONS } from "../../../constants.js";
import * as Sentry from "@sentry/node";
import InterviewSessionService from "../../../services/interview-session/index.js";

export async function handleInterviewController(req, res) {
  try {
    const audioBuffer = req.file?.buffer;
    const userText = req.body?.message || "";

    // Add user message to history
    await InterviewSessionService.addToHistory(req.sessionId, {
      role: "user",
      parts: [{ text: userText }],
    });

    // Get updated session data
    const sessionData = await InterviewSessionService.getSession(req.sessionId);

    const replyText = await processInterviewMessage(
      audioBuffer,
      userText,
      sessionData.interviewHistory,
      sessionData.interviewStatus,
      sessionData.name,
      sessionData.role
    );

    // Add AI response to history
    await InterviewSessionService.addToHistory(req.sessionId, {
      role: "model",
      parts: [{ text: replyText }],
    });

    let code = null;

    // end interview
    if (END_INTERVIEW_RESPONSES.some((item) => replyText.includes(item))) {
      await createAuditRecord({
        action: "end",
        reason: AUDIT_REASONS.ai,
        collection: COLLECTIONS.interviews,
        user: { email: sessionData.email, role: sessionData.role },
      });

      await InterviewSessionService.endSession(req.sessionId);
      code = CODES.END_INTERVIEW;
    }

    res.json({
      text: replyText,
      code,
    });
  } catch (err) {
    console.error("AI interview error:", err);
    Sentry.captureException(err);
    res.status(500).json({ error: "AI interview error", details: err.message });
  }
}

export const endInterviewController = async (req, res) => {
  // end interview
  try {
    await createAuditRecord({
      action: "end",
      reason: AUDIT_REASONS.userRequest,
      collection: COLLECTIONS.interviews,
      user: { email: req.sessionData.email, role: req.sessionData.role },
    });

    await InterviewSessionService.endSession(req.sessionId);

    const message = "Interview ended.";
    res.json({
      text: message,
      code: CODES.END_INTERVIEW,
    });
  } catch (error) {
    console.error("Error ending interview:" + error);
    Sentry.captureException(error);
    res.status(500).json({ error: "Failed to end interview" });
  }
};
