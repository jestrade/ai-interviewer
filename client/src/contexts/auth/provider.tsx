import { useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { app } from "@/services/firebase";
import { useAuthApi } from "@/services/api";
import { notifyError } from "@/services/sentry";
import config from "@/config";
import { User } from "./types";
import AuthContext from "./auth-context";

const googleProvider = new GoogleAuthProvider();
const auth = getAuth(app);

const ROLE_KEY = "role";
const storedRole = () => localStorage.getItem(ROLE_KEY) ?? "";

const DEV_USER = {
  id: "dev-mode-user-id",
  email: "dev-mode-user@email.com",
  name: "dev-mode-user-name",
  avatar: null,
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate, createUser } = useAuthApi();

  // Restore the Firebase session on reload.
  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) return;
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        name: firebaseUser.displayName ?? "",
        avatar: firebaseUser.photoURL,
        role: storedRole(),
      });
    });
  }, []);

  /** Opens an interview session and registers the user; throws on failure. */
  const startInterview = useCallback(
    async (candidate: Omit<User, "role">, role: string) => {
      const session = await authenticate.mutateAsync({ email: candidate.email, role });
      if (!session.success) throw new Error(session.message);

      const registration = await createUser.mutateAsync({
        email: candidate.email,
        name: candidate.name,
      });
      if (!registration.success) throw new Error(registration.message);

      localStorage.setItem(ROLE_KEY, role);
      setUser({ ...candidate, role });
    },
    [authenticate, createUser]
  );

  const signIn = useCallback(
    async (role: string, getCandidate: () => Promise<Omit<User, "role">>) => {
      setIsLoading(true);
      try {
        await startInterview(await getCandidate(), role);
      } catch (error) {
        notifyError("Error initializing interview:" + error);
      } finally {
        setIsLoading(false);
      }
    },
    [startInterview]
  );

  const signInWithGoogle = useCallback(
    (role: string) =>
      signIn(role, async () => {
        const { user: u } = await signInWithPopup(auth, googleProvider);
        return {
          id: u.uid,
          email: u.email ?? "",
          name: u.displayName ?? "",
          avatar: u.photoURL,
        };
      }),
    [signIn]
  );

  const signInWithDevMode = useCallback(
    async (role: string) => {
      if (!config.mode.isDevelopment) return;
      await signIn(role, async () => DEV_USER);
    },
    [signIn]
  );

  const logOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      notifyError("Logout error:" + error);
    } finally {
      setUser(null);
      localStorage.removeItem(ROLE_KEY);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signInWithGoogle, signInWithDevMode, logOut }),
    [user, isLoading, signInWithGoogle, signInWithDevMode, logOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
