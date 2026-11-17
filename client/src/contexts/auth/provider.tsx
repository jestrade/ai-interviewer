import { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { app } from "@/services/firebase";
import { apiFunctions, useAuthApi } from "@/services/api";
import sessionStorage from "@/services/session-storage";
import { notifyError } from "@/services/sentry";
import { toast } from "@/hooks/use-toast";
import { User } from "./types";
import AuthContext from "./auth-context";

const googleProvider = new GoogleAuthProvider();
const auth = getAuth(app);

const ROLE_KEY = "role";

const isPermissionDenied = (error: unknown) =>
  (error as { code?: string })?.code === "functions/permission-denied";

const rejectUninvited = async () => {
  await signOut(auth);
  toast({
    title: "Access denied",
    description: "This account has not been invited. Ask the administrator for access.",
    variant: "destructive",
  });
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate, createUser } = useAuthApi();
  // Firebase fires onAuthStateChanged mid sign-in, before the session exists.
  const isSigningIn = useRef(false);

  // Restore the Firebase session on reload, re-checking the invitation.
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || isSigningIn.current) return;
      try {
        const access = await apiFunctions.whoami();
        const role = localStorage.getItem(ROLE_KEY) ?? "";
        if (!access.allowed) return await rejectUninvited();
        // Without a live session a new interview must be started with a role.
        if (!sessionStorage.hasSessionId()) {
          if (!role) return await signOut(auth);
          await authenticate.mutateAsync({ role });
        }
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          name: firebaseUser.displayName ?? "",
          avatar: firebaseUser.photoURL,
          role,
          isAdmin: access.isAdmin,
        });
      } catch (error) {
        notifyError("Error restoring session:" + error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = useCallback(
    async (role: string) => {
      setIsLoading(true);
      isSigningIn.current = true;
      try {
        const { user: u } = await signInWithPopup(auth, googleProvider);
        const name = u.displayName ?? "";

        const session = await authenticate.mutateAsync({ role });
        if (!session.success) throw new Error(session.message);
        await createUser.mutateAsync({ name });

        localStorage.setItem(ROLE_KEY, role);
        setUser({
          id: u.uid,
          email: u.email ?? "",
          name,
          avatar: u.photoURL,
          role,
          isAdmin: session.isAdmin,
        });
      } catch (error) {
        if (isPermissionDenied(error)) await rejectUninvited();
        else notifyError("Error initializing interview:" + error);
      } finally {
        isSigningIn.current = false;
        setIsLoading(false);
      }
    },
    [authenticate, createUser]
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
    () => ({ user, isLoading, signInWithGoogle, logOut }),
    [user, isLoading, signInWithGoogle, logOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
