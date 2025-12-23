import { INTERVIEW_STATUS, CODES } from "../../../../constants.js";

export async function checkSession(req, res, next) {
  if (!req.sessionData) {
    res.json({
      text: "Session not found",
      code: CODES.END_INTERVIEW,
    });
    return;
  }

  if (req.sessionData.interviewStatus === INTERVIEW_STATUS.ENDED) {
    res.json({
      text: "Interview has ended",
      code: CODES.END_INTERVIEW,
    });
    return;
  }
  if (!req.sessionData.interviewHistory) {
    res.json({
      text: "History missing",
      code: CODES.END_INTERVIEW,
    });
    return;
  }
  if (!req.sessionData.role) {
    res.json({
      text: "Role missing",
      code: CODES.END_INTERVIEW,
    });
    return;
  }

  next();
}
