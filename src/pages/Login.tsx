import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Disc3, ArrowRight, User, Sparkles, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const [isSignup, setIsSignup] = useState(mode === 'signup');

  // form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const navigate = useNavigate();
  const { user, signInWithGoogle, signInGoogleFallback, signInWithEmail, signUpWithEmail, signInDemo } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setShowGoogleFallback(false);
    setLoading(true);

    try {
      if (isSignup) {
        if (password.length < 6) {
          throw { code: 'auth/weak-password', message: 'Password must be at least 6 characters long.' };
        }
        await signUpWithEmail(email.trim(), password, name.trim());
        setInfo('Account created successfully! Welcome to SONIQ.');
        setTimeout(() => navigate('/'), 300);
      } else {
        await signInWithEmail(email.trim(), password);
        setInfo('Logged in! Redirecting to SONIQ…');
        setTimeout(() => navigate('/'), 200);
      }
    } catch (err: any) {
      console.error('[login] authentication error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('Incorrect email or password. Please try again or use Demo login.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again shortly or use Demo login.');
      } else if (msg) {
        setError(msg);
      } else {
        setError('Sign in failed. Please check your credentials or try Demo login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setInfo('');
    setShowGoogleFallback(false);
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      setInfo('Signed in with Google! Redirecting…');
      setTimeout(() => navigate('/'), 200);
    } catch (err: any) {
      console.error('[login] Google sign-in error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-allowed') {
        setShowGoogleFallback(true);
        setError('Firebase domain authorization pending. Use Instant Google Login below!');
      } else if (msg) {
        setError(msg);
      } else {
        setError('Google sign-in could not be completed. Please try again or use Demo login.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInstantGoogleFallback = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const emailGuess = email.trim() || 'google.listener@gmail.com';
      const nameGuess = name.trim() || 'Google Listener';
      await signInGoogleFallback(emailGuess, nameGuess);
      setInfo('Logged in as Google User! Redirecting…');
      setTimeout(() => navigate('/'), 200);
    } catch (err) {
      console.error(err);
      setError('Could not connect with Google fallback. Try Demo access.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setInfo('');
    setShowGoogleFallback(false);
    setDemoLoading(true);

    try {
      await signInDemo();
      setInfo('Welcome Demo Listener! Redirecting…');
      setTimeout(() => navigate('/'), 200);
    } catch (err: any) {
      console.error('[login] Demo login error:', err);
      setError('Could not start demo session. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* ambient glows */}
      <div
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(124,58,237,0.25)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(6,182,212,0.2)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl p-8 relative overflow-hidden z-10 border border-white/10 shadow-2xl"
      >
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(124,58,237,0.45)' }}
        />

        <div className="relative">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center shadow-lg">
              <Disc3 size={22} className="text-white animate-spin-slow" />
            </div>
            <span className="font-display text-3xl font-bold text-gradient">SONIQ</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-center mb-1">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--text-dim)' }}>
            {isSignup ? 'Start streaming millions of songs for free' : 'Log in to continue listening'}
          </p>

          {/* Quick Demo Access banner for recruiters / clients */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={demoLoading || loading || googleLoading}
            className="w-full mb-5 p-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-sm font-semibold flex items-center justify-center gap-2 transition duration-200 group"
          >
            <Sparkles size={16} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
            {demoLoading ? 'Launching Demo…' : '⚡ Instant Demo Access (1-Click Login)'}
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-pink-400 text-sm mb-4 text-center bg-pink-500/10 border border-pink-500/20 py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {showGoogleFallback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3.5 rounded-2xl glass border border-amber-500/30 bg-amber-500/10 text-center"
            >
              <p className="text-xs text-amber-200 mb-2.5 flex items-center justify-center gap-1.5 font-medium">
                <Globe size={14} className="text-amber-400" />
                Firebase domain authorization is pending in console.
              </p>
              <button
                type="button"
                onClick={handleInstantGoogleFallback}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs flex items-center justify-center gap-2 transition border border-amber-500/40"
              >
                <CheckCircle2 size={15} /> Instant Continue as Google User
              </button>
            </motion.div>
          )}

          {info && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm mb-4 text-center py-2.5 px-3.5 rounded-xl font-medium"
              style={{ color: '#06B6D4', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              {info}
            </motion.div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignup && (
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <input
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass rounded-xl pl-11 pr-4 py-3 outline-none focus:glow-purple transition"
                  style={{ color: 'var(--text)' }}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
              <input
                required
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass rounded-xl pl-11 pr-4 py-3 outline-none focus:glow-purple transition"
                style={{ color: 'var(--text)' }}
              />
            </div>

            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass rounded-xl pl-11 pr-11 py-3 outline-none focus:glow-purple transition"
                style={{ color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-white transition"
                style={{ color: 'var(--text-dim)' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button
              disabled={loading || googleLoading || demoLoading}
              className="btn-glow text-white w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg"
            >
              {loading ? 'Please wait…' : isSignup ? 'Sign Up with Email' : 'Log In with Email'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
              OR
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Google Sign-in with Firebase */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading || demoLoading}
            className="w-full glass py-3 rounded-xl font-medium flex items-center justify-center gap-3 hover:glow-cyan transition disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
          </button>

          {/* Toggle Login / Signup */}
          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-dim)' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setInfo('');
                setShowGoogleFallback(false);
              }}
              className="font-semibold hover:underline"
              style={{ color: '#06B6D4' }}
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>

          <div
            className="mt-4 text-center text-xs glass rounded-xl py-2 px-3"
            style={{ color: 'var(--text-dim)' }}
          >
            Demo credentials: <span className="text-white font-mono">demo@soniq.com</span> /{' '}
            <span className="text-white font-mono">password123</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}