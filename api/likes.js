import supabase from './db-client.js';
import { applyCors, rateLimit } from './_security.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 90, windowMs: 60000 })) return;
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      const { data, error } = await supabase.from('liked_songs').select('*').eq('user_id', user_id).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, song_id } = req.body || {};
      const { data: existing } = await supabase.from('liked_songs').select('id').eq('user_id', user_id).eq('song_id', song_id).maybeSingle();
      if (existing) { await supabase.from('liked_songs').delete().eq('id', existing.id); return res.status(200).json({ liked: false }); }
      await supabase.from('liked_songs').insert({ user_id, song_id, created_at: new Date().toISOString() });
      return res.status(200).json({ liked: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('likes API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
