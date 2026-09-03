import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchYouTubeSongs, getTrendingSongs } from '../lib/youtube';
import { usePlayer } from '../contexts/PlayerContext';
import { useGatedPlay } from '../lib/useGatedPlay';
import type { Song } from '../types';

// A horizontally-scrolling row of songs fetched live from YouTube.
// - trendingRegion: uses the cheap 1-unit videos.mostPopular endpoint
// - otherwise: uses the search endpoint
export default function YTRow({ title, query, subtitle, trendingRegion }: { title: string; query: string; subtitle?: string; trendingRegion?: string }) {
  const { current, isPlaying } = usePlayer();
  const playSong = useGatedPlay();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const cacheKey = `soniq_ytrow_${trendingRegion ? 'trend_' + trendingRegion : query}`;
    // Show cached results instantly (no blank screen), then refresh from API.
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && cached.length) { setSongs(cached); setLoading(false); }
    } catch {}
    const fetcher = trendingRegion
      ? getTrendingSongs(trendingRegion, 18)
      : searchYouTubeSongs(query, 14);
    fetcher
      .then((res) => {
        if (!alive || !res.length) return;
        setSongs(res);
        try { localStorage.setItem(cacheKey, JSON.stringify(res)); } catch {}
      })
      .catch(() => {
        if (!alive) return;
        setSongs((prev) => { if (!prev.length) setFailed(true); return prev; });
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [query, trendingRegion]);

  const scroll = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });
  };

  if (failed) return null;

  return (
    <section className="mb-9">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{subtitle}</p>}
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10"><ChevronLeft size={18} /></button>
          <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div ref={scroller} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {loading && songs.length === 0
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-40">
                <div className="skeleton aspect-square rounded-xl mb-2" />
                <div className="skeleton h-3 w-3/4 rounded mb-1.5" />
                <div className="skeleton h-2.5 w-1/2 rounded" />
              </div>
            ))
          : songs.map((s, i) => {
              const active = current?.id === s.id;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="group shrink-0 w-40 glass rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.09] hover:shadow-2xl hover:shadow-purple-500/25 hover:ring-1 hover:ring-white/10"
                  onClick={() => playSong(s, songs)}>
                  <div className="relative rounded-lg overflow-hidden aspect-square mb-2.5 shadow-lg bg-black/30">
                    <img src={s.cover} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)' }} />
                    <button
                      className="absolute bottom-2 right-2 z-30 w-11 h-11 rounded-full btn-glow flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl shadow-purple-500/50">
                      <Play size={17} className="text-white ml-0.5" fill="white" />
                    </button>
                    {active && isPlaying && (
                      <div className="absolute top-2 left-2 z-30 flex items-end gap-0.5 h-4 glass rounded px-1 py-0.5">
                        {[0,1,2,3].map(b => <span key={b} className="eq-bar w-0.5 rounded-full" style={{ background: '#06B6D4', animationDelay: `${b*0.12}s` }} />)}
                      </div>
                    )}
                  </div>
                  <p className={`text-sm font-medium truncate ${active ? 'text-cyan' : ''} group-hover:text-white transition-colors`} style={{ color: active ? '#06B6D4' : 'var(--text)' }}>{s.title}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-dim)' }}>{s.artist_name}</p>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}
