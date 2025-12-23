import { INTERVIEW_STATUS } from "../../../constants.js";
import { createAuditRecord } from "../../../services/audit-service.js";
import { COLLECTIONS } from "../../../constants.js";
import * as Sentry from "@sentry/node";
import config from "../../../config/index.js";
import InterviewSessionService from "../../../services/interview-session/index.js";

export const init = async (req, res) => {
  try {
    const role = req.body?.role;
    const email = req.body?.email;

    const sessionId = await InterviewSessionService.createSession(email, role);

    if (config.mode.isProduction) {
      await createAuditRecord({
        action: "init",
        collection: COLLECTIONS.interviews,
        user: { email, role },
      });
    }

    console.log("Session started for user: " + email + " with role: " + role);

    res.json({
      message: "Session started",
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error("Error initializing interview session:" + error);
    Sentry.captureException(error);
    res.status(500).json({ error: "Failed to initialize session" });
  }
};
