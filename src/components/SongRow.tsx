import { Play, Pause, Heart, Plus, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Equalizer from './Equalizer';
import { usePlayer } from '../contexts/PlayerContext';
import { useGatedPlay } from '../lib/useGatedPlay';
import { useLikes } from '../contexts/LikesContext';
import { useToast } from '../contexts/ToastContext';
import { formatDuration, formatCount } from '../lib/api';
import type { Song } from '../types';

export default function SongRow({ song, index, queue, onAdd }: { song: Song; index: number; queue: Song[]; onAdd?: (s: Song) => void }) {
  const { current, isPlaying, togglePlay } = usePlayer();
  const playSong = useGatedPlay();
  const { isLiked, toggleLike } = useLikes();
  const { toast } = useToast();
  const isCurrent = current?.id === song.id;

  const handleLike = () => {
    const wasLiked = isLiked(song.id);
    toggleLike(song);
    toast(wasLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs', wasLiked ? 'info' : 'success');
  };

  return (
    <div className={`group grid grid-cols-[24px_1fr_auto] md:grid-cols-[24px_4fr_2fr_auto_60px] items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition ${isCurrent ? 'bg-white/5' : ''}`}>
      <div className="flex items-center justify-center w-6">
        <button onClick={() => isCurrent ? togglePlay() : playSong(song, queue)} className="relative">
          {isCurrent && isPlaying ? (
            <span className="group-hover:hidden"><Equalizer active /></span>
          ) : (
            <span className="group-hover:hidden text-sm" style={{ color: isCurrent ? '#06B6D4' : 'var(--text-dim)' }}>{index + 1}</span>
          )}
          <span className="hidden group-hover:block">
            {isCurrent && isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </span>
        </button>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <img src={song.cover} className="w-10 h-10 rounded-lg object-cover shrink-0" />
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-cyan' : ''}`} style={{ color: isCurrent ? '#06B6D4' : 'var(--text)' }}>{song.title}</p>
          <Link to={`/artist/${song.artist_id}`} className="text-xs truncate hover:underline block" style={{ color: 'var(--text-dim)' }}>{song.artist_name}</Link>
        </div>
      </div>
      <Link to={`/album/${song.album_id}`} className="hidden md:block text-xs truncate hover:underline" style={{ color: 'var(--text-dim)' }}>{song.album_name}</Link>
      <div className="hidden md:flex items-center gap-3">
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{formatCount(song.plays)}</span>
        {onAdd && <button onClick={() => onAdd(song)} className="opacity-0 group-hover:opacity-100 transition" title="Add to playlist"><Plus size={16} style={{ color: 'var(--text-dim)' }} /></button>}
      </div>
      <div className="flex items-center gap-3 justify-end">
        <button onClick={handleLike}>
          <Heart size={15} style={{ fill: isLiked(song.id) ? '#EC4899' : 'transparent', color: isLiked(song.id) ? '#EC4899' : 'var(--text-dim)' }} />
        </button>
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-dim)' }}>{formatDuration(song.duration)}</span>
      </div>
    </div>
  );
}
