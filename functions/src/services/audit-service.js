import { getFirestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "../constants.js";

export const createAuditRecord = async (data) => {
  await getFirestore()
    .collection(COLLECTIONS.audits)
    .add({ ...data, createdAt: new Date().toISOString() });
  return data;
};
