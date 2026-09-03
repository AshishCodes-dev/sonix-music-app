import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Play } from 'lucide-react';
import SongRow from '../components/SongRow';
import Loader from '../components/Loader';
import { getSongs, getRecommendations } from '../lib/api';
import { useGatedPlay } from '../lib/useGatedPlay';
import type { Song } from '../types';

export default function GenreMood() {
  const { value } = useParams();
  const { pathname } = useLocation();
  const isMood = pathname.startsWith('/mood');
  const playSong = useGatedPlay();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = isMood ? getRecommendations(`mood=${value}`) : getSongs(`genre=${value}`);
    p.then(setSongs).finally(() => setLoading(false));
  }, [value, isMood]);

  if (loading) return <Loader />;
  return (
    <div className="px-4 md:px-6 py-6">
      <div className="relative rounded-3xl overflow-hidden mb-8 p-8 md:p-12" style={{ background: 'linear-gradient(120deg,#EC4899,#7C3AED,#2563EB)' }}>
        <p className="text-xs tracking-[0.3em] mb-2">{isMood ? 'MOOD' : 'GENRE'}</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold">{value}</h1>
        <button onClick={() => songs.length && playSong(songs[0], songs)} className="mt-5 bg-white text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2"><Play size={18} fill="black" /> Play All</button>
      </div>
      <div className="glass rounded-2xl p-2">
        {songs.length ? songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />) : <p className="p-6" style={{ color: 'var(--text-dim)' }}>No songs found.</p>}
      </div>
    </div>
  );
}
