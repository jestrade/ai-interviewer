import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import {
  onAuthStateChanged,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

import { app } from "../../services/firebase";
import config from "@/config";
import { User, AuthContextType } from "./types";

import { notifyError } from "@/services/sentry";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    notifyError("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
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
        };

        setUser(userData);

        try {
          await fetch(`${config.api.url}/authenticate`, {
            method: "POST",
            body: JSON.stringify({ role: role }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          notifyError("Error sending audio or processing response:", error);
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
        console.error("Logout error:", error);
      })
      .finally(() => {
        setUser(null);
        setIsLoading(false);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
