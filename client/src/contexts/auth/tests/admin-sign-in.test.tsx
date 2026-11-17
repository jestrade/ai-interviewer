import { renderHook, act, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import AuthProvider from "../provider";
import { useAuth } from "../hooks";

const signOut = jest.fn();
const whoami = jest.fn();
const toast = jest.fn();

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithPopup: jest.fn(async () => ({
    user: { uid: "u1", email: "a@b.c", displayName: "Ada", photoURL: null },
  })),
  signOut: (...args: unknown[]) => signOut(...args),
}));
jest.mock("@/services/firebase", () => ({ app: {} }));
jest.mock("@/services/api", () => ({
  apiFunctions: { whoami: () => whoami() },
  useAuthApi: () => ({ authenticate: { mutateAsync: jest.fn() }, createUser: { mutateAsync: jest.fn() } }),
}));
jest.mock("@/services/sentry", () => ({ notifyError: jest.fn() }));
jest.mock("@/hooks/use-toast", () => ({ toast: (...args: unknown[]) => toast(...args) }));

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => jest.clearAllMocks());

describe("signInAsAdmin", () => {
  it("signs the admin in without a role", async () => {
    whoami.mockResolvedValue({ allowed: true, isAdmin: true });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signInAsAdmin();
    });

    await waitFor(() => expect(result.current.user).toMatchObject({ email: "a@b.c", role: "", isAdmin: true }));
    expect(signOut).not.toHaveBeenCalled();
  });

  it("rejects and signs out anyone who is not the admin", async () => {
    whoami.mockResolvedValue({ allowed: true, isAdmin: false });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signInAsAdmin();
    });

    expect(result.current.user).toBeNull();
    expect(signOut).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Admin access only" }));
  });
});
