import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, Volume1, VolumeX, Heart, Maximize2, ListMusic,
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useLikes } from '../contexts/LikesContext';
import { formatDuration } from '../lib/api';
import FullScreenPlayer from './FullScreenPlayer';
import QueuePanel from './QueuePanel';

function BarVisualizer({ active }: { active: boolean }) {
  return (
    <div className="hidden lg:flex items-end gap-0.5 h-8 w-20">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="eq-bar flex-1 rounded-full"
          style={{
            background: 'linear-gradient(to top,#06B6D4,#7C3AED,#EC4899)',
            animationDelay: `${(i % 6) * 0.12}s`,
            animationDuration: `${0.6 + (i % 4) * 0.15}s`,
            animationPlayState: active ? 'running' : 'paused',
            height: active ? undefined : '25%',
          }} />
      ))}
    </div>
  );
}

export default function PlayerBar() {
  const { current, isPlaying, isLoading, progress, duration, volume, shuffle, repeat, error, togglePlay, next, prev, seek, setVolume, toggleShuffle, cycleRepeat } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const [full, setFull] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  if (!current) return null;

  const VolIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const pct = (progress / duration) * 100 || 0;

  return (
    <>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t" style={{ borderColor: 'var(--border)' }}>
        {error && (
          <div className="text-center text-xs py-1.5 px-3" style={{ background: 'rgba(236,72,153,0.15)', color: '#f9a8d4' }}>
            {error} {error.includes('Settings') && <Link to="/settings" className="underline font-semibold">Open Settings</Link>}
          </div>
        )}
        <div className="absolute -top-px left-0 right-0 h-1 group cursor-pointer"
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * duration); }}>
          <div className="h-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#06B6D4,#7C3AED,#EC4899)' }} />
        </div>

        {/* ---------- MOBILE mini player (compact, tap to expand) ---------- */}
        <div className="lg:hidden flex items-center gap-3 px-3 h-16">
          <img src={current.cover} className="w-11 h-11 rounded-lg object-cover shrink-0" onClick={() => setFull(true)} />
          <div className="min-w-0 flex-1" onClick={() => setFull(true)}>
            <p className="text-sm font-medium truncate">{current.title}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{current.artist_name}</p>
          </div>
          <button onClick={() => toggleLike(current)} className="shrink-0">
            <Heart size={20} style={{ fill: isLiked(current.id) ? '#EC4899' : 'transparent', color: isLiked(current.id) ? '#EC4899' : 'var(--text-dim)' }} />
          </button>
          <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0">
            {isLoading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : isPlaying ? <Pause size={19} fill="black" /> : <Play size={19} fill="black" className="ml-0.5" />}
          </button>
          <button onClick={next} className="shrink-0"><SkipForward size={21} fill="currentColor" /></button>
        </div>

        {/* ---------- DESKTOP full player ---------- */}
        <div className="hidden lg:flex max-w-[1600px] mx-auto px-6 h-20 items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 w-[30%]">
            <img src={current.cover} className="w-14 h-14 rounded-lg object-cover cursor-pointer shrink-0" onClick={() => setFull(true)} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{current.title}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{current.artist_name}</p>
            </div>
            <button onClick={() => toggleLike(current)} className="shrink-0">
              <Heart size={17} style={{ fill: isLiked(current.id) ? '#EC4899' : 'transparent', color: isLiked(current.id) ? '#EC4899' : 'var(--text-dim)' }} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
            <div className="flex items-center gap-5">
              <button onClick={toggleShuffle} title="Shuffle"><Shuffle size={17} style={{ color: shuffle ? '#06B6D4' : 'var(--text-dim)' }} /></button>
              <button onClick={prev}><SkipBack size={19} fill="currentColor" /></button>
              <button onClick={togglePlay} className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg">
                {isLoading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
              </button>
              <button onClick={next}><SkipForward size={19} fill="currentColor" /></button>
              <button onClick={cycleRepeat} title="Repeat">
                {repeat === 'one' ? <Repeat1 size={17} style={{ color: '#06B6D4' }} /> : <Repeat size={17} style={{ color: repeat === 'all' ? '#06B6D4' : 'var(--text-dim)' }} />}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] tabular-nums w-9 text-right" style={{ color: 'var(--text-dim)' }}>{formatDuration(progress)}</span>
              <input type="range" min={0} max={duration || 0} value={progress} onChange={e => seek(Number(e.target.value))}
                className="flex-1 h-1 rounded-full" style={{ background: `linear-gradient(90deg,#7C3AED ${pct}%, rgba(255,255,255,0.15) ${pct}%)` }} />
              <span className="text-[10px] tabular-nums w-9" style={{ color: 'var(--text-dim)' }}>{formatDuration(duration || current.duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end w-[30%]">
            <BarVisualizer active={isPlaying} />
            <button onClick={() => setShowQueue(true)} title="Queue"><ListMusic size={18} style={{ color: 'var(--text-dim)' }} /></button>
            <div className="flex items-center gap-2">
              <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}><VolIcon size={18} style={{ color: 'var(--text-dim)' }} /></button>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))}
                className="w-20 h-1 rounded-full" style={{ background: `linear-gradient(90deg,#06B6D4 ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)` }} />
            </div>
            <button onClick={() => setFull(true)} title="Full screen"><Maximize2 size={17} style={{ color: 'var(--text-dim)' }} /></button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>{full && <FullScreenPlayer onClose={() => setFull(false)} />}</AnimatePresence>
      <AnimatePresence>{showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}</AnimatePresence>
    </>
  );
}
