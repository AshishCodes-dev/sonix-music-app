import { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import SongRow from '../components/SongRow';
import { getTrendingSongs, hasApiKey } from '../lib/youtube';
import { getSongs } from '../lib/api';
import { useGatedPlay } from '../lib/useGatedPlay';
import type { Song } from '../types';

const REGIONS = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'Global' },
  { code: 'GB', label: 'UK' },
];

export default function Trending() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('IN');
  const playSong = useGatedPlay();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const cacheKey = `soniq_trending_page_${region}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && cached.length) { setSongs(cached); setLoading(false); }
    } catch {}
    if (hasApiKey()) {
      getTrendingSongs(region, 40)
        .then((res) => {
          if (!alive || !res.length) return;
          setSongs(res);
          try { localStorage.setItem(cacheKey, JSON.stringify(res)); } catch {}
        })
        .catch(() => {})
        .finally(() => { if (alive) setLoading(false); });
    } else {
      getSongs('trending=true').then((r) => { if (alive) { setSongs(r); setLoading(false); } });
    }
    return () => { alive = false; };
  }, [region]);

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="relative rounded-3xl overflow-hidden mb-8 p-8 md:p-12" style={{ background: 'linear-gradient(120deg,#7C3AED,#2563EB,#06B6D4)' }}>
        <p className="text-xs tracking-[0.3em] mb-2">CHARTS · TOP 40</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold">Trending Now</h1>
        <p className="mt-2 opacity-90">The most popular music videos on YouTube right now.</p>
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button onClick={() => songs.length && playSong(songs[0], songs)} className="bg-white text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2"><Play size={18} fill="black" /> Play All</button>
          <div className="flex gap-1.5 glass-strong rounded-full p-1">
            {REGIONS.map((r) => (
              <button key={r.code} onClick={() => setRegion(r.code)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${region === r.code ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {loading && songs.length === 0 ? (
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-dim)' }}>
          <Loader2 className="animate-spin mr-2" size={20} /> Loading charts…
        </div>
      ) : (
        <div className="glass rounded-2xl p-2">
          {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />)}
        </div>
      )}
    </div>
  );
}
