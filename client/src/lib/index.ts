import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ROLE_GROUPS } from "./constants";

export { speakText, interruptSpeech } from "./speech";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRoleName = (role: string | null | undefined): string => {
  if (!role) return "";
  for (const group of ROLE_GROUPS) {
    if (role in group.roles) return group.roles[role];
  }
  return "";
};
