import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
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

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: firebaseConfig.projectId
});

console.log('\n' + '='.repeat(60));
console.log('🔥 FIREBASE INITIALIZATION');
console.log('='.repeat(60));
console.log('📋 Project ID:', firebaseConfig.projectId || '❌ MISSING');
console.log('🔑 API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ MISSING');
console.log('🌐 Auth Domain:', firebaseConfig.authDomain || '❌ MISSING');
console.log('');

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialized successfully');
  
  db = getFirestore(app);
  console.log('✅ Firestore connected successfully');
  console.log('='.repeat(60) + '\n');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('='.repeat(60) + '\n');
  throw error;
}

// Verify Firebase Auth token
export const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    throw new Error('Unauthorized');
  }
};

// Test Firestore connection
export const testConnection = async () => {
  try {
    console.log('🧪 Testing Firestore connection...');
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      timestamp: new Date().toISOString(),
      status: 'connected' 
    });
    console.log('✅ Firestore write test successful');
    
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('✅ Firestore read test successful');
      console.log('📊 Test data:', docSnap.data());
      return true;
    }
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error.message);
    return false;
  }
};

// Projects metadata (user-specific) - only store metadata, not chunks
export const saveProjectMetadata = async (userId, projectId, projectData) => {
  try {
    await setDoc(doc(db, 'users', userId, 'projects', projectId), {
      ...projectData,
      updatedAt: new Date().toISOString()
    }, { merge: true }); // Merge instead of overwrite
    console.log(`✅ Project metadata saved: ${projectId} for user: ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to save project metadata ${projectId}:`, error.message);
    throw error;
  }
};

export const getAllProjectMetadata = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'projects'));
    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ Retrieved ${projects.length} projects for user: ${userId}`);
    return projects;
  } catch (error) {
    console.error('❌ Failed to get all projects:', error.message);
    throw error;
  }
};

export const updateProjectMetadata = async (userId, projectId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'projects', projectId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Project metadata updated: ${projectId}`);
  } catch (error) {
    console.error(`❌ Failed to update project metadata ${projectId}:`, error.message);
    throw error;
  }
};

export const deleteProject = async (userId, projectId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
    await deleteDoc(doc(db, 'users', userId, 'brds', projectId));
    console.log(`✅ Project deleted: ${projectId}`);
  } catch (error) {
    console.error(`❌ Failed to delete project ${projectId}:`, error.message);
    throw error;
  }
};

// BRDs collection (user-specific)
export const saveBRD = async (userId, projectId, brdContent) => {
  try {
    await setDoc(doc(db, 'users', userId, 'brds', projectId), {
      projectId,
      content: brdContent,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ BRD saved: ${projectId} (${brdContent.length} chars)`);
  } catch (error) {
    console.error(`❌ Failed to save BRD ${projectId}:`, error.message);
    throw error;
  }
};

export const getBRD = async (userId, projectId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'brds', projectId));
    if (docSnap.exists()) {
      console.log(`✅ BRD retrieved: ${projectId}`);
      return docSnap.data();
    }
    console.log(`⚠️  BRD not found: ${projectId}`);
    return null;
  } catch (error) {
    console.error(`❌ Failed to get BRD ${projectId}:`, error.message);
    throw error;
  }
};

export const updateBRD = async (userId, projectId, brdContent) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'brds', projectId), {
      content: brdContent,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ BRD updated: ${projectId} (${brdContent.length} chars)`);
  } catch (error) {
    console.error(`❌ Failed to update BRD ${projectId}:`, error.message);
    throw error;
  }
};

