import { processInterviewMessage } from "../../../services/interview-service.js";
import { END_INTERVIEW_RESPONSES } from "../../../constants.js";
import { INTERVIEW_STATUS, CODES } from "../../../constants.js";
import { createAuditRecord } from "../../../services/audit-service.js";
import { COLLECTIONS, AUDIT_REASONS } from "../../../constants.js";

export async function handleInterviewController(req, res) {
  try {
    const audioBuffer = req.file?.buffer;
    const userText = req.body?.message || "";
    // update context
    req.session.interviewHistory.push({
      role: "user",
      parts: [{ text: userText }],
    });

    const replyText = await processInterviewMessage(
      audioBuffer,
      userText,
      req.session.interviewHistory,
      req.session.interviewStatus,
      req.session.name,
      req.session.role
    );

    // update context
    req.session.interviewHistory.push({
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
        user: { email: req.session.email, role: req.session.role },
      });

      req.session.interviewHistory = [];
      req.session.role = null;
      req.session.interviewStatus = INTERVIEW_STATUS.ENDED;
      code = CODES.END_INTERVIEW;
    }

    res.json({
      text: replyText,
      code,
    });
  } catch (err) {
    console.error("AI interview error:", err);
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
      user: { email: req.session.email, role: req.session.role },
    });

    req.session.interviewHistory = [];
    req.session.role = null;
    req.session.interviewStatus = INTERVIEW_STATUS.ENDED;

    const message = "Interview ended.";
    res.json({
      text: message,
      code: CODES.END_INTERVIEW,
    });
  } catch (error) {
    console.error("Error ending interview:", error);
    res.status(500).json({ error: "Failed to end interview" });
  }
};
