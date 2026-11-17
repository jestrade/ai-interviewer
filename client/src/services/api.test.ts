import { apiFunctions } from "./api";
import sessionStorage from "./session-storage";

const callable = jest.fn();

jest.mock("firebase/functions", () => ({
  httpsCallable: (_fns: unknown, name: string) => (data: unknown) => callable(name, data),
}));
jest.mock("./firebase", () => ({ functions: {} }));
jest.mock("@/services/sentry", () => ({ notifyError: jest.fn() }));

beforeEach(() => {
  callable.mockReset();
  localStorage.clear();
});

describe("apiFunctions", () => {
  it("stores the session id returned by init", async () => {
    callable.mockResolvedValue({ data: { success: true, sessionId: "abc" } });
    await apiFunctions.authenticate({ email: "a@b.c", role: "ceo" });

    expect(callable).toHaveBeenCalledWith("init", { email: "a@b.c", role: "ceo" });
    expect(sessionStorage.getSessionId()).toBe("abc");
  });

  it("sends the stored session id with each message", async () => {
    sessionStorage.setSessionId("abc");
    callable.mockResolvedValue({ data: { text: "ok" } });
    await apiFunctions.sendMessage("hi");

    expect(callable).toHaveBeenCalledWith("sendMessage", { sessionId: "abc", message: "hi" });
  });

  it("clears the session when the interview ends", async () => {
    sessionStorage.setSessionId("abc");
    callable.mockResolvedValue({ data: {} });
    await apiFunctions.endInterview();

    expect(sessionStorage.hasSessionId()).toBe(false);
  });

  it("rethrows callable errors", async () => {
    callable.mockRejectedValue(new Error("nope"));
    await expect(apiFunctions.getFeedback()).rejects.toThrow("nope");
  });
});
