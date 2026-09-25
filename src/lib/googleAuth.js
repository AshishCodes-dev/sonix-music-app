import { auth, googleProvider, signInWithPopup } from './firebase';

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { data: result.user, error: null };
  } catch (error) {
    console.error('[google-auth] Firebase signInWithPopup failed:', error);
    return { data: null, error };
  }
}

export default signInWithGoogle;