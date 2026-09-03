import { Link } from 'react-router-dom';
import { Clock, Heart, ListMusic, Settings as SettingsIcon, Sun, Moon, LogOut, Play } from 'lucide-react';
import SongRow from '../components/SongRow';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGatedPlay } from '../lib/useGatedPlay';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { recent } = useHistory();
  const { theme, toggle } = useTheme();
  const playSong = useGatedPlay();

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Listener';

  const QUICK = [
    { to: '/liked', label: 'Liked Songs', icon: Heart, grad: 'from-purple-600 to-pink-500' },
    { to: '/recent', label: 'Recently Played', icon: Clock, grad: 'from-cyan-500 to-blue-600' },
    { to: '/library', label: 'Your Playlists', icon: ListMusic, grad: 'from-emerald-500 to-teal-600' },
    { to: '/settings', label: 'Settings', icon: SettingsIcon, grad: 'from-slate-500 to-slate-700' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="relative px-4 md:px-8 pt-16 pb-8" style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.35), transparent)' }}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-36 h-36 md:w-40 md:h-40 rounded-full btn-glow flex items-center justify-center text-5xl font-bold text-white shadow-2xl">{name[0].toUpperCase()}</div>
          <div className="text-center md:text-left flex-1">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Profile</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold my-2 break-words">{name}</h1>
            {user?.email && <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{user.email}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 space-y-8">
        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK.map((q) => (
            <Link key={q.to} to={q.to} className={`group relative rounded-2xl overflow-hidden aspect-[16/9] bg-gradient-to-br ${q.grad} p-4 flex flex-col justify-between hover:scale-[1.03] transition-transform`}>
              <q.icon size={24} className="text-white" />
              <span className="font-semibold text-white text-sm md:text-base">{q.label}</span>
            </Link>
          ))}
        </div>

        {/* Appearance toggle */}
        <div className="glass rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={20} style={{ color: '#7C3AED' }} /> : <Sun size={20} style={{ color: '#f59e0b' }} />}
            <div>
              <p className="font-semibold text-sm">Appearance</p>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <button onClick={toggle} className="glass px-4 py-2 rounded-full text-sm font-medium hover:glow-purple transition">
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Recently played */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold">Recently Played</h2>
              <button onClick={() => playSong(recent[0], recent)} className="btn-glow text-white px-4 py-2 rounded-full text-sm flex items-center gap-1.5">
                <Play size={14} fill="white" /> Play
              </button>
            </div>
            <div className="glass rounded-2xl p-2">
              {recent.slice(0, 8).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} queue={recent} />)}
            </div>
          </section>
        )}

        {/* Sign out */}
        {user && (
          <button onClick={() => signOut()} className="glass rounded-2xl p-4 w-full flex items-center justify-center gap-2 text-sm hover:bg-white/10 transition" style={{ color: '#fda4af' }}>
            <LogOut size={16} /> Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
