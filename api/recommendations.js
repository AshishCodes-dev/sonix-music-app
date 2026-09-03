import supabase from './db-client.js';
import { audioFor } from './audio-map.js';
import { applyCors, rateLimit } from './_security.js';

// Lightweight AI-style recommender: based on user's most-played genre/mood
export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 60, windowMs: 60000 })) return;
  try {
    const { user_id, mood } = req.query;
    if (mood) {
      const { data, error } = await supabase.from('songs').select('*').eq('mood', mood).limit(12);
      if (error) throw error;
      return res.status(200).json((data || []).map((s) => ({ ...s, audio_url: audioFor(s) })));
    }
    let genres = [];
    if (user_id) {
      const { data: hist } = await supabase.from('listening_history').select('song_id').eq('user_id', user_id).limit(10);
      const ids = (hist || []).map((h) => h.song_id);
      if (ids.length) {
        const { data: songs } = await supabase.from('songs').select('genre').in('id', ids);
        genres = [...new Set((songs || []).map((s) => s.genre))];
      }
    }
    let query = supabase.from('songs').select('*').order('plays', { ascending: false });
    if (genres.length) query = query.in('genre', genres);
    const { data, error } = await query.limit(12);
    if (error) throw error;
    // shuffle for variety
    const shuffled = (data || []).map((s) => ({ ...s, audio_url: audioFor(s) })).sort(() => Math.random() - 0.5);
    return res.status(200).json(shuffled);
  } catch (err) {
    console.error('recommendations API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
