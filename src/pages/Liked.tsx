import { Play, Heart } from 'lucide-react';
import SongRow from '../components/SongRow';
import { useLikes } from '../contexts/LikesContext';
import { useGatedPlay } from '../lib/useGatedPlay';

export default function Liked() {
  const { likedSongs } = useLikes();
  const playSong = useGatedPlay();

  return (
    <div>
      <div className="relative px-4 md:px-8 pt-12 pb-6" style={{ background: 'linear-gradient(to bottom, rgba(236,72,153,0.4), transparent)' }}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
            <Heart size={72} className="text-white" fill="white" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Playlist</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold my-3">Liked Songs</h1>
            <p style={{ color: 'var(--text-dim)' }}>{likedSongs.length} songs</p>
          </div>
        </div>
      </div>
      <div className="px-4 md:px-8 py-4">
        {likedSongs.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <Heart size={48} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
            <p className="font-display text-2xl mb-1">Songs you like will appear here</p>
            <p style={{ color: 'var(--text-dim)' }}>Tap the heart on any track to save it.</p>
          </div>
        ) : (
          <>
            <button onClick={() => playSong(likedSongs[0], likedSongs)} className="w-14 h-14 rounded-full btn-glow flex items-center justify-center mb-6">
              <Play size={24} className="text-white ml-1" fill="white" />
            </button>
            <div className="glass rounded-2xl p-2">
              {likedSongs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={likedSongs} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
