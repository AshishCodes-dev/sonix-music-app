import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import SongRow from '../components/SongRow';
import Loader from '../components/Loader';
import { getAlbum, getSongs, formatDuration } from '../lib/api';
import { useGatedPlay } from '../lib/useGatedPlay';
import type { Album, Song } from '../types';

export default function AlbumDetail() {
  const { id } = useParams();
  const playSong = useGatedPlay();
  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAlbum(Number(id)), getSongs(`album_id=${id}`)])
      .then(([a, s]) => { setAlbum(a); setSongs(s); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!album) return <div className="p-8">Album not found.</div>;
  const totalDur = songs.reduce((s, x) => s + x.duration, 0);

  return (
    <div>
      <div className="relative px-4 md:px-8 pt-10 pb-6" style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.35), transparent)' }}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <img src={album.cover} className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl" />
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Album</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold my-3">{album.title}</h1>
            <p style={{ color: 'var(--text-dim)' }}>{album.description}</p>
            <p className="text-sm mt-2">
              <Link to={`/artist/${album.artist_id}`} className="font-semibold hover:underline">{album.artist_name}</Link>
              <span style={{ color: 'var(--text-dim)' }}> · {album.year} · {songs.length} songs · {formatDuration(totalDur)}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 md:px-8 py-4">
        <button onClick={() => songs.length && playSong(songs[0], songs)} className="w-14 h-14 rounded-full btn-glow flex items-center justify-center mb-6"><Play size={24} className="text-white ml-1" fill="white" /></button>
        <div className="glass rounded-2xl p-2">
          {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />)}
        </div>
      </div>
    </div>
  );
}
