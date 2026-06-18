import { get, ref, update } from 'firebase/database';
import { database } from '../firebase.config';

export const getSubjectName = async (uid, classId, subjectId) => {
  const snapshot = await get(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}`));
  if (snapshot.exists()) {
    return snapshot.val().subjectName;
  }
  return '';
};

export const getAttendance = async (uid, classId, subjectId, dateStr) => {
  const snapshot = await get(ref(database, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Attendance/${dateStr}`));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

export const submitAttendance = async (uid, classId, subjectId, dateStr, students) => {
  const updates = {};
  students.forEach(student => {
    updates[`Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Attendance/${dateStr}/${student.id}`] = {
      name: student.Name,
      rollNo: student.RollNo,
      Attendance: student.Attendance,
    };
  });
  await update(ref(database), updates);
};
