import { HttpsError } from "firebase-functions/v2/https";
import { getAdminEmail } from "./config.js";
import { isInvited } from "./services/invitation-service.js";

export const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const verifiedEmail = (request) => {
  const token = request.auth?.token;
  if (!token?.email || token.email_verified !== true) {
    throw new HttpsError("unauthenticated", "Sign in with a verified email");
  }
  return { email: normalizeEmail(token.email), name: token.name ?? "" };
};

export const isAdminEmail = (email) => email === getAdminEmail();

/** Resolves the caller's identity without enforcing the allowlist. */
export const identify = async (request) => {
  const { email, name } = verifiedEmail(request);
  const isAdmin = isAdminEmail(email);
  return { email, name, isAdmin, allowed: isAdmin || (await isInvited(email)) };
};

/** Caller must be the admin or an invited user. */
export const requireAccess = async (request) => {
  const caller = await identify(request);
  if (!caller.allowed) {
    throw new HttpsError("permission-denied", "This account has not been invited");
  }
  return caller;
};

export const requireAdmin = async (request) => {
  const caller = await identify(request);
  if (!caller.isAdmin) {
    throw new HttpsError("permission-denied", "Admin only");
  }
  return caller;
};
