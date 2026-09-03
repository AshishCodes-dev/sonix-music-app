import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music2, Mic2, Clock, Share2, Play } from 'lucide-react';
import { useHistory } from '../contexts/HistoryContext';
import { useLikes } from '../contexts/LikesContext';
import { useGatedPlay } from '../lib/useGatedPlay';
import { useToast } from '../contexts/ToastContext';

function topBy<T>(items: T[], key: (t: T) => string, n: number): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  items.forEach((it) => { const k = key(it); if (k) map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }));
}

export default function Replay() {
  const { recent } = useHistory();
  const { likedSongs } = useLikes();
  const playSong = useGatedPlay();
  const { toast } = useToast();

  const stats = useMemo(() => {
    const all = [...recent];
    const topArtists = topBy(all, (s) => (s.artist_name || '').split(/[,&(]/)[0].trim(), 5);
    const topSongs = all.slice(0, 5);
    const genres = topBy(all, (s: any) => s.genre || '', 4);
    // rough listening time estimate (avg 3.5 min/track)
    const minutes = Math.round(all.length * 3.5);
    return { count: all.length, topArtists, topSongs, genres, minutes, likes: likedSongs.length };
  }, [recent, likedSongs]);

  const share = async () => {
    const text = `My SONIQ Replay 🎵\n${stats.count} songs played · ${stats.minutes} min\nTop artist: ${stats.topArtists[0]?.name || '—'}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My SONIQ Replay', text });
      else { await navigator.clipboard.writeText(text); toast('Replay copied to clipboard!', 'success'); }
    } catch {}
  };

  const year = new Date().getFullYear();

  if (stats.count === 0) {
    return (
      <div className="px-4 md:px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-full glass mx-auto flex items-center justify-center mb-5"><Sparkles size={32} style={{ color: '#EC4899' }} /></div>
        <h1 className="font-display text-3xl font-bold mb-2">Your Replay is waiting</h1>
        <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-dim)' }}>Play some songs and your personalised music recap will appear here.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden p-8 md:p-12 mb-6 neon-ring"
        style={{ background: 'radial-gradient(130% 130% at 100% 0%, #EC4899 0%, #7C3AED 40%, #06283d 100%)' }}>
        <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full blur-3xl animate-float" style={{ background: 'rgba(6,182,212,0.4)' }} />
        <div className="relative">
          <p className="text-xs tracking-[0.3em] mb-2">SONIQ REPLAY · {year}</p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold">Your Year <span className="text-white/90">in Music</span></h1>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="glass-strong rounded-2xl px-5 py-3"><p className="text-2xl font-bold">{stats.count}</p><p className="text-xs opacity-80">Songs played</p></div>
            <div className="glass-strong rounded-2xl px-5 py-3"><p className="text-2xl font-bold">{stats.minutes}</p><p className="text-xs opacity-80">Minutes</p></div>
            <div className="glass-strong rounded-2xl px-5 py-3"><p className="text-2xl font-bold">{stats.likes}</p><p className="text-xs opacity-80">Liked</p></div>
          </div>
          <button onClick={share} className="mt-6 bg-white text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition">
            <Share2 size={17} /> Share your Replay
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top artists */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Mic2 size={20} style={{ color: '#EC4899' }} /> Top Artists</h2>
          <div className="space-y-3">
            {stats.topArtists.map((a, i) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="font-display text-lg font-bold w-6" style={{ color: 'var(--text-dim)' }}>{i + 1}</span>
                <span className="flex-1 font-medium truncate">{a.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{a.count} plays</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top songs */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Music2 size={20} style={{ color: '#06B6D4' }} /> Top Songs</h2>
          <div className="space-y-2">
            {stats.topSongs.map((s, i) => (
              <button key={`${s.id}-${i}`} onClick={() => playSong(s, stats.topSongs)} className="flex items-center gap-3 w-full text-left hover:bg-white/5 rounded-lg p-1.5 group">
                <span className="font-display text-lg font-bold w-6" style={{ color: 'var(--text-dim)' }}>{i + 1}</span>
                <img src={s.cover} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0"><p className="text-sm truncate">{s.title}</p><p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{s.artist_name}</p></div>
                <Play size={15} className="opacity-0 group-hover:opacity-100" style={{ color: '#06B6D4' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genres */}
      {stats.genres.length > 0 && (
        <div className="glass rounded-2xl p-6 mt-6">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Clock size={20} style={{ color: '#7C3AED' }} /> Your Top Genres</h2>
          <div className="flex flex-wrap gap-2">
            {stats.genres.map((g) => (
              <span key={g.name} className="glass px-4 py-2 rounded-full text-sm">{g.name} · {g.count}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
