import { renderHook, waitFor, act } from "@testing-library/react";

import AuthProvider from "../provider";
import { useAuth } from "../hooks";

// Import the mocked modules at the top
import * as SentryModule from "@/services/sentry";
import * as ApiModule from "../../../services/api";
jest.mock("@/services/sentry");
jest.mock("../../../services/api");

// Mock Firebase
jest.mock("firebase/auth", () => {
  const mockGoogleAuthProvider = jest.fn(() => ({})) as jest.Mock & {
    credentialFromError: jest.Mock;
  };
  mockGoogleAuthProvider.credentialFromError = jest.fn();

  return {
    onAuthStateChanged: jest.fn(),
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

jest.mock("@/services/sentry", () => ({
  notifyError: jest.fn(),
}));

// Mock config to handle import.meta.env
jest.mock("@/config", () => ({
  __esModule: true,
  default: jest.requireActual("@/tests/__mocks__/config").default,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>;
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe("AuthContext", () => {
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
  });

  describe("Initial State", () => {
    it("should initialize with user as null and isLoading as true", () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        (callback as (user: unknown) => void)(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should set isLoading to false after auth state check", () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        (callback as (user: unknown) => void)(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Auth State Changes", () => {
    it("should update user when auth state changes with authenticated user", async () => {
      const mockFirebaseUser = {
        uid: "test-uid",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/avatar.jpg",
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        providerId: "google.com",
      };

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        (callback as (user: unknown) => void)(mockFirebaseUser);
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual({
          id: "test-uid",
          email: "test@example.com",
          name: "Test User",
          avatar: "https://example.com/avatar.jpg",
          role: null,
        });
      });
    });

    it("should use role from localStorage when setting user", async () => {
      localStorageMock.getItem.mockReturnValue("senior-software-engineer");

      const mockFirebaseUser = {
        uid: "test-uid",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/avatar.jpg",
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        providerId: "google.com",
      };

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        (callback as (user: unknown) => void)(mockFirebaseUser);
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual({
          id: "test-uid",
          email: "test@example.com",
          name: "Test User",
          avatar: "https://example.com/avatar.jpg",
          role: "senior-software-engineer",
        });
      });

      expect(localStorageMock.getItem).toHaveBeenCalledWith("role");
    });
  });

  describe("signInWithGoogle", () => {
    it("should handle successful Google sign in", async () => {
      const mockFirebaseUser = {
        uid: "test-uid",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/avatar.jpg",
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: "",
        tenantId: null,
        phoneNumber: null,
        providerId: "google.com",
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
      };

      const mockResult = {
        user: mockFirebaseUser,
        providerId: "google.com",
        operationType: "signIn" as const,
      };

      mockSignInWithPopup.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wrap the async operation in act
      await act(async () => {
        await result.current.signInWithGoogle("junior-software-engineer");
      });

      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "role",
        "junior-software-engineer"
      );

      await waitFor(() => {
        expect(result.current.user).toEqual({
          id: "test-uid",
          email: "test@example.com",
          name: "Test User",
          avatar: "https://example.com/avatar.jpg",
          role: "junior-software-engineer",
        });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should set loading state during sign in process", async () => {
      let resolveSignIn: ((value: unknown) => void) | null = null;

      mockSignInWithPopup.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveSignIn = resolve;
        });
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInPromise: Promise<void>;
      await act(async () => {
        signInPromise = result.current.signInWithGoogle(
          "junior-software-engineer"
        );
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignIn!({
          user: {
            uid: "test-uid",
            email: "test@example.com",
            displayName: "Test User",
            photoURL: "https://example.com/avatar.jpg",
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: "",
            tenantId: null,
            phoneNumber: null,
            providerId: "google.com",
            delete: jest.fn(),
            getIdToken: jest.fn(),
            getIdTokenResult: jest.fn(),
            reload: jest.fn(),
            toJSON: jest.fn(),
          },
          providerId: "google.com",
          operationType: "signIn",
        });
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle Google sign in error", async () => {
      const mockError = {
        code: "auth/popup-closed",
        message: "The popup was closed before authentication",
        customData: {
          email: "test@example.com",
        },
      };

      mockSignInWithPopup.mockRejectedValue(mockError);

      // Use the mocked module
      const { notifyError } = jest.mocked(SentryModule);
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wrap the async operation in act
      await act(async () => {
        await result.current.signInWithGoogle("junior-software-engineer");
      });

      expect(notifyError).toHaveBeenCalledWith(
        "auth/popup-closed: The popup was closed before authentication - test@example.com :: undefined"
      );
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle API authentication error during sign in", async () => {
      const mockFirebaseUser = {
        uid: "test-uid",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/avatar.jpg",
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: "",
        tenantId: null,
        phoneNumber: null,
        providerId: "google.com",
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
      };

      const mockResult = {
        user: mockFirebaseUser,
        providerId: "google.com",
        operationType: "signIn" as const,
      };

      mockSignInWithPopup.mockResolvedValue(mockResult);

      // Create a new mock for this test
      const mockAuthenticate = jest
        .fn()
        .mockRejectedValue(new Error("API Error"));

      // Mock the API module correctly
      (ApiModule.useAuthApi as jest.Mock) = jest.fn().mockReturnValue({
        authenticate: {
          mutateAsync: mockAuthenticate,
        },
      });

      const { notifyError } = jest.mocked(SentryModule);
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wrap the async operation in act
      await act(async () => {
        await result.current.signInWithGoogle("junior-software-engineer");
      });

      expect(notifyError).toHaveBeenCalledWith(
        "Error initializing interview:",
        expect.any(Error)
      );
      expect(result.current.user).toEqual({
        id: "test-uid",
        email: "test@example.com",
        name: "Test User",
        avatar: "https://example.com/avatar.jpg",
        role: "junior-software-engineer",
      });
    });
  });

  describe("logOut", () => {
    it("should handle successful logout", async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set a user first
      await act(async () => {
        await result.current.signInWithGoogle("junior-software-engineer");
      });

      expect(result.current.user).not.toBeNull();

      // Logout within act
      await act(async () => {
        await result.current.logOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("role");
      expect(result.current.isLoading).toBe(false);
    });

    it("should set loading state during logout process", async () => {
      let resolveSignOut: ((value: unknown) => void) | null = null;

      mockSignOut.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveSignOut = resolve;
        });
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let logoutPromise: Promise<void>;
      await act(async () => {
        logoutPromise = result.current.logOut();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignOut!(undefined);
        await logoutPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle logout error", async () => {
      const mockError = new Error("Logout failed");
      mockSignOut.mockRejectedValue(mockError);

      const { notifyError } = jest.mocked(SentryModule);
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wrap the async operation in act
      await act(async () => {
        await result.current.logOut();
      });

      expect(notifyError).toHaveBeenCalledWith("Logout error:", mockError);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("role");
      expect(result.current.isLoading).toBe(false);
    });

    it("should clear user state even if logout fails", async () => {
      const mockError = new Error("Logout failed");
      mockSignOut.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set a user first
      await act(async () => {
        await result.current.signInWithGoogle("junior-software-engineer");
      });

      expect(result.current.user).not.toBeNull();

      // Logout within act
      await act(async () => {
        await result.current.logOut();
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe("Context Value", () => {
    it("should provide all required context values", () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        (callback as (user: unknown) => void)(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty("user");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("signInWithGoogle");
      expect(result.current).toHaveProperty("logOut");
      expect(typeof result.current.signInWithGoogle).toBe("function");
      expect(typeof result.current.logOut).toBe("function");
    });
  });

  describe("useAuth Hook Error Handling", () => {
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
});
