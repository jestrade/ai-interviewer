import { User, AuthContextType } from "../types";

describe("Auth Types", () => {
  describe("User Interface", () => {
    it("should have correct structure", () => {
      const user: User = {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        avatar: "https://example.com/avatar.jpg",
        role: "junior-software-engineer",
      };

      expect(user.id).toBe("test-id");
      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("Test User");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.role).toBe("junior-software-engineer");
    });

    it("should accept valid data types", () => {
      const validUsers: User[] = [
        {
          id: "123",
          email: "user@example.com",
          name: "John Doe",
          avatar: "https://example.com/avatar1.jpg",
          role: "senior-software-engineer",
        },
        {
          id: "456",
          email: "user2@example.com",
          name: "Jane Smith",
          avatar: "https://example.com/avatar2.png",
          role: "project-manager",
        },
        {
          id: "789",
          email: "user3@example.com",
          name: "Bob Johnson",
          avatar: "https://example.com/avatar3.webp",
          role: "ceo",
        },
      ];

      validUsers.forEach((user) => {
        expect(typeof user.id).toBe("string");
        expect(typeof user.email).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(typeof user.avatar).toBe("string");
        expect(typeof user.role).toBe("string");
      });
    });

    it("should allow empty strings for optional-like fields", () => {
      const user: User = {
        id: "test-id",
        email: "",
        name: "",
        avatar: "",
        role: "",
      };

      expect(user.email).toBe("");
      expect(user.name).toBe("");
      expect(user.avatar).toBe("");
      expect(user.role).toBe("");
    });
  });

  describe("AuthContextType Interface", () => {
    it("should have correct structure", () => {
      const mockSignInWithGoogle = jest.fn();
      const mockSignInWithDevMode = jest.fn();
      const mockLogOut = jest.fn();
      const mockUser: User = {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        avatar: "https://example.com/avatar.jpg",
        role: "junior-software-engineer",
      };

      const authContext: AuthContextType = {
        user: mockUser,
        isLoading: false,
        signInWithGoogle: mockSignInWithGoogle,
        signInWithDevMode: mockSignInWithDevMode,
        logOut: mockLogOut,
      };

      expect(authContext.user).toEqual(mockUser);
      expect(authContext.isLoading).toBe(false);
      expect(authContext.signInWithGoogle).toBe(mockSignInWithGoogle);
      expect(authContext.signInWithDevMode).toBe(mockSignInWithDevMode);
      expect(authContext.logOut).toBe(mockLogOut);
    });

    it("should allow null user", () => {
      const mockSignInWithGoogle = jest.fn();
      const mockSignInWithDevMode = jest.fn();
      const mockLogOut = jest.fn();

      const authContext: AuthContextType = {
        user: null,
        isLoading: true,
        signInWithGoogle: mockSignInWithGoogle,
        signInWithDevMode: mockSignInWithDevMode,
        logOut: mockLogOut,
      };

      expect(authContext.user).toBeNull();
      expect(authContext.isLoading).toBe(true);
      expect(authContext.signInWithGoogle).toBe(mockSignInWithGoogle);
      expect(authContext.signInWithDevMode).toBe(mockSignInWithDevMode);
      expect(authContext.logOut).toBe(mockLogOut);
    });

    it("should accept functions with correct signatures", () => {
      const mockSignInWithGoogle = async (role: string): Promise<void> => {
        // Mock implementation
      };

      const mockSignInWithDevMode = async (role: string): Promise<void> => {
        // Mock implementation
      };

      const mockLogOut = async (): Promise<void> => {
        // Mock implementation
      };

      const authContext: AuthContextType = {
        user: null,
        isLoading: false,
        signInWithGoogle: mockSignInWithGoogle,
        signInWithDevMode: mockSignInWithDevMode,
        logOut: mockLogOut,
      };

      expect(typeof authContext.signInWithGoogle).toBe("function");
      expect(typeof authContext.signInWithDevMode).toBe("function");
      expect(typeof authContext.logOut).toBe("function");

      // These should not cause type errors
      authContext.signInWithGoogle("test-role");
      authContext.signInWithDevMode("test-role");
      authContext.logOut();
    });

    it("should handle different loading states", () => {
      const mockSignInWithGoogle = jest.fn();
      const mockSignInWithDevMode = jest.fn();
      const mockLogOut = jest.fn();

      const loadingContext: AuthContextType = {
        user: null,
        isLoading: true,
        signInWithGoogle: mockSignInWithGoogle,
        signInWithDevMode: mockSignInWithDevMode,
        logOut: mockLogOut,
      };

      const notLoadingContext: AuthContextType = {
        user: null,
        isLoading: false,
        signInWithGoogle: mockSignInWithGoogle,
        signInWithDevMode: mockSignInWithDevMode,
        logOut: mockLogOut,
      };

      expect(loadingContext.isLoading).toBe(true);
      expect(notLoadingContext.isLoading).toBe(false);
    });
  });

  describe("Type Compatibility", () => {
    it("should allow User to be used in arrays", () => {
      const users: User[] = [
        {
          id: "1",
          email: "user1@example.com",
          name: "User One",
          avatar: "avatar1.jpg",
          role: "role1",
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User Two",
          avatar: "avatar2.jpg",
          role: "role2",
        },
      ];

      expect(users).toHaveLength(2);
      expect(users[0].id).toBe("1");
      expect(users[1].id).toBe("2");
    });

    it("should allow AuthContextType to be used as function parameters", () => {
      const processAuthContext = (context: AuthContextType): string => {
        return context.user ? context.user.name : "No user";
      };

      const mockContext: AuthContextType = {
        user: {
          id: "test",
          email: "test@example.com",
          name: "Test User",
          avatar: "avatar.jpg",
          role: "test-role",
        },
        isLoading: false,
        signInWithGoogle: jest.fn(),
        signInWithDevMode: jest.fn(),
        logOut: jest.fn(),
      };

      const result = processAuthContext(mockContext);
      expect(result).toBe("Test User");
    });

    it("should allow partial updates to User type", () => {
      const baseUser: User = {
        id: "base-id",
        email: "base@example.com",
        name: "Base User",
        avatar: "base-avatar.jpg",
        role: "base-role",
      };

      const updatedUser: User = {
        ...baseUser,
        name: "Updated User",
        role: "updated-role",
      };

      expect(updatedUser.id).toBe("base-id");
      expect(updatedUser.name).toBe("Updated User");
      expect(updatedUser.role).toBe("updated-role");
    });
  });

  describe("Runtime Validation", () => {
    it("should validate User structure at runtime", () => {
      const validateUser = (user: any): user is User => {
        return (
          typeof user === "object" &&
          user !== null &&
          typeof user.id === "string" &&
          typeof user.email === "string" &&
          typeof user.name === "string" &&
          typeof user.avatar === "string" &&
          typeof user.role === "string"
        );
      };

      const validUser = {
        id: "test",
        email: "test@example.com",
        name: "Test",
        avatar: "avatar.jpg",
        role: "role",
      };

      const invalidUser = {
        id: "test",
        email: "test@example.com",
        // Missing name, avatar, role
      };

      expect(validateUser(validUser)).toBe(true);
      expect(validateUser(invalidUser)).toBe(false);
    });

    it("should validate AuthContextType structure at runtime", () => {
      const validateAuthContext = (
        context: any
      ): context is AuthContextType => {
        return (
          typeof context === "object" &&
          context !== null &&
          (context.user === null || typeof context.user === "object") &&
          typeof context.isLoading === "boolean" &&
          typeof context.signInWithGoogle === "function" &&
          typeof context.signInWithDevMode === "function" &&
          typeof context.logOut === "function"
        );
      };

      const validContext = {
        user: null,
        isLoading: false,
        signInWithGoogle: jest.fn(),
        signInWithDevMode: jest.fn(),
        logOut: jest.fn(),
      };

      const invalidContext = {
        user: null,
        isLoading: false,
        signInWithGoogle: jest.fn(),
        // Missing signInWithDevMode and logOut
      };

      expect(validateAuthContext(validContext)).toBe(true);
      expect(validateAuthContext(invalidContext)).toBe(false);
    });
  });
});
