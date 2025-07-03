import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // ✅ db is imported — DO NOT re-initialize here

export const fetchCollection = async (db, collectionName) => {
  try {
    const snap = await getDocs(collection(db, collectionName));
    console.log(`📦 Fetched "${collectionName}" — ${snap.size} documents`);
    return snap;
  } catch (error) {
    console.error(`❌ Error fetching "${collectionName}":`, error);
    throw error;
  }
};

export const addDocument = async (db, collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return { id: docRef.id, ...data };
};

export const updateDocument = async (db, collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (db, collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

export const getDocumentRef = (db, collectionName, docId) => {
  return doc(db, collectionName, docId);
};
