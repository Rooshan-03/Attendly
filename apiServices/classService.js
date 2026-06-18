import { get, ref, push, set, update, remove } from 'firebase/database';
import { database } from '../firebase.config';

export const getClasses = async (uid) => {
  const snapshot = await get(ref(database, `Users/${uid}/Classes`));
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }
  return [];
};

export const addClass = async (uid, className) => {
  const newClassRef = push(ref(database, `Users/${uid}/Classes`));
  await set(newClassRef, { className });
  return newClassRef.key;
};

export const updateClass = async (uid, classId, className) => {
  await update(ref(database, `Users/${uid}/Classes/${classId}`), { className });
};

export const deleteClass = async (uid, classId) => {
  await remove(ref(database, `Users/${uid}/Classes/${classId}`));
};
