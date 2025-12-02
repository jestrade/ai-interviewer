import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

const readData = async (collection, id) => {
  const snapshot = await db.collection(collection).doc(id).get();

  return snapshot;
};

const writeData = async (collection, data) => {
  const docRef = db.collection(collection).doc();

  await docRef.set(data);
};

export { readData, writeData };
