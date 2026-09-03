import { NavLink } from 'react-router-dom';
import { Home, Search, Wand2, LayoutGrid, Heart } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/ai-dj', label: 'AI DJ', icon: Wand2 },
  { to: '/explore', label: 'Explore', icon: LayoutGrid },
  { to: '/liked', label: 'Liked', icon: Heart },
];

export default function MobileNav() {
  const { current } = usePlayer();
  return (
    <nav className={`lg:hidden fixed left-0 right-0 z-30 glass-strong border-t flex items-center justify-around py-2 ${current ? 'bottom-16' : 'bottom-0'}`} style={{ borderColor: 'var(--border)' }}>
      {ITEMS.map(i => (
        <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${isActive ? 'text-white' : ''}`} style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-dim)' })}>
          <i.icon size={21} /> {i.label}
        </NavLink>
      ))}
    </nav>
  );
}
