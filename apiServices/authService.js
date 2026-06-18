import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase.config';

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signupUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  return userCredential.user;
};

export const sendPasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
  await auth.signOut();
};
