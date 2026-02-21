import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Projects collection
export const saveProject = async (projectId, projectData) => {
  await setDoc(doc(db, 'projects', projectId), {
    ...projectData,
    updatedAt: new Date().toISOString()
  });
};

export const getProject = async (projectId) => {
  const docSnap = await getDoc(doc(db, 'projects', projectId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getAllProjects = async () => {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateProject = async (projectId, updates) => {
  await updateDoc(doc(db, 'projects', projectId), {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, 'projects', projectId));
  await deleteDoc(doc(db, 'brds', projectId));
};

// BRDs collection
export const saveBRD = async (projectId, brdContent) => {
  await setDoc(doc(db, 'brds', projectId), {
    projectId,
    content: brdContent,
    updatedAt: new Date().toISOString()
  });
};

export const getBRD = async (projectId) => {
  const docSnap = await getDoc(doc(db, 'brds', projectId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateBRD = async (projectId, brdContent) => {
  await updateDoc(doc(db, 'brds', projectId), {
    content: brdContent,
    updatedAt: new Date().toISOString()
  });
};
