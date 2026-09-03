import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'POST') {
      const { email } = req.body || {};
      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
      const { error } = await supabase.from('newsletter').insert({ email, created_at: new Date().toISOString() });
      if (error && !String(error.message).includes('duplicate')) throw error;
      return res.status(201).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('newsletter API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
