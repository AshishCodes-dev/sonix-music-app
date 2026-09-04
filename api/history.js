import supabase from './_db-client.js';
import { applyCors, rateLimit } from './_security.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 120, windowMs: 60000 })) return;
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      const { data, error } = await supabase.from('listening_history').select('*').eq('user_id', user_id).order('played_at', { ascending: false }).limit(20);
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, song_id } = req.body || {};
      await supabase.from('listening_history').delete().eq('user_id', user_id).eq('song_id', song_id);
      const { data, error } = await supabase.from('listening_history').insert({ user_id, song_id, played_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('history API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
