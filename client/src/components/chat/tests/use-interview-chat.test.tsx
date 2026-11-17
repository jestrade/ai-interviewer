import { renderHook, act, waitFor } from "@testing-library/react";
import { useInterviewChat } from "../use-interview-chat";

const mutateAsync = jest.fn();
const toast = jest.fn();
const speakText = jest.fn();

jest.mock("@/services/api", () => ({
  useInterviewApi: () => ({ sendMessage: { mutateAsync } }),
}));
jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
jest.mock("@/services/sentry", () => ({ notifyError: jest.fn() }));
jest.mock("@/lib", () => ({
  speakText: (...args: unknown[]) => speakText(...args),
  interruptSpeech: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: (() => { let i = 0; return () => `id-${i++}`; })() },
    configurable: true,
  });
});

describe("useInterviewChat", () => {
  it("opens the conversation with the interviewer's greeting", async () => {
    mutateAsync.mockResolvedValue({ text: "Hello!", code: null });
    const { result } = renderHook(() => useInterviewChat());

    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(result.current.messages[0]).toMatchObject({ role: "assistant", content: "Hello!" });
    expect(speakText).toHaveBeenCalledWith("Hello!");
  });

  it("appends the user message and the reply on send", async () => {
    mutateAsync.mockResolvedValueOnce({ text: "Hi", code: null });
    const { result } = renderHook(() => useInterviewChat());
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    mutateAsync.mockResolvedValueOnce({ text: "Next question", code: null });
    await act(async () => {
      await result.current.send("  my answer ");
    });

    expect(mutateAsync).toHaveBeenLastCalledWith("my answer");
    expect(result.current.messages.map((m) => m.role)).toEqual(["assistant", "user", "assistant"]);
  });

  it("ignores blank input", async () => {
    mutateAsync.mockResolvedValue({ text: "Hi", code: null });
    const { result } = renderHook(() => useInterviewChat());
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    act(() => {
      result.current.send("   ");
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("marks the interview as ended when the server says so", async () => {
    mutateAsync.mockResolvedValue({ text: "Goodbye", code: "end-interview" });
    const { result } = renderHook(() => useInterviewChat());

    await waitFor(() => expect(result.current.isEnded).toBe(true));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Interview ended" }));
  });

  it("reports an error toast when the request fails", async () => {
    mutateAsync.mockRejectedValue(new Error("boom"));
    renderHook(() => useInterviewChat());

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" }))
    );
  });
});
