import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "../constants.js";

const invitations = () => getFirestore().collection(COLLECTIONS.invitations);
const users = () => getFirestore().collection(COLLECTIONS.users);

// Document ids are the normalized email, so lookups need no query or index.
export const isInvited = async (email) => (await invitations().doc(email).get()).exists;

export const invite = async (email, invitedBy) => {
  const ref = invitations().doc(email);
  if ((await ref.get()).exists) return { created: false };
  await ref.set({ email, invitedBy, invitedAt: FieldValue.serverTimestamp() });
  return { created: true };
};

export const revoke = async (email) => {
  await invitations().doc(email).delete();
};

const iso = (timestamp) => timestamp?.toDate?.().toISOString() ?? null;

/** Invitations joined with each invitee's activity, newest invitation first. */
export const listInvitees = async () => {
  const snapshot = await invitations().orderBy("invitedAt", "desc").get();
  if (snapshot.empty) return [];

  const activity = await getFirestore().getAll(...snapshot.docs.map((doc) => users().doc(doc.id)));

  return snapshot.docs.map((doc, index) => {
    const user = activity[index].exists ? activity[index].data() : {};
    return {
      email: doc.id,
      name: user.name ?? "",
      invitedAt: iso(doc.get("invitedAt")),
      lastAccessAt: iso(user.lastAccessAt),
      attempts: user.attempts ?? 0,
      roles: Object.entries(user.roleCounts ?? {}).map(([role, count]) => ({ role, count })),
    };
  });
};
