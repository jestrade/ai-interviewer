import { readData, writeData } from "./firebase/dataAccess.js";

const COLLECTION = "users";

export const getUser = async ({ field, value }) => {
  const data = await readData(COLLECTION, { field, value });

  if (!data) {
    return null;
  }

  return data.data();
};

export const createUser = async (userData) => {
  const user = await getUser({ field: "email", value: userData.email });

  if (user) {
    return user;
  }

  await writeData(COLLECTION, userData);
  return userData;
};
