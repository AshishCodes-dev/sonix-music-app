import { NavLink, Link } from 'react-router-dom';
import { Home, Search, Library, Heart, Sparkles, TrendingUp, Disc3, Mic2, Settings, Crown, LayoutDashboard, Clock, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Your Library', icon: Library },
];
const DISCOVER = [
  { to: '/ai-dj', label: 'AI DJ', icon: Wand2 },
  { to: '/trending', label: 'Trending', icon: TrendingUp },
  { to: '/albums', label: 'Albums', icon: Disc3 },
  { to: '/artists', label: 'Artists', icon: Mic2 },
];

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full p-3 gap-3">
      <div className="glass rounded-2xl p-4">
        <Link to="/" className="flex items-center gap-2 px-2 mb-5">
          <div className="w-9 h-9 rounded-xl btn-glow flex items-center justify-center"><Disc3 size={20} className="text-white" /></div>
          <span className="font-display text-2xl font-bold text-gradient">SONIQ</span>
        </Link>
        <nav className="space-y-1">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`} style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-dim)' })}>
              <n.icon size={20} /> {n.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="glass rounded-2xl p-4 flex-1 overflow-y-auto no-scrollbar">
        <p className="text-[11px] uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text-dim)' }}>Discover</p>
        <nav className="space-y-1 mb-5">
          {DISCOVER.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`} style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-dim)' })}>
              <n.icon size={20} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <p className="text-[11px] uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text-dim)' }}>Your Music</p>
        <nav className="space-y-1">
          <NavLink to="/liked" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`} style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-dim)' })}>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}><Heart size={15} className="text-white" fill="white" /></span> Liked Songs
          </NavLink>
          <NavLink to="/recent" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`} style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-dim)' })}>
            <Clock size={20} /> Recently Played
          </NavLink>
          <NavLink to="/premium" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`} style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-dim)' })}>
            <Crown size={20} style={{ color: '#EC4899' }} /> Premium
          </NavLink>
          {user && (
            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`} style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-dim)' })}>
              <Settings size={20} /> Settings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition hover:bg-white/5" style={{ color: 'var(--text-dim)' }}>
              <LayoutDashboard size={20} /> Admin
            </NavLink>
          )}
        </nav>
      </div>
    </aside>
  );
}
