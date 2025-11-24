import { createContext, useState, useEffect, ReactNode } from "react";

import {
  onAuthStateChanged,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

import { app } from "../../services/firebase";
import { useAuthApi } from "../../services/api";
import { User, AuthContextType } from "./types";

import { notifyError } from "@/services/sentry";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticate } = useAuthApi();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
          role: localStorage.getItem("role"),
        };
        setUser(userData);
      }
    });

    setIsLoading(false);
  }, []);

  const signInWithGoogle = async (role: string) => {
    setIsLoading(true);
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userData = {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
          role,
        };

        setUser(userData);
        localStorage.setItem("role", role);

        try {
          await authenticate.mutateAsync(role);
        } catch (error) {
          notifyError("Error initializing interview:", error);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);

        notifyError(
          `${errorCode}: ${errorMessage} - ${email} :: ${credential}`
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const logOut = async () => {
    setIsLoading(true);

    signOut(auth)
      .then(() => {
        console.log("User successfully signed out.");
      })
      .catch((error) => {
        notifyError("Logout error:", error);
      })
      .finally(() => {
        setUser(null);
        localStorage.removeItem("role");
        setIsLoading(false);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
