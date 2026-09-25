import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type FirebaseUser,
} from '../lib/firebase';
import supabase from '../lib/supabase';
import {
  registerLocalUser,
  verifyLocalUser,
  saveActiveLocalSession,
  getActiveLocalSession,
  clearActiveLocalSession,
  type LocalUserRecord,
} from '../lib/userStore';

export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  provider?: string;
  user_metadata?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

interface AuthCtx {
  user: AppUser | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<AppUser>;
  signInGoogleFallback: (email?: string, name?: string) => Promise<AppUser>;
  signInWithEmail: (email: string, pass: string) => Promise<AppUser>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<AppUser>;
  signInDemo: () => Promise<AppUser>;
  updateUserProfile: (name: string) => Promise<void>;
}

function mapFirebaseUser(u: FirebaseUser | null): AppUser | null {
  if (!u) return null;
  const name = u.displayName || u.email?.split('@')[0] || 'Listener';
  return {
    id: u.uid,
    uid: u.uid,
    email: u.email,
    displayName: name,
    photoURL: u.photoURL,
    provider: 'firebase',
    user_metadata: {
      full_name: name,
      avatar_url: u.photoURL,
    },
  };
}

function mapLocalUser(u: LocalUserRecord | null): AppUser | null {
  if (!u) return null;
  return {
    id: u.id,
    uid: u.id,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL || null,
    provider: 'local',
    user_metadata: {
      full_name: u.displayName,
      avatar_url: u.photoURL || null,
    },
  };
}

const DEMO_EMAIL = 'demo@soniq.com';
const DEMO_PASSWORD = 'password123';

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  signInWithGoogle: async () => { throw new Error('Not implemented'); },
  signInGoogleFallback: async () => { throw new Error('Not implemented'); },
  signInWithEmail: async () => { throw new Error('Not implemented'); },
  signUpWithEmail: async () => { throw new Error('Not implemented'); },
  signInDemo: async () => { throw new Error('Not implemented'); },
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdToken().catch(() => null);
        const mapped = mapFirebaseUser(fbUser);
        setUser(mapped);
        setSession({ access_token: token, user: mapped });
      } else {
        // 2. Fallback to active local session
        const localActive = getActiveLocalSession();
        if (localActive) {
          const mapped = mapLocalUser(localActive);
          setUser(mapped);
          setSession({ access_token: 'local-session-token', user: mapped });
        } else {
          setUser(null);
          setSession(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AppUser> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      clearActiveLocalSession();
      const mapped = mapFirebaseUser(result.user)!;
      setUser(mapped);
      return mapped;
    } catch (err: any) {
      console.warn('[auth] Firebase Google signInWithPopup error:', err?.code, err?.message);
      throw err;
    }
  }, []);

  const signInGoogleFallback = useCallback(async (email?: string, name?: string): Promise<AppUser> => {
    const finalEmail = (email && email.trim()) || 'google.user@gmail.com';
    const finalName = (name && name.trim()) || finalEmail.split('@')[0] || 'Google Listener';
    const record: LocalUserRecord = {
      id: `google_user_${Date.now()}`,
      email: finalEmail,
      displayName: finalName,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      createdAt: new Date().toISOString(),
    };
    saveActiveLocalSession(record);
    const mapped = mapLocalUser(record)!;
    setUser(mapped);
    setSession({ access_token: 'google-fallback-token', user: mapped });
    return mapped;
  }, []);

  const signInWithEmail = useCallback(async (email: string, pass: string): Promise<AppUser> => {
    const cleanEmail = email.trim().toLowerCase();

    // First attempt Firebase auth
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      clearActiveLocalSession();
      const mapped = mapFirebaseUser(cred.user)!;
      setUser(mapped);
      return mapped;
    } catch (err: any) {
      console.warn('[auth] Firebase signInWithEmailAndPassword:', err?.code || err?.message);

      // If Firebase blocked it (operation-not-allowed or user not found on Firebase), check local store
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/network-request-failed'
      ) {
        const localUser = verifyLocalUser(cleanEmail, pass);
        if (localUser) {
          saveActiveLocalSession(localUser);
          const mapped = mapLocalUser(localUser)!;
          setUser(mapped);
          setSession({ access_token: 'local-session-token', user: mapped });
          return mapped;
        }

        // Check if demo user was attempted
        if (cleanEmail === DEMO_EMAIL) {
          const demoRecord: LocalUserRecord = {
            id: 'demo-soniq-listener',
            email: DEMO_EMAIL,
            displayName: 'Demo Listener',
            createdAt: new Date().toISOString(),
          };
          saveActiveLocalSession(demoRecord);
          const mapped = mapLocalUser(demoRecord)!;
          setUser(mapped);
          return mapped;
        }
      }

      throw err;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, pass: string, name: string): Promise<AppUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName }).catch(() => {});
      }
      clearActiveLocalSession();
      const mapped = mapFirebaseUser(cred.user)!;
      setUser(mapped);
      return mapped;
    } catch (err: any) {
      console.warn('[auth] Firebase signUpWithEmail error:', err?.code, err?.message);

      // If Firebase has Email/Password disabled in Console (auth/operation-not-allowed)
      // or network issue, smoothly create the local account without blocking user!
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
        const localUser = registerLocalUser(cleanEmail, pass, cleanName);
        saveActiveLocalSession(localUser);
        const mapped = mapLocalUser(localUser)!;
        setUser(mapped);
        setSession({ access_token: 'local-session-token', user: mapped });
        return mapped;
      }

      throw err;
    }
  }, []);

  const signInDemo = useCallback(async (): Promise<AppUser> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
      clearActiveLocalSession();
      const mapped = mapFirebaseUser(cred.user)!;
      setUser(mapped);
      return mapped;
    } catch {
      // Guaranteed instant fallback
      const demoRecord: LocalUserRecord = {
        id: 'demo-soniq-listener',
        email: DEMO_EMAIL,
        displayName: 'Demo Listener',
        createdAt: new Date().toISOString(),
      };
      saveActiveLocalSession(demoRecord);
      const mapped = mapLocalUser(demoRecord)!;
      setUser(mapped);
      setSession({ access_token: 'demo-token', user: mapped });
      return demoRecord;
    }
  }, []);

  const updateUserProfile = useCallback(async (name: string): Promise<void> => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name }).catch(() => {});
    }
    const currentLocal = getActiveLocalSession();
    if (currentLocal) {
      currentLocal.displayName = name;
      saveActiveLocalSession(currentLocal);
    }
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        displayName: name,
        user_metadata: {
          ...prev.user_metadata,
          full_name: name,
        },
      };
    });
  }, []);

  const signOut = useCallback(async () => {
    clearActiveLocalSession();
    await fbSignOut(auth).catch(() => {});
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setSession(null);
  }, []);

  const isAdmin = !!user && (user.email === 'admin@soniq.com' || user.email === 'ashishcodes.dev@gmail.com');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signOut,
        signInWithGoogle,
        signInGoogleFallback,
        signInWithEmail,
        signUpWithEmail,
        signInDemo,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
