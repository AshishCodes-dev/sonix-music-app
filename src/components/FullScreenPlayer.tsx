import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, ChevronDown, Mic2, Volume2, Moon, ExternalLink, Loader2,
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useLikes } from '../contexts/LikesContext';
import { formatDuration } from '../lib/api';
import { fetchLyrics } from '../lib/youtube';

const SLEEP_OPTIONS = [15, 30, 45, 60];

export default function FullScreenPlayer({ onClose }: { onClose: () => void }) {
  const { current, isPlaying, progress, duration, volume, shuffle, repeat, sleepTimer, speed, togglePlay, next, prev, seek, setVolume, toggleShuffle, cycleRepeat, setSleepTimer, setSpeed } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSleep, setShowSleep] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  // Fetch lyrics inside the app whenever the song changes (or lyrics panel opens)
  useEffect(() => {
    if (!current) return;
    if (current.lyrics && current.lyrics.trim()) { setLyrics(current.lyrics); return; }
    setLyrics(null);
    setLyricsLoading(true);
    let cancelled = false;
    fetchLyrics(current.title, current.artist_name)
      .then((l) => { if (!cancelled) setLyrics(l); })
      .finally(() => { if (!cancelled) setLyricsLoading(false); });
    return () => { cancelled = true; };
  }, [current?.id]);

  if (!current) return null;

  const lyricsUrl = `https://www.google.com/search?q=${encodeURIComponent(current.title + ' ' + current.artist_name + ' lyrics')}`;

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.4 }}
      className="fixed inset-0 z-[60] overflow-hidden">
      {/* animated blurred cover background */}
      <div className="absolute inset-0">
        <img src={current.cover} className="w-full h-full object-cover scale-125 blur-3xl opacity-40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(2,6,23,0.7), rgba(0,0,0,0.95))' }} />
      </div>

      <div className="relative h-full flex flex-col p-5 md:p-8 max-w-5xl mx-auto overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="glass w-10 h-10 rounded-full flex items-center justify-center"><ChevronDown size={22} /></button>
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--text-dim)' }}>Now Playing</p>
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button onClick={() => setShowSleep(s => !s)} className={`glass w-10 h-10 rounded-full flex items-center justify-center ${sleepTimer ? 'text-cyan' : ''}`} title="Sleep timer">
                <Moon size={17} style={{ color: sleepTimer ? '#06B6D4' : undefined }} />
              </button>
              <AnimatePresence>{showSleep && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-12 glass-strong rounded-xl p-2 w-40 z-10">
                  <p className="text-[11px] uppercase tracking-wider px-2 py-1" style={{ color: 'var(--text-dim)' }}>Sleep Timer</p>
                  {SLEEP_OPTIONS.map(m => (
                    <button key={m} onClick={() => { setSleepTimer(m); setShowSleep(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10">{m} minutes</button>
                  ))}
                  {sleepTimer !== null && <button onClick={() => { setSleepTimer(null); setShowSleep(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-pink-400 hover:bg-white/10">Turn off ({sleepTimer}m left)</button>}
                </motion.div>
              )}</AnimatePresence>
            </div>
            <button onClick={() => setShowLyrics(s => !s)} className={`glass w-10 h-10 rounded-full flex items-center justify-center ${showLyrics ? 'text-cyan' : ''}`}>
              <Mic2 size={18} style={{ color: showLyrics ? '#06B6D4' : undefined }} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 min-h-0 py-4">
          {/* Rotating vinyl */}
          <div className="relative shrink-0">
            <div className={`w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full ${isPlaying ? 'animate-vinyl' : 'animate-vinyl animate-vinyl-paused'}`}
              style={{ background: 'radial-gradient(circle, #111 30%, #000 32%, #1a1a1a 33%, #000 40%, #1a1a1a 41%, #000 50%)', boxShadow: '0 0 80px rgba(124,58,237,0.5)' }}>
              <img src={current.cover} className="absolute inset-0 m-auto w-32 h-32 md:w-40 md:h-40 rounded-full object-cover" style={{ top: 0, bottom: 0, left: 0, right: 0 }} />
              <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-black border-2 border-white/20" style={{ top: 0, bottom: 0, left: 0, right: 0 }} />
            </div>
          </div>

          {showLyrics ? (
            <div className="flex-1 max-h-[50vh] overflow-y-auto no-scrollbar text-center md:text-left">
              <h2 className="font-display text-2xl mb-4">{current.title}</h2>
              {lyricsLoading ? (
                <div className="flex items-center gap-2 justify-center md:justify-start" style={{ color: 'var(--text-dim)' }}>
                  <Loader2 size={18} className="animate-spin" /> Fetching lyrics...
                </div>
              ) : lyrics ? (
                <pre className="font-sans text-lg leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-dim)' }}>{lyrics}</pre>
              ) : (
                <div>
                  <p className="text-lg mb-4" style={{ color: 'var(--text-dim)' }}>Lyrics couldn't be found for this track.</p>
                  <a href={lyricsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 btn-glow text-white px-5 py-2.5 rounded-full text-sm">
                    <ExternalLink size={16} /> Search lyrics online
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center md:text-left">
              <span className="text-xs px-3 py-1 glass rounded-full">{current.genre} · {current.mood}</span>
              <h1 className="font-display text-4xl md:text-6xl font-bold mt-4 mb-2">{current.title}</h1>
              <p className="text-xl" style={{ color: 'var(--text-dim)' }}>{current.artist_name}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>{current.album_name}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="max-w-2xl w-full mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs tabular-nums w-10 text-right" style={{ color: 'var(--text-dim)' }}>{formatDuration(progress)}</span>
            <input type="range" min={0} max={duration || 0} value={progress} onChange={e => seek(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg,#7C3AED ${(progress / duration) * 100 || 0}%, rgba(255,255,255,0.15) ${(progress / duration) * 100 || 0}%)` }} />
            <span className="text-xs tabular-nums w-10" style={{ color: 'var(--text-dim)' }}>{formatDuration(duration || current.duration)}</span>
          </div>
          <div className="flex items-center justify-center gap-6 md:gap-8">
            <button onClick={toggleShuffle}><Shuffle size={20} style={{ color: shuffle ? '#06B6D4' : 'var(--text-dim)' }} /></button>
            <button onClick={prev}><SkipBack size={26} fill="currentColor" /></button>
            <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-2xl">
              {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
            </button>
            <button onClick={next}><SkipForward size={26} fill="currentColor" /></button>
            <button onClick={cycleRepeat}>
              {repeat === 'one' ? <Repeat1 size={20} style={{ color: '#06B6D4' }} /> : <Repeat size={20} style={{ color: repeat === 'all' ? '#06B6D4' : 'var(--text-dim)' }} />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-5 gap-3">
            <button onClick={() => toggleLike(current)} className="flex items-center gap-2 text-sm shrink-0">
              <Heart size={18} style={{ fill: isLiked(current.id) ? '#EC4899' : 'transparent', color: isLiked(current.id) ? '#EC4899' : 'var(--text-dim)' }} />
            </button>
            {/* Playback speed */}
            <button onClick={() => { const opts = [1, 1.25, 1.5, 2, 0.75]; const idx = opts.indexOf(speed); setSpeed(opts[(idx + 1) % opts.length]); }}
              className="glass px-3 py-1.5 rounded-full text-xs font-semibold shrink-0" title="Playback speed">
              {speed}x
            </button>
            <div className="flex items-center gap-2 flex-1 max-w-[160px]">
              <Volume2 size={16} style={{ color: 'var(--text-dim)' }} />
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))}
                className="flex-1 h-1 rounded-full" style={{ background: `linear-gradient(90deg,#06B6D4 ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)` }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
