import supabase from './db-client.js';
import { applyCors, rateLimit } from './_security.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 120, windowMs: 60000 })) return;
  try {
    if (req.method === 'GET') {
      const q = req.query;
      if (q.id) {
        const { data, error } = await supabase.from('albums').select('*').eq('id', q.id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('albums').select('*');
      if (q.artist_id) query = query.eq('artist_id', q.artist_id);
      if (q.search) query = query.ilike('title', `%${q.search}%`);
      query = q.newest === 'true' ? query.order('created_at', { ascending: false }) : query.order('id', { ascending: true });
      if (q.limit) query = query.limit(Number(q.limit));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('albums API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
