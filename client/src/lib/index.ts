import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ROLE_LABELS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const speakText = (text: string) => {
  if (!text || text.trim() === "") {
    console.warn("Empty text provided to speakText");
    return;
  }

  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Add event listeners for debugging
    utterance.onstart = () => {
      console.log("Speech synthesis started for:", text);
    };

    utterance.onend = () => {
      console.log("Speech synthesis ended for:", text);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
    };

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Text-to-Speech not supported in this browser.");
  }
};

export const getRoleName = (role: string) => {
  // Search through all role groups to find the role
  const groups: Record<string, string>[] = Object.values(ROLE_LABELS);
  for (const group of groups) {
    if (role in group) {
      return group[role as keyof typeof group];
    }
  }
  return "";
};

export const interruptSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};
