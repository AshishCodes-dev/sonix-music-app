import { motion } from 'framer-motion';
import { X, Play, Pause } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import Equalizer from './Equalizer';

export default function QueuePanel({ onClose }: { onClose: () => void }) {
  const { queue, current, isPlaying, playSong, togglePlay } = usePlayer();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] flex justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween' }}
        className="w-96 max-w-[90%] glass-strong h-full p-5 overflow-y-auto no-scrollbar mb-20" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl">Play Queue</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="space-y-1 pb-24">
          {queue.map((s, i) => {
            const isCur = current?.id === s.id;
            return (
              <button key={`${s.id}-${i}`} onClick={() => isCur ? togglePlay() : playSong(s, queue)}
                className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 text-left ${isCur ? 'bg-white/5' : ''}`}>
                <div className="relative">
                  <img src={s.cover} className="w-11 h-11 rounded-lg object-cover" />
                  {isCur && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">{isPlaying ? <Equalizer active /> : <Play size={14} />}</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${isCur ? 'text-cyan' : ''}`} style={{ color: isCur ? '#06B6D4' : 'var(--text)' }}>{s.title}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{s.artist_name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
