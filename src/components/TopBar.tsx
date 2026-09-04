import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, User, LogOut, Crown, Mic, Clock, TrendingUp, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getSongs } from '../lib/api';
import type { Song } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

const TRENDING_SEARCHES = ['Arijit Singh', 'Bollywood 2024', 'Punjabi hits', 'Ed Sheeran', 'Lo-fi hindi', 'Worship songs', 'Tamil melody', 'Party mix'];

function getSearchHistory(): string[] {
  try { return JSON.parse(localStorage.getItem('soniq_search_hist') || '[]'); } catch { return []; }
}
function pushSearchHistory(term: string) {
  const h = [term, ...getSearchHistory().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 6);
  localStorage.setItem('soniq_search_hist', JSON.stringify(h));
}

export default function TopBar() {
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>(getSearchHistory());
  const [listening, setListening] = useState(false);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const query = q.trim();
      getSongs(`search=${encodeURIComponent(query)}&limit=6`).then(setResults).catch(() => setResults([]));
    }, 280);
  }, [q]);

  const runSearch = (term: string) => {
    if (!term.trim()) return;
    pushSearchHistory(term.trim());
    setHistory(getSearchHistory());
    setFocused(false);
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const voiceSearch = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice search not supported in this browser'); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    setListening(true);
    rec.onresult = (e: any) => { const text = e.results[0][0].transcript; setQ(text); runSearch(text); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  const clearHistory = () => { localStorage.removeItem('soniq_search_hist'); setHistory([]); };

  return (
    <div className="sticky top-0 z-30 px-3 md:px-6 py-3 flex items-center gap-3 glass-strong">
      <div className="hidden md:flex gap-1">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft size={18} /></button>
        <button onClick={() => navigate(1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronRight size={18} /></button>
      </div>
      <div className="relative flex-1 md:max-w-md">
        <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
        <input value={q} onChange={e => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={e => e.key === 'Enter' && runSearch(q)}
          placeholder="Search songs, artists…" className="w-full glass rounded-full pl-12 pr-12 py-3.5 md:py-2.5 text-base md:text-sm outline-none focus:glow-purple" style={{ color: 'var(--text)' }} />
        <button onClick={voiceSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2" title="Voice search">
          <Mic size={18} className={listening ? 'animate-pulse' : ''} style={{ color: listening ? '#EC4899' : '#06B6D4' }} />
        </button>
        <AnimatePresence>{focused && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-full mt-2 w-full glass-strong rounded-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto no-scrollbar">
            {q && results.length > 0 ? (
              <>
                {results.map(s => (
                  <button key={s.id} onMouseDown={() => { playSong(s, results); setQ(''); setFocused(false); }} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/5 text-left">
                    <img src={s.cover} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0"><p className="text-sm truncate">{s.title}</p><p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{s.artist_name}</p></div>
                  </button>
                ))}
                <button onMouseDown={() => runSearch(q)} className="w-full text-center text-xs py-2.5 hover:bg-white/5" style={{ color: '#06B6D4' }}>See all results for "{q}"</button>
              </>
            ) : (
              <div className="p-2">
                {history.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-[11px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-dim)' }}><Clock size={12} /> Recent</span>
                      <button onMouseDown={clearHistory} className="text-[11px] hover:text-white" style={{ color: 'var(--text-dim)' }}>Clear</button>
                    </div>
                    {history.map(h => (
                      <button key={h} onMouseDown={() => { setQ(h); runSearch(h); }} className="flex items-center gap-2.5 w-full px-2 py-2 hover:bg-white/5 text-left rounded-lg text-sm">
                        <Clock size={14} style={{ color: 'var(--text-dim)' }} /> {h}
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[11px] uppercase tracking-widest px-2 py-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-dim)' }}><TrendingUp size={12} /> Trending searches</span>
                <div className="flex flex-wrap gap-1.5 p-2">
                  {TRENDING_SEARCHES.map(t => (
                    <button key={t} onMouseDown={() => { setQ(t); runSearch(t); }} className="glass px-3 py-1.5 rounded-full text-xs hover:glow-purple transition">{t}</button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}</AnimatePresence>
      </div>
      <div className="flex-1" />
      <button onClick={toggleTheme} title="Toggle theme" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:glow-purple transition">
        {theme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: '#7C3AED' }} />}
      </button>
      <Link to="/premium" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold glass px-4 py-2 rounded-full hover:glow-purple transition">
        <Crown size={14} style={{ color: '#EC4899' }} /> Go Premium
      </Link>
      {user ? (
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 rounded-full btn-glow flex items-center justify-center text-white text-sm font-semibold">
            {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
          </button>
          <AnimatePresence>{menuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute right-0 mt-2 w-48 glass-strong rounded-2xl overflow-hidden z-50">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5"><User size={16} /> Profile</Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5"><Crown size={16} /> Settings</Link>
              <button onClick={async () => { await signOut(); navigate('/'); }} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 text-pink-400 w-full"><LogOut size={16} /> Logout</button>
            </motion.div>
          )}</AnimatePresence>
        </div>
      ) : (
        <Link to="/login" className="btn-glow text-white text-sm font-semibold px-5 py-2 rounded-full">Log in</Link>
      )}
    </div>
  );
}