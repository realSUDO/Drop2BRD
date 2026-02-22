import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD30YmJWowF-GX1nCfg735C3g5Fil8DJh8",
  authDomain: "hackfest-844ce.firebaseapp.com",
  projectId: "hackfest-844ce",
  storageBucket: "hackfest-844ce.firebasestorage.app",
  messagingSenderId: "1023780955791",
  appId: "1:1023780955791:web:21a3bbacd59c94756332fa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signUpWithEmail = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(userCredential.user, { displayName: name });
  }
  return userCredential;
};
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export { onAuthStateChanged };
