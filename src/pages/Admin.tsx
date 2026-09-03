import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2, Mic2, Disc3, ListMusic, Play, Users, DollarSign, TrendingUp } from 'lucide-react';
import { getSongs, request } from '../lib/api';
import { formatCount } from '../lib/api';
import type { Song } from '../types';

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    request('/api/admin-music').then(r => r.json()).then(setStats);
    getSongs('trending=true&limit=50').then(setSongs);
  }, []);

  if (!stats) return <div className="py-32 text-center">Loading dashboard...</div>;
  const cards = [
    { label: 'Total Plays', value: formatCount(stats.totalPlays), icon: Play, color: '#06B6D4' },
    { label: 'Songs', value: stats.totalSongs, icon: Music2, color: '#7C3AED' },
    { label: 'Artists', value: stats.totalArtists, icon: Mic2, color: '#EC4899' },
    { label: 'Albums', value: stats.totalAlbums, icon: Disc3, color: '#2563EB' },
    { label: 'Playlists', value: stats.totalPlaylists, icon: ListMusic, color: '#06B6D4' },
    { label: 'Followers', value: formatCount(stats.totalFollowers), icon: Users, color: '#7C3AED' },
    { label: 'Est. Revenue', value: '$' + formatCount(stats.revenue), icon: DollarSign, color: '#EC4899' },
  ];
  return (
    <div className="px-4 md:px-6 py-6">
      <h1 className="font-display text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
            <c.icon size={22} style={{ color: c.color }} />
            <p className="text-2xl font-bold mt-3">{c.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp size={20} style={{ color: '#06B6D4' }} /> Songs by Genre</h2>
        <div className="space-y-2">
          {Object.entries(stats.byGenre).map(([g, n]: any) => (
            <div key={g} className="flex items-center gap-3">
              <span className="text-sm w-28" style={{ color: 'var(--text-dim)' }}>{g}</span>
              <div className="flex-1 h-2 rounded-full glass overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(n / stats.totalSongs) * 100}%`, background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }} /></div>
              <span className="text-sm w-6">{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left" style={{ color: 'var(--text-dim)' }}><th className="p-4">Song</th><th className="p-4">Artist</th><th className="p-4">Genre</th><th className="p-4">Plays</th></tr></thead>
          <tbody>{songs.map(s => (
            <tr key={s.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
              <td className="p-4 flex items-center gap-3"><img src={s.cover} className="w-9 h-9 rounded-lg object-cover" /><span className="font-medium">{s.title}</span></td>
              <td className="p-4" style={{ color: 'var(--text-dim)' }}>{s.artist_name}</td>
              <td className="p-4" style={{ color: 'var(--text-dim)' }}>{s.genre}</td>
              <td className="p-4">{formatCount(s.plays)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}
