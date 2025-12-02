import { readData, writeData } from "./firebase/dataAccess.js";

export const getUser = async (userId) => {
  const data = await readData("users", userId);
  return data.docs[0].data();
};

export const createUser = async (userId, userData) => {
  const users = await getUser(userId);

  if (users) {
    return users;
  }

  await writeData("users", userId, userData);
};
