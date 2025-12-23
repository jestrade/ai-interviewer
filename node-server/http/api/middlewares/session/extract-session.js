import InterviewSessionService from "../../../../services/interview-session/index.js";

export async function extractSession(req, res, next) {
  const sessionId = req.headers["x-session-id"] || req.query.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const session = await InterviewSessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    req.sessionData = session;
    req.sessionId = sessionId;

    // Extend session TTL on each request
    await InterviewSessionService.extendSession(sessionId);

    next();
  } catch (error) {
    console.error("Error extracting session:", error);
    return res.status(500).json({ error: "Failed to extract session" });
  }
}

export default extractSession;
