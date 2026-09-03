import { Link } from 'react-router-dom';
import { Wand2, TrendingUp, Disc3, Mic2, Clock, Heart, Crown, Settings as SettingsIcon, ListMusic, Sparkles, Music2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TILES = [
  { to: '/ai-dj', label: 'AI DJ', sub: 'Say the vibe, I spin it', icon: Wand2, grad: 'from-purple-600 to-pink-500' },
  { to: '/trending', label: 'Trending', sub: 'Top charts now', icon: TrendingUp, grad: 'from-orange-500 to-pink-600' },
  { to: '/artists', label: 'Artists', sub: 'Browse artists', icon: Mic2, grad: 'from-emerald-500 to-teal-600' },
  { to: '/albums', label: 'Albums', sub: 'Browse albums', icon: Disc3, grad: 'from-indigo-500 to-purple-700' },
  { to: '/library', label: 'Playlists', sub: 'Your library', icon: ListMusic, grad: 'from-fuchsia-500 to-purple-600' },
  { to: '/liked', label: 'Liked Songs', sub: 'Your favourites', icon: Heart, grad: 'from-pink-600 to-rose-500' },
  { to: '/recent', label: 'Recently Played', sub: 'Jump back in', icon: Clock, grad: 'from-sky-500 to-indigo-600' },
  { to: '/replay', label: 'SONIQ Replay', sub: 'Your year in music', icon: Sparkles, grad: 'from-pink-500 to-purple-600' },
  { to: '/premium', label: 'Premium', sub: 'Go premium', icon: Crown, grad: 'from-amber-500 to-yellow-600' },
];

export default function Explore() {
  const { user } = useAuth();

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} style={{ color: '#EC4899' }} />
        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: 'var(--text-dim)' }}>Explore</p>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">Everything SONIQ</h1>

      <div className="grid grid-cols-2 gap-4">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to}
            className={`group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br ${t.grad} p-4 flex flex-col justify-between hover:scale-[1.03] transition-transform duration-300 shadow-lg`}>
            <t.icon size={26} className="text-white" />
            <div>
              <p className="font-bold text-white text-base leading-tight">{t.label}</p>
              <p className="text-[11px] text-white/80 mt-0.5">{t.sub}</p>
            </div>
            <Music2 size={54} className="absolute -bottom-3 -right-3 text-white/15 rotate-12" />
          </Link>
        ))}
      </div>

      {/* Account / Settings row */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <Link to="/settings" className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition">
          <SettingsIcon size={20} style={{ color: 'var(--text-dim)' }} />
          <span className="font-medium text-sm">Settings & API Key</span>
        </Link>
        {!user && (
          <Link to="/login" className="btn-glow text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm">
            Log in / Sign up
          </Link>
        )}
      </div>
    </div>
  );
}
