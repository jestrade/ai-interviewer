import { INTERVIEW_STATUS, CODES } from "../../../../constants.js";
import { createAuditRecord } from "../../../../services/audits-service.js";
import { COLLECTIONS, AUDIT_REASONS } from "../../../../constants.js";
import config from "../../../../config/index.js";

const OFFENSIVE_KEYWORDS = config.offensiveKeywords;

export async function checkOffensiveLanguage(req, res, next) {
  const text = req.body?.message || "";
  if (!text) return false;
  const normalized = text.toLowerCase();
  if (OFFENSIVE_KEYWORDS.some((word) => normalized.includes(word))) {
    await createAuditRecord({
      action: "end",
      reason: AUDIT_REASONS.offensiveLanguage,
      collection: COLLECTIONS.interviews,
      user: { email: req.session.email, role: req.session.role },
    });

    // end interview
    req.session.interviewHistory = [];
    req.session.role = null;
    req.session.interviewStatus = INTERVIEW_STATUS.ENDED;

    return res.json({
      text: "Offensive language detected. The interview has ended.",
      code: CODES.END_INTERVIEW,
    });
  }

  next();
}
