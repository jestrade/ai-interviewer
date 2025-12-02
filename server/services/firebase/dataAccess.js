import { getFirestore } from "firebase-admin/firestore";

const getDb = () => {
  const db = getFirestore();
  return db;
};

const readData = async (collection, { field, value }) => {
  const db = getDb();
  if (field === "id") {
    const data = await db.collection(collection).doc(value).get();
    return data;
  }

  const data = await db.collection(collection).where(field, "==", value).get();

  return data.docs[0];
};

const writeData = async (collection, data) => {
  const db = getDb();
  const docRef = db.collection(collection).doc();
  await docRef.set(data);
};

export { readData, writeData };
