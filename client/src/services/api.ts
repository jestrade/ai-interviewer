import { httpsCallable } from "firebase/functions";
import { notifyError } from "@/services/sentry";
import { useMutation } from "@tanstack/react-query";
import { functions } from "./firebase";
import sessionStorage from "./session-storage";

/**
 * Thin adapter over Firebase callable functions. It keeps the call surface
 * the UI already uses, so components don't know about the transport.
 */
export interface Invitee {
  email: string;
  name: string;
  invitedAt: string | null;
  lastAccessAt: string | null;
  attempts: number;
  roles: { role: string; count: number }[];
}

interface ApiResponse {
  success?: boolean;
  allowed?: boolean;
  isAdmin?: boolean;
  created?: boolean;
  email?: string;
  invitations?: Invitee[];
  message?: string;
  sessionId?: string;
  text?: string;
  emotion?: string;
  code?: string | null;
  feedback?: { question: string; answer: string; feedback: string }[];
}

const call = async (name: string, data?: object): Promise<ApiResponse> => {
  try {
    const result = await httpsCallable<object, ApiResponse>(functions, name)(data ?? {});
    return result.data;
  } catch (error) {
    notifyError("API Error:" + error);
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(blob);
  });

const sessionId = () => sessionStorage.getSessionId();

// Direct API functions (for use with React Query)
export const apiFunctions = {
  sendMessage: (message: string) =>
    call("sendMessage", { sessionId: sessionId(), message }),

  sendAudio: async (audioBlob: Blob) =>
    call("sendMessage", {
      sessionId: sessionId(),
      audio: await blobToBase64(audioBlob),
    }),

  endInterview: async () => {
    const data = await call("endInterview", { sessionId: sessionId() });
    sessionStorage.clearSessionId();
    return data;
  },

  /** Starts an interview session. Identity comes from the Firebase ID token. */
  authenticate: async ({ role }: { role: string }) => {
    const data = await call("init", { role });
    if (data.sessionId) {
      sessionStorage.setSessionId(data.sessionId);
    }
    return data;
  },

  createUser: ({ name }: { name: string }) => call("createUser", { name }),

  whoami: () => call("whoami"),

  getFeedback: () => call("getFeedback", { sessionId: sessionId() }),

  // Admin
  listInvitations: async () => (await call("listInvitations")).invitations ?? [],
  inviteUser: (email: string) => call("inviteUser", { email }),
  revokeInvitation: (email: string) => call("revokeInvitation", { email }),
};

// React Query hooks for interview operations
export const useInterviewApi = () => ({
  sendMessage: useMutation({
    mutationFn: apiFunctions.sendMessage,
    gcTime: 0,
  }),

  sendAudio: useMutation({
    mutationFn: apiFunctions.sendAudio,
    gcTime: 0,
  }),

  endInterview: useMutation({
    mutationFn: apiFunctions.endInterview,
    gcTime: 0,
  }),

  getFeedback: useMutation({
    mutationFn: apiFunctions.getFeedback,
    gcTime: 0,
  }),
});

// React Query hooks for auth operations
export const useAuthApi = () => ({
  authenticate: useMutation({
    mutationFn: apiFunctions.authenticate,
    gcTime: 0,
  }),

  createUser: useMutation({
    mutationFn: apiFunctions.createUser,
    gcTime: 0,
  }),
});

export default apiFunctions;
