import { processInterviewMessage } from "../../../services/index.js";
import { END_INTERVIEW_RESPONSES } from "../../../constants.js";
import { INTERVIEW_STATUS, CODES } from "../../../constants.js";

export async function handleInterview(req, res) {
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
      req.session.role,
      req.session
    );

    // update context
    req.session.interviewHistory.push({
      role: "model",
      parts: [{ text: replyText }],
    });

    let code = null;
    // end interview
    if (END_INTERVIEW_RESPONSES.some((item) => replyText.includes(item))) {
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

export const endInterview = async (req, res) => {
  // end interview
  try {
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
