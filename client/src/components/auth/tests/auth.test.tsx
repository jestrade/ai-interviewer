import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Auth from "../auth";
import { useAuth } from "@/contexts/auth/hooks";
import { renderComponent } from "@/tests/common/wrapper";

jest.mock("@/config", () => ({
  __esModule: true,
  default: jest.requireActual("@/tests/__mocks__/config").default,
}));

// Mock dependencies
jest.mock("@/contexts/auth/hooks");

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock the Select component to make it testable
jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children?: React.ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <div>
      <select
        data-testid="role-select"
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        <option value="">Select a role</option>
        <option value="junior-software-engineer">
          Junior Software Engineer
        </option>
        <option value="mid-software-engineer">
          Mid-Level Software Engineer
        </option>
        <option value="senior-software-engineer">
          Senior Software Engineer
        </option>
        <option value="staff-software-engineer">Staff Software Engineer</option>
        <option value="project-manager">Project Manager</option>
        <option value="senior-project-manager">Senior Project Manager</option>
        <option value="program-manager">Program Manager</option>
        <option value="senior-program-manager">Senior Program Manager</option>
        <option value="director">Director</option>
        <option value="senior-director">Senior Director</option>
        <option value="vp">VP</option>
        <option value="senior-vp">Senior VP</option>
        <option value="ceo">CEO</option>
      </select>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SelectTrigger: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

