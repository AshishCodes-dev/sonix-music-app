import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Music2, Trash2 } from 'lucide-react';
import SongRow from '../components/SongRow';
import Loader from '../components/Loader';
import { getPlaylist, getSongs, formatDuration, request } from '../lib/api';
import { useGatedPlay } from '../lib/useGatedPlay';
import { useAuth } from '../contexts/AuthContext';
import type { Playlist, Song } from '../types';

export default function PlaylistDetail() {
  const { id } = useParams();
  const playSong = useGatedPlay();
  const { user } = useAuth();
  const [pl, setPl] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getPlaylist(Number(id)).then(async (p) => {
      setPl(p);
      const all = await getSongs('limit=100');
      const ordered = (p.song_ids || []).map((sid: number) => all.find((s: Song) => s.id === sid)).filter(Boolean) as Song[];
      setSongs(ordered);
    }).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const removeSong = async (songId: number) => {
    await request('/api/playlists', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Number(id), removeSong: songId }) });
    load();
  };

  if (loading) return <Loader />;
  if (!pl) return <div className="p-8">Playlist not found.</div>;
  const totalDur = songs.reduce((s, x) => s + x.duration, 0);
  const isOwner = user && pl.user_id === user.id;

  return (
    <div>
      <div className="relative px-4 md:px-8 pt-10 pb-6" style={{ background: 'linear-gradient(to bottom, rgba(37,99,235,0.35), transparent)' }}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          {pl.cover ? <img src={pl.cover} className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl" />
            : <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}><Music2 size={64} /></div>}
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{pl.is_public ? 'Public' : 'Private'} Playlist</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold my-3">{pl.name}</h1>
            <p style={{ color: 'var(--text-dim)' }}>{pl.description}</p>
            <p className="text-sm mt-2"><span className="font-semibold">{pl.owner_name}</span><span style={{ color: 'var(--text-dim)' }}> · {songs.length} songs · {formatDuration(totalDur)}</span></p>
          </div>
        </div>
      </div>
      <div className="px-4 md:px-8 py-4">
        <button onClick={() => songs.length && playSong(songs[0], songs)} className="w-14 h-14 rounded-full btn-glow flex items-center justify-center mb-6"><Play size={24} className="text-white ml-1" fill="white" /></button>
        {songs.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No songs yet. Add some from any track's menu.</p> : (
          <div className="glass rounded-2xl p-2">
            {songs.map((s, i) => (
              <div key={s.id} className="flex items-center group">
                <div className="flex-1"><SongRow song={s} index={i} queue={songs} /></div>
                {isOwner && <button onClick={() => removeSong(s.id)} className="opacity-0 group-hover:opacity-100 transition px-3"><Trash2 size={15} className="text-pink-400" /></button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
