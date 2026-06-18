import { get, ref, push, set, update, remove } from 'firebase/database';
import { database } from '../firebase.config';

export const getSubjects = async (uid, classId) => {
  const snapshot = await get(ref(database, `Users/${uid}/Classes/${classId}/Subjects`));
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }
  return [];
};

export const addSubject = async (uid, classId, subjectName) => {
  const newSubjectRef = push(ref(database, `Users/${uid}/Classes/${classId}/Subjects`));
  await set(newSubjectRef, { subjectName });
  return newSubjectRef.key;
};

export const updateSubject = async (uid, classId, subjectId, subjectName) => {
  await update(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}`), { subjectName });
};

export const deleteSubject = async (uid, classId, subjectId) => {
  await remove(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}`));
};
