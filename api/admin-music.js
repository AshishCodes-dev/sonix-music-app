import supabase from './_db-client.js';
import { applyCors, rateLimit } from './_security.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 30, windowMs: 60000 })) return;
  try {
    if (req.method === 'GET') {
      const [songs, artists, albums, playlists] = await Promise.all([
        supabase.from('songs').select('id, plays, genre'),
        supabase.from('artists').select('id, followers'),
        supabase.from('albums').select('id'),
        supabase.from('playlists').select('id'),
      ]);
      const allSongs = songs.data || [];
      const totalPlays = allSongs.reduce((s, x) => s + Number(x.plays || 0), 0);
      const byGenre = {};
      allSongs.forEach((s) => { byGenre[s.genre] = (byGenre[s.genre] || 0) + 1; });
      const totalFollowers = (artists.data || []).reduce((s, a) => s + Number(a.followers || 0), 0);
      return res.status(200).json({
        totalSongs: allSongs.length,
        totalArtists: (artists.data || []).length,
        totalAlbums: (albums.data || []).length,
        totalPlaylists: (playlists.data || []).length,
        totalPlays, totalFollowers, byGenre,
        revenue: Math.round(totalPlays * 0.004 * 100) / 100,
      });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('admin-music API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
