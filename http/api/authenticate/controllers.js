import { INTERVIEW_STATUS } from "../../../constants.js";
import { createAuditRecord } from "../../../services/auditService.js";
import { COLLECTIONS } from "../../../constants.js";

export const init = async (req, res) => {
  try {
    const role = req.body?.role;
    const email = req.body?.email;

    req.session.interviewHistory = [];
    req.session.role = role;
    req.session.email = email;
    req.session.interviewStatus = INTERVIEW_STATUS.IN_PROGRESS;
    req.session.numberOfQuestions = 0;

    await createAuditRecord({
      action: "init",
      collection: COLLECTIONS.interviews,
      user: { email, role },
    });

    res.json({
      message: "Session started",
    });
  } catch (error) {
    console.error("Error initializing interview session:", error);
    res.status(500).json({ error: "Failed to initialize session" });
  }
};
