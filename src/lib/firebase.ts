import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  type User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_APIKEY || 'AIzaSyDY-dz_jDaj9mv1-aKkvoQ5jEF6vTir1dc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'interviewiq-8511b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'interviewiq-8511b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'interviewiq-8511b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '205125272945',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:205125272945:web:60de85ff1af43bd4dc62d0',
};

// Initialize Firebase safely (avoid re-initialization in HMR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  type FirebaseUser,
};
