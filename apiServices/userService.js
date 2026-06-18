import { get, ref, set, update } from 'firebase/database';
import { database } from '../firebase.config';

export const getUserFromDB = async (uid) => {
  const snapshot = await get(ref(database, `Users/${uid}`));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

export const saveUserToDB = async (uid, data) => {
  await set(ref(database, `Users/${uid}`), data);
};

export const updateUserInDB = async (uid, data) => {
  await update(ref(database, `Users/${uid}`), data);
};
