import axios from "axios";
import config from "@/config";
import { notifyError } from "@/services/sentry";
import { useMutation } from "@tanstack/react-query";

const api = axios.create({
  baseURL: config.api.url,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    notifyError("API Error:", error);
    return Promise.reject(error);
  }
);

// Direct API functions (for use with React Query)
export const apiFunctions = {
  sendMessage: async (message: string) => {
    const response = await api.post("/interviews", { message });
    return response.data;
  },

  sendAudio: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await api.post("/interviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  endInterview: async () => {
    const response = await api.post("/interviews/end");
    return response.data;
  },

  authenticate: async ({ email, role }: { email: string; role: string }) => {
    const response = await api.post("/init", { email, role });
    return response.data;
  },

  createUser: async ({ email, name }: { email: string; name: string }) => {
    const response = await api.post("/users", { email, name });
    return response.data;
  },
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

export default api;
