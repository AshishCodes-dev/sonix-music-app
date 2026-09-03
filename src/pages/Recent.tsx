import { Clock, Play, Trash2 } from 'lucide-react';
import { useHistory } from '../contexts/HistoryContext';
import { useGatedPlay } from '../lib/useGatedPlay';
import SongRow from '../components/SongRow';

export default function Recent() {
  const { recent, clearRecent } = useHistory();
  const playSong = useGatedPlay();

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs tracking-[0.3em] mb-1" style={{ color: '#06B6D4' }}>YOUR ACTIVITY</p>
          <h1 className="font-display text-4xl font-bold">Recently Played</h1>
        </div>
        {recent.length > 0 && (
          <button onClick={clearRecent} className="flex items-center gap-1.5 text-xs glass px-3 py-2 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-dim)' }}>
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-5">
            <Clock size={32} style={{ color: 'var(--text-dim)' }} />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No history yet</h2>
          <p className="text-sm max-w-xs" style={{ color: 'var(--text-dim)' }}>Songs you play will appear here so you can pick up where you left off.</p>
        </div>
      ) : (
        <>
          <button onClick={() => playSong(recent[0], recent)} className="btn-glow text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 mb-6">
            <Play size={18} fill="white" /> Play All
          </button>
          <div className="glass rounded-2xl p-2">
            {recent.map((s, i) => <SongRow key={`${s.id}_${i}`} song={s} index={i} queue={recent} />)}
          </div>
        </>
      )}
    </div>
  );
}
