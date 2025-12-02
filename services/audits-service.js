import { writeData } from "./firebase/data-access.js";

const COLLECTION = "audits";

export const createAuditRecord = async (data) => {
  await writeData(COLLECTION, data);
  return data;
};
