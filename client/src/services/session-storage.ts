const SESSION_KEY = "interview_session_id";

export const sessionStorage = {
  setSessionId: (sessionId: string) => {
    localStorage.setItem(SESSION_KEY, sessionId);
  },

  getSessionId: (): string | null => {
    return localStorage.getItem(SESSION_KEY);
  },

  clearSessionId: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  hasSessionId: (): boolean => {
    return !!localStorage.getItem(SESSION_KEY);
  },
};

export default sessionStorage;
