import { writeData } from "./firebase/dataAccess.js";

const COLLECTION = "audits";

export const createAuditRecord = async (data) => {
  await writeData(COLLECTION, data);
  return data;
};
