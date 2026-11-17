import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "../constants.js";
import { createAuditRecord } from "./audit-service.js";

// Document id = normalized email.
const userRef = (email) => getFirestore().collection(COLLECTIONS.users).doc(email);

/** Creates or refreshes the profile of a signed-in user. */
export const upsertUser = async ({ email, name }) => {
  const ref = userRef(email);
  const existed = (await ref.get()).exists;
  await ref.set({ email, name }, { merge: true });
  await createAuditRecord({
    action: existed ? "login" : "create",
    collection: COLLECTIONS.users,
    user: { email, name },
  });
  return { email, name };
};

/** One interview attempt: bumps the counter, the per-role count and the last access time. */
export const recordInterviewAttempt = async ({ email, name, role }) => {
  await userRef(email).set({ email, name, lastAccessAt: FieldValue.serverTimestamp() }, { merge: true });
  await userRef(email).update(
    "attempts", FieldValue.increment(1),
    new FieldPath("roleCounts", role), FieldValue.increment(1)
  );
};
