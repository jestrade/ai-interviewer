export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: (role: string) => Promise<void>;
  /** Admin sign in: no role and no interview session. */
  signInAsAdmin: () => Promise<void>;
  logOut: () => Promise<void>;
}