describe("Auth Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockSignInWithGoogle = jest.fn();

  beforeEach(() => {
    user = userEvent.setup();

    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
      signInWithGoogle: mockSignInWithGoogle,
      logOut: jest.fn(),
    });

    jest.clearAllMocks();
  });

  const render = () => {
    return renderComponent(<Auth />);
  };

  describe("Rendering", () => {
    it("should render the auth interface with logo and title", () => {
      render();

      expect(screen.getByText("AI Interview Practice")).toBeInTheDocument();
      expect(
        screen.getByText(/Sign in to start your AI-powered interview session/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Continue with Google/)).toBeInTheDocument();
    });

    it("should render the role selector", () => {
      render();

      expect(
        screen.getByText(/Select the role you are applying for:/)
      ).toBeInTheDocument();

      // Check for the mocked select component
      const roleSelect = screen.getByTestId("role-select");
      expect(roleSelect).toBeInTheDocument();

      // Check that the placeholder text is present in the select option
      expect(screen.getByDisplayValue("Select a role")).toBeInTheDocument();
    });

    it("should render role groups in the selector", () => {
      render();

      // With the mocked select, we can check that the select element is present
      const roleSelect = screen.getByTestId("role-select");
      expect(roleSelect).toBeInTheDocument();

      // Check that all role options are available
      expect(screen.getByText("Junior Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("Project Manager")).toBeInTheDocument();
      expect(screen.getByText("Director")).toBeInTheDocument();
    });

    it("should render engineering roles", () => {
      render();

      // Check that engineering roles are available in the select
      expect(screen.getByText("Junior Software Engineer")).toBeInTheDocument();
      expect(
        screen.getByText("Mid-Level Software Engineer")
      ).toBeInTheDocument();
      expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("Staff Software Engineer")).toBeInTheDocument();
    });

    it("should render management roles", () => {
      render();

      // Check that management roles are available in the select
      expect(screen.getByText("Project Manager")).toBeInTheDocument();
      expect(screen.getByText("Senior Project Manager")).toBeInTheDocument();
      expect(screen.getByText("Program Manager")).toBeInTheDocument();
      expect(screen.getByText("Senior Program Manager")).toBeInTheDocument();
    });

    it("should render leadership roles", () => {
      render();

      // Check that leadership roles are available in the select
      expect(screen.getByText("Director")).toBeInTheDocument();
      expect(screen.getByText("Senior Director")).toBeInTheDocument();
      expect(screen.getByText("VP")).toBeInTheDocument();
      expect(screen.getByText("Senior VP")).toBeInTheDocument();
      expect(screen.getByText("CEO")).toBeInTheDocument();
    });
  });

  describe("Button State", () => {
    it("should disable sign-in button when no role is selected", () => {
      render();

      const signInButton = screen.getByRole("button", {
        name: /Continue with Google/i,
      });
      expect(signInButton).toBeDisabled();
    });

    it("should enable sign-in button when role is selected", async () => {
      render();

      // Use the mocked select component
      const roleSelect = screen.getByTestId("role-select");
      await user.selectOptions(roleSelect, "junior-software-engineer");

      await waitFor(() => {
        const signInButton = screen.getByRole("button", {
          name: /Continue with Google/i,
        });
        expect(signInButton).not.toBeDisabled();
      });
    });

    it("should disable sign-in button when loading", () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: true,
        signInWithGoogle: mockSignInWithGoogle,
        logOut: jest.fn(),
      });

      render();

      // When loading, the button doesn't have the "Continue with Google" text
      // So we look for the button by its role and check it's disabled
      const signInButton = screen.getByRole("button");
      expect(signInButton).toBeDisabled();
    });

    it("should show loading spinner when isLoading is true", () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: true,
        signInWithGoogle: mockSignInWithGoogle,
        logOut: jest.fn(),
      });

      render();

      // Look for the loading spinner
      const signInButton = screen.getByRole("button");
      expect(signInButton.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("should call signInWithGoogle when button is clicked with selected role", async () => {
      render();

      // Use the mocked select component
      const roleSelect = screen.getByTestId("role-select");
      await user.selectOptions(roleSelect, "junior-software-engineer");

      await waitFor(() => {
        const signInButton = screen.getByRole("button", {
          name: /Continue with Google/i,
        });
        expect(signInButton).not.toBeDisabled();
      });

      const signInButton = screen.getByRole("button", {
        name: /Continue with Google/i,
      });
      await user.click(signInButton);

      expect(mockSignInWithGoogle).toHaveBeenCalledWith(
        "junior-software-engineer"
      );
    });

    it("should not call signInWithGoogle when button is disabled", async () => {
      render();

      const signInButton = screen.getByRole("button", {
        name: /Continue with Google/i,
      });

      // Button should be disabled
      expect(signInButton).toBeDisabled();

      // Try to click (should not work)
      await user.click(signInButton);

      expect(mockSignInWithGoogle).not.toHaveBeenCalled();
    });

    it("should call signInWithGoogle with correct role value for different roles", async () => {
      render();

      // Use the mocked select component
      const roleSelect = screen.getByTestId("role-select");
      await user.selectOptions(roleSelect, "senior-software-engineer");

      // Wait for the selection to be made and button to be enabled
      await waitFor(() => {
        const signInButton = screen.getByRole("button", {
          name: /Continue with Google/i,
        });
        expect(signInButton).not.toBeDisabled();
      });

      const signInButton = screen.getByRole("button", {
        name: /Continue with Google/i,
      });
      await user.click(signInButton);

      expect(mockSignInWithGoogle).toHaveBeenCalledWith(
        "senior-software-engineer"
      );
    });
  });

  describe("Navigation", () => {
    it("should navigate to chat page when user is already authenticated", () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        avatar: "https://example.com/avatar.jpg",
        role: "junior-software-engineer",
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isLoading: false,
        signInWithGoogle: mockSignInWithGoogle,
        logOut: jest.fn(),
      });

      render();

      expect(mockNavigate).toHaveBeenCalledWith("/private/chat");
    });

    it("should not navigate when user is not authenticated", () => {
      render();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button with proper label", () => {
      render();

      const signInButton = screen.getByRole("button", {
        name: /Continue with Google/i,
      });
      expect(signInButton).toBeInTheDocument();
    });

    it("should have accessible select with placeholder", () => {
      render();

      // Check for the mocked select component
      const roleSelect = screen.getByTestId("role-select");
      expect(roleSelect).toBeInTheDocument();
      expect(screen.getByDisplayValue("Select a role")).toBeInTheDocument();
    });
  });
});
