import supabase from './db-client.js';
import { audioFor } from './audio-map.js';
import { applyCors, rateLimit } from './_security.js';
import { getAuthenticatedUser, sendUnauthorized } from './auth.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 120, windowMs: 60000 })) return;

  try {
    if (req.method === 'GET') {
      const q = req.query;
      if (q.id) {
        const { data, error } = await supabase.from('songs').select('*').eq('id', q.id).single();
        if (error) throw error;
        if (data) data.audio_url = audioFor(data);
        return res.status(200).json(data);
      }
      let query = supabase.from('songs').select('*');
      if (q.artist_id) query = query.eq('artist_id', q.artist_id);
      if (q.album_id) query = query.eq('album_id', q.album_id);
      if (q.genre) query = query.eq('genre', q.genre);
      if (q.mood) query = query.eq('mood', q.mood);
      if (q.search) query = query.ilike('title', `%${q.search}%`);
      if (q.trending === 'true') query = query.order('plays', { ascending: false });
      else if (q.newest === 'true') query = query.order('created_at', { ascending: false });
      else query = query.order('id', { ascending: true });
      if (q.limit) query = query.limit(Number(q.limit));
      const { data, error } = await query;
      if (error) throw error;
      const withAudio = (data || []).map((s) => ({ ...s, audio_url: audioFor(s) }));
      return res.status(200).json(withAudio);
    }
    if (req.method === 'POST') {
      const { authenticated } = await getAuthenticatedUser(req);
      if (!authenticated) return sendUnauthorized(res);
      const { data, error } = await supabase.from('songs').insert(req.body).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { authenticated } = await getAuthenticatedUser(req);
      if (!authenticated) return sendUnauthorized(res);
      const { id, incrementPlays, ...rest } = req.body || {};
      if (incrementPlays) {
        const { data: cur } = await supabase.from('songs').select('plays').eq('id', id).single();
        const { data, error } = await supabase.from('songs').update({ plays: (cur?.plays || 0) + 1 }).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('songs').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { authenticated } = await getAuthenticatedUser(req);
      if (!authenticated) return sendUnauthorized(res);
      const { id } = req.body || {};
      const { error } = await supabase.from('songs').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('songs API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
