import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard';
import { RowSkeleton } from '../components/Skeletons';
import { getAlbums } from '../lib/api';
import type { Album } from '../types';

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAlbums().then(setAlbums).finally(() => setLoading(false)); }, []);
  return (
    <div className="px-4 md:px-6 py-6">
      <h1 className="font-display text-3xl font-bold mb-6">Albums</h1>
      {loading ? <RowSkeleton /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {albums.map(a => <MediaCard key={a.id} to={`/album/${a.id}`} cover={a.cover} title={a.title} subtitle={`${a.artist_name} · ${a.year}`} />)}
        </div>
      )}
    </div>
  );
}
