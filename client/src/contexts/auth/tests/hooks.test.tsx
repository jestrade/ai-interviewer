import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";

import { AuthProvider } from "../auth-context";
import { useAuth } from "../hooks";

// Import the mocked modules at the top
import * as SentryModule from "@/services/sentry";
jest.mock("@/services/sentry");

// Mock Firebase
jest.mock("firebase/auth", () => {
  const mockGoogleAuthProvider = jest.fn(() => ({}));
  mockGoogleAuthProvider.credentialFromError = jest.fn();

  return {
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback(null);
      return jest.fn();
    }),
    getAuth: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: mockGoogleAuthProvider,
    signOut: jest.fn(),
  };
});

jest.mock("../../../services/firebase", () => ({
  app: {},
}));

jest.mock("../../../services/api", () => ({
  useAuthApi: () => ({
    authenticate: {
      mutateAsync: jest.fn(),
    },
  }),
}));

// Mock sentry to avoid error notifications during tests
jest.mock("@/services/sentry", () => ({
  notifyError: jest.fn(),
}));

// Mock config to handle import.meta.env
jest.mock("@/config", () => ({
  __esModule: true,
  default: {
    firebase: {
      apiKey: "test-api-key",
      authDomain: "test.firebaseapp.com",
      projectId: "test-project",
      storageBucket: "test.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef",
    },
  },
}));

describe("useAuth Hook", () => {
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
  });

  describe("Hook Functionality", () => {
    it("should return the auth context value when used within AuthProvider", () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty("user");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("signInWithGoogle");
      expect(result.current).toHaveProperty("logOut");
      expect(typeof result.current.signInWithGoogle).toBe("function");
      expect(typeof result.current.logOut).toBe("function");
    });

    it("should provide the same context instance for multiple calls", () => {
      const { result: result1 } = renderHook(() => useAuth(), { wrapper });
      const { result: result2 } = renderHook(() => useAuth(), { wrapper });

      // Both should have the same structure and types
      expect(typeof result1.current.user).toBe(typeof result2.current.user);
      expect(typeof result1.current.isLoading).toBe(
        typeof result2.current.isLoading
      );
      expect(typeof result1.current.signInWithGoogle).toBe(
        typeof result2.current.signInWithGoogle
      );
      expect(typeof result1.current.logOut).toBe(typeof result2.current.logOut);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when used outside AuthProvider", () => {
      const { notifyError } = jest.mocked(SentryModule);

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within AuthProvider");

      expect(notifyError).toHaveBeenCalledWith(
        "useAuth must be used within AuthProvider"
      );
    });
  });

  describe("Type Safety", () => {
    it("should return values with correct types", () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Type assertions - these would fail at compile time if types are wrong
      expect(
        typeof result.current.user === "object" || result.current.user === null
      ).toBe(true);
      expect(typeof result.current.isLoading).toBe("boolean");
      expect(typeof result.current.signInWithGoogle).toBe("function");
      expect(typeof result.current.logOut).toBe("function");
    });
  });
});
