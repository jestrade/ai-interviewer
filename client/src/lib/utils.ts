import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const speakText = (text: string) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Text-to-Speech not supported in this browser.");
  }
};

export const getRoleName = (role: string) => {
  switch (role) {
    case "junior-software-engineer":
      return "Junior Software Engineer";
    case "mid-software-engineer":
      return "Mid-Level Software Engineer";
    case "senior-software-engineer":
      return "Senior Software Engineer";
    case "staff-software-engineer":
      return "Staff Software Engineer";
    case "project-manager":
      return "Project Manager";
    case "senior-project-manager":
      return "Senior Project Manager";
    case "program-manager":
      return "Program Manager";
    case "senior-program-manager":
      return "Senior Program Manager";
    case "director":
      return "Director";
    case "senior-director":
      return "Senior Director";
    case "vp":
      return "VP";
    case "senior-vp":
      return "Senior VP";
    case "ceo":
      return "CEO";
    default:
      return "";
  }
};
