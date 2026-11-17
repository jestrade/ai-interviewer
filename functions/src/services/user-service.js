import { getFirestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "../constants.js";
import { createAuditRecord } from "./audit-service.js";

export const getUserByEmail = async (email) => {
  const snapshot = await getFirestore()
    .collection(COLLECTIONS.users)
    .where("email", "==", email)
    .limit(1)
    .get();
  return snapshot.empty ? null : snapshot.docs[0].data();
};

export const createUser = async ({ name, email }) => {
  const existing = await getUserByEmail(email);

  if (existing) {
    await createAuditRecord({ action: "login", user: { name, email } });
    return existing;
  }

  const user = { name, email };
  await getFirestore().collection(COLLECTIONS.users).add(user);
  await createAuditRecord({
    action: "create",
    collection: COLLECTIONS.users,
    user,
  });
  return user;
};
