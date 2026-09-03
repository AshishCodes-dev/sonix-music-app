import { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard';
import { RowSkeleton } from '../components/Skeletons';
import { getArtists, formatCount } from '../lib/api';
import type { Artist } from '../types';

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getArtists().then(setArtists).finally(() => setLoading(false)); }, []);
  return (
    <div className="px-4 md:px-6 py-6">
      <h1 className="font-display text-3xl font-bold mb-6">Artists</h1>
      {loading ? <RowSkeleton /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artists.map(a => <MediaCard key={a.id} to={`/artist/${a.id}`} cover={a.image} title={a.name} subtitle={`${formatCount(a.monthly_listeners)} listeners`} round />)}
        </div>
      )}
    </div>
  );
}
