import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { product_id } = req.query;
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (product_id) query = query.eq('product_id', product_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { product_id, user_name, rating, comment } = req.body || {};
      const { data, error } = await supabase.from('reviews')
        .insert({ product_id, user_name, rating, comment, created_at: new Date().toISOString() })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('reviews API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
