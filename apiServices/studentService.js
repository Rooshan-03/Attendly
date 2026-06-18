import { get, ref, push, set, update, remove } from 'firebase/database';
import { database } from '../firebase.config';

export const getClassName = async (uid, classId) => {
  const snapshot = await get(ref(database, `Users/${uid}/Classes/${classId}`));
  if (snapshot.exists()) {
    return snapshot.val().className;
  }
  return '';
};

export const getStudents = async (uid, classId, subjectId) => {
  const snapshot = await get(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students`));
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }
  return [];
};

export const addStudent = async (uid, classId, subjectId, studentData) => {
  const newStudentRef = push(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students`));
  await set(newStudentRef, studentData);
  return newStudentRef.key;
};

export const updateStudent = async (uid, classId, subjectId, studentId, data) => {
  await update(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students/${studentId}`), data);
};

export const deleteStudent = async (uid, classId, subjectId, studentId) => {
  await remove(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students/${studentId}`));
};
