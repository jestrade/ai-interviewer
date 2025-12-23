import { useState, useEffect, ReactNode } from "react";

import {
  onAuthStateChanged,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

import { app } from "../../services/firebase";
import { useAuthApi } from "../../services/api";
import { User } from "./types";
import AuthContext from "./auth-context";

import { notifyError } from "@/services/sentry";
import config from "@/config";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);
const WAIT_TIME = 3000;

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticate, createUser } = useAuthApi();

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
        setTimeout(() => {
          setUser(userData);
        }, WAIT_TIME);
      }
    });

    setIsLoading(false);
  }, []);

  const signInWithDevMode = async (role: string) => {
    setIsLoading(true);
    // bypass if dev mode
    if (config.mode.isDevelopment) {
      try {
        const email = "dev-mode-user@email.com";
        await authenticate.mutateAsync({ email, role });
        await createUser.mutateAsync({ email, name: "dev-mode-user-name" });
        const userData = {
          id: "dev-mode-user-id",
          email,
          name: "dev-mode-user-name",
          avatar: null,
          role,
        };
        setUser(userData);
        localStorage.setItem("role", role);
      } catch (error) {
        notifyError("Error initializing interview:" + error);
      }
    }
    setIsLoading(false);
    return;
  };

  const signInWithGoogle = async (role: string) => {
    setIsLoading(true);

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const {
          user: { uid, email, displayName, photoURL },
        } = result;
        const userData = {
          id: uid,
          email,
          name: displayName,
          avatar: photoURL,
          role,
        };

        try {
          const authResponse = await authenticate.mutateAsync({
            email,
            role,
          });
          if (!authResponse.success) {
            throw new Error(authResponse.message);
          }

          const userResponse = await createUser.mutateAsync({
            email,
            name: displayName,
          });
          if (!userResponse.success) {
            throw new Error(userResponse.message);
          }
          if (authResponse.success && userResponse.success) {
            setTimeout(() => {
              setUser(userData);
              localStorage.setItem("role", role);
              setIsLoading(false);
            }, WAIT_TIME);
          }
        } catch (error) {
          notifyError("Error initializing interview:" + error);
          setIsLoading(false);
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
        notifyError("Logout error:" + error);
      })
      .finally(() => {
        setUser(null);
        localStorage.removeItem("role");
        setIsLoading(false);
      });
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signInWithGoogle, signInWithDevMode, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
