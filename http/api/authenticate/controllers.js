import { INTERVIEW_STATUS } from "../../../constants.js";

export const init = async (req, res) => {
  try {
    req.session.interviewHistory = [];
    req.session.role = req.body?.role;
    req.session.interviewStatus = INTERVIEW_STATUS.IN_PROGRESS;
    req.session.numberOfQuestions = 0;

    res.json({
      message: "Session started",
    });
  } catch (error) {
    console.error("Error initializing interview session:", error);
    res.status(500).json({ error: "Failed to initialize session" });
  }
};
