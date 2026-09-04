import supabase from './_db-client.js';
import { applyCors, rateLimit } from './_security.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 90, windowMs: 60000 })) return;
  try {
    if (req.method === 'GET') {
      const q = req.query;
      if (q.id) {
        const { data, error } = await supabase.from('playlists').select('*').eq('id', q.id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('playlists').select('*').order('id', { ascending: true });
      if (q.user_id) query = query.eq('user_id', q.user_id);
      else if (q.featured === 'true') query = query.eq('is_featured', true);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        name: body.name, description: body.description || '', user_id: body.user_id,
        owner_name: body.owner_name || 'You', cover: body.cover || null,
        song_ids: body.song_ids || [], is_public: body.is_public ?? true,
        is_featured: false, mood: body.mood || null, created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('playlists').insert(row).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, addSong, removeSong, ...rest } = req.body || {};
      if (addSong || removeSong) {
        const { data: pl } = await supabase.from('playlists').select('song_ids').eq('id', id).single();
        let ids = pl?.song_ids || [];
        if (addSong && !ids.includes(addSong)) ids = [...ids, addSong];
        if (removeSong) ids = ids.filter((s) => s !== removeSong);
        const { data, error } = await supabase.from('playlists').update({ song_ids: ids }).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('playlists').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      const { error } = await supabase.from('playlists').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('playlists API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
