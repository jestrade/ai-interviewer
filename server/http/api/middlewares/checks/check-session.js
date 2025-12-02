import { INTERVIEW_STATUS, CODES } from "../../../../constants.js";

export async function checkSession(req, res, next) {
  if (req.session.interviewStatus === INTERVIEW_STATUS.ENDED) {
    res.json({
      text: "Interview has ended",
      code: CODES.END_INTERVIEW,
    });
    return;
  }
  if (!req.session.interviewHistory) {
    res.json({
      text: "History missing",
      code: CODES.END_INTERVIEW,
    });
    return;
  }
  if (!req.session.role) {
    res.json({
      text: "Role missing",
      code: CODES.END_INTERVIEW,
    });
    return;
  }

  next();
}
