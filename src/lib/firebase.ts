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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_APIKEY || 'AIzaSyAKYvpM7eM07_zfYFhZc2oRP1yfmndIMwY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'soniq-music-app-af972.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'soniq-music-app-af972',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'soniq-music-app-af972.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '775001513498',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:775001513498:web:73cd61853165f3013efba3',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-F4XHXTNCXB',
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
