import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Disc3, ArrowRight, Phone, User } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';

type Method = 'email' | 'phone';

export default function Login({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const [method, setMethod] = useState<Method>('email');
  const [isSignup, setIsSignup] = useState(mode === 'signup');

  // email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);

  // phone
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate('/'); }, [user]);

  const emailSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setInfo(''); setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        // If email confirmation is on, there's no session yet.
        if (data.session) { navigate('/'); }
        else { setInfo('Account created! If asked, verify your email — or just log in now.'); setIsSignup(false); }
      } else {
        console.log('[login] attempting email sign-in for', email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('[login] success, session:', !!data.session);
        setInfo('Logged in! Redirecting…');
        setTimeout(() => navigate('/'), 200);
      }
    } catch (err: any) {
      console.error('[login] error:', err);
      const m = err.message || 'Something went wrong. Please try again.';
      if (/invalid login/i.test(m)) setError('Wrong email or password. Please check and try again.');
      else if (/email not confirmed/i.test(m)) setError('Please confirm your email first, or use Google/Phone login.');
      else setError(m);
    } finally { setLoading(false); }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setInfo(''); setLoading(true);
    try {
      const clean = phone.replace(/\s/g, '');
      const e164 = clean.startsWith('+') ? clean : `+91${clean}`; // default India
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) throw error;
      setOtpSent(true);
      setInfo(`OTP sent to ${e164}. Enter the 6-digit code below.`);
    } catch (err: any) {
      setError(err.message || 'Could not send OTP. Phone auth may need to be enabled.');
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const clean = phone.replace(/\s/g, '');
      const e164 = clean.startsWith('+') ? clean : `+91${clean}`;
      const { error } = await supabase.auth.verifyOtp({ phone: e164, token: otp, type: 'sms' });
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(124,58,237,0.25)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(6,182,212,0.2)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-strong rounded-3xl p-8 relative overflow-hidden z-10">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(124,58,237,0.5)' }} />
        <div className="relative">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center"><Disc3 size={22} className="text-white" /></div>
            <span className="font-display text-3xl font-bold text-gradient">SONIQ</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-center mb-1">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--text-dim)' }}>{isSignup ? 'Start listening for free' : 'Log in to continue'}</p>

          {/* Method tabs */}
          <div className="flex gap-1.5 glass rounded-full p-1 mb-5">
            <button onClick={() => { setMethod('email'); setError(''); setInfo(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition ${method === 'email' ? 'btn-glow text-white' : ''}`}
              style={{ color: method === 'email' ? '#fff' : 'var(--text-dim)' }}>
              <Mail size={15} /> Email
            </button>
            <button onClick={() => { setMethod('phone'); setError(''); setInfo(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition ${method === 'phone' ? 'btn-glow text-white' : ''}`}
              style={{ color: method === 'phone' ? '#fff' : 'var(--text-dim)' }}>
              <Phone size={15} /> Phone
            </button>
          </div>

          {error && <p className="text-pink-400 text-sm mb-3 text-center bg-pink-500/10 py-2 px-3 rounded-lg">{error}</p>}
          {info && <p className="text-sm mb-3 text-center py-2 px-3 rounded-lg" style={{ color: '#06B6D4', background: 'rgba(6,182,212,0.1)' }}>{info}</p>}

          <AnimatePresence mode="wait">
            {method === 'email' ? (
              <motion.form key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={emailSubmit} className="space-y-4">
                {isSignup && (
                  <div className="relative">
                    <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                    <input required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="w-full glass rounded-xl pl-11 pr-4 py-3 outline-none focus:glow-purple" style={{ color: 'var(--text)' }} />
                  </div>
                )}
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                  <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full glass rounded-xl pl-11 pr-4 py-3 outline-none focus:glow-purple" style={{ color: 'var(--text)' }} />
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                  <input required type={show ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full glass rounded-xl pl-11 pr-11 py-3 outline-none focus:glow-purple" style={{ color: 'var(--text)' }} />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                <button disabled={loading} className="btn-glow text-white w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'} {!loading && <ArrowRight size={17} />}
                </button>
              </motion.form>
            ) : (
              <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {!otpSent ? (
                  <form onSubmit={sendOtp} className="space-y-4">
                    <div className="relative">
                      <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                      <input required type="tel" placeholder="Phone number (e.g. 9876543210)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full glass rounded-xl pl-11 pr-4 py-3 outline-none focus:glow-purple" style={{ color: 'var(--text)' }} />
                    </div>
                    <p className="text-[11px] px-1" style={{ color: 'var(--text-dim)' }}>We'll text you a 6-digit code. Include country code (default +91 India).</p>
                    <button disabled={loading} className="btn-glow text-white w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                      {loading ? 'Sending...' : 'Send OTP'} {!loading && <ArrowRight size={17} />}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={verifyOtp} className="space-y-4">
                    <input required inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full glass rounded-xl px-4 py-3 outline-none focus:glow-purple text-center text-2xl tracking-[0.5em] font-bold" style={{ color: 'var(--text)' }} />
                    <button disabled={loading} className="btn-glow text-white w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify & Log In'} {!loading && <ArrowRight size={17} />}
                    </button>
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setInfo(''); }} className="w-full text-sm" style={{ color: 'var(--text-dim)' }}>← Change number</button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px" style={{ background: 'var(--border)' }} /><span className="text-xs" style={{ color: 'var(--text-dim)' }}>OR</span><div className="flex-1 h-px" style={{ background: 'var(--border)' }} /></div>
          <button onClick={() => signInWithGoogle()} className="w-full glass py-3 rounded-xl font-medium flex items-center justify-center gap-3 hover:glow-cyan transition">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continue with Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-dim)' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignup(!isSignup); setError(''); setInfo(''); }} className="font-semibold" style={{ color: '#06B6D4' }}>{isSignup ? 'Log In' : 'Sign Up'}</button>
          </p>
          <div className="mt-4 text-center text-[11px] glass rounded-lg py-2" style={{ color: 'var(--text-dim)' }}>Demo: demo@soniq.com / password123</div>
        </div>
      </motion.div>
    </div>
  );
}