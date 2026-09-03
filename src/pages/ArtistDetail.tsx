import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, CheckCircle2, Plus, Check } from 'lucide-react';
import SongRow from '../components/SongRow';
import MediaCard from '../components/MediaCard';
import Loader from '../components/Loader';
import { getArtist, getSongs, getAlbums, formatCount } from '../lib/api';
import { usePlayer } from '../contexts/PlayerContext';
import type { Artist, Song, Album } from '../types';

export default function ArtistDetail() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getArtist(Number(id)), getSongs(`artist_id=${id}`), getAlbums(`artist_id=${id}`)])
      .then(([a, s, al]) => { setArtist(a); setSongs(s.sort((x, y) => y.plays - x.plays)); setAlbums(al); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!artist) return <div className="p-8">Artist not found.</div>;

  return (
    <div>
      <div className="relative h-72 md:h-96">
        <img src={artist.cover} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg), rgba(2,6,23,0.4))' }} />
        <div className="absolute bottom-0 p-6 md:p-8">
          {artist.verified && <span className="flex items-center gap-1.5 text-sm mb-2"><CheckCircle2 size={18} style={{ color: '#06B6D4' }} /> Verified Artist</span>}
          <h1 className="font-display text-5xl md:text-7xl font-bold">{artist.name}</h1>
          <p className="mt-2" style={{ color: 'var(--text-dim)' }}>{formatCount(artist.monthly_listeners)} monthly listeners</p>
        </div>
      </div>
      <div className="px-4 md:px-8 py-5">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => songs.length && playSong(songs[0], songs)} className="w-14 h-14 rounded-full btn-glow flex items-center justify-center"><Play size={24} className="text-white ml-1" fill="white" /></button>
          <button onClick={() => setFollowing(f => !f)} className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition ${following ? 'glass' : 'border-white/30 hover:border-white'}`} style={{ borderColor: following ? 'transparent' : undefined }}>
            {following ? <span className="flex items-center gap-1.5"><Check size={15} /> Following</span> : <span className="flex items-center gap-1.5"><Plus size={15} /> Follow</span>}
          </button>
        </div>
        <p className="max-w-2xl mb-8" style={{ color: 'var(--text-dim)' }}>{artist.bio}</p>

        <h2 className="font-display text-2xl font-bold mb-4">Popular</h2>
        <div className="glass rounded-2xl p-2 mb-10">
          {songs.slice(0, 5).map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />)}
        </div>

        {albums.length > 0 && (
          <>
            <h2 className="font-display text-2xl font-bold mb-4">Discography</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {albums.map(a => <MediaCard key={a.id} to={`/album/${a.id}`} cover={a.cover} title={a.title} subtitle={String(a.year)} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
