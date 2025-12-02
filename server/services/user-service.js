import { readData, writeData } from "./firebase/data-access.js";
import { createAuditRecord } from "./audit-service.js";
import { COLLECTIONS } from "../constants.js";

export const getUser = async ({ field, value }) => {
  const data = await readData(COLLECTIONS.users, { field, value });

  if (!data) {
    return null;
  }

  return data.data();
};

export const createUser = async (userData) => {
  const user = await getUser({ field: "email", value: userData.email });

  if (user) {
    await createAuditRecord({ action: "login", user: userData });

    return user;
  }

  await writeData(COLLECTIONS.users, userData);

  await createAuditRecord({
    action: "create",
    collection: COLLECTIONS.users,
    user: userData,
  });

  return userData;
};
