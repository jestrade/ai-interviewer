import { INTERVIEW_STATUS, CODES } from "../../../../constants.js";

const OFFENSIVE_KEYWORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "motherfucker",
  "idiot",
  "racist",
  "nigger",
  "spic",
  "faggot",
];

export async function checkOffensiveLanguage(req, res, next) {
  const text = req.body?.message || "";
  if (!text) return false;
  const normalized = text.toLowerCase();
  if (OFFENSIVE_KEYWORDS.some((word) => normalized.includes(word))) {
    // end interview
    req.session.interviewHistory = [];
    req.session.role = null;
    req.session.interviewStatus = INTERVIEW_STATUS.ENDED;

    return res.json({
      text: "Offensive language detected. Interview ended.",
      code: CODES.END_INTERVIEW,
    });
  }

  next();
}
