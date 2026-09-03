import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('coupons').select('*').eq('active', true).order('id');
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { code, subtotal } = req.body || {};
      const { data, error } = await supabase.from('coupons').select('*').eq('code', String(code).toUpperCase()).eq('active', true).single();
      if (error || !data) return res.status(404).json({ valid: false, error: 'Invalid or expired coupon' });
      if (subtotal < data.min_amount) return res.status(400).json({ valid: false, error: `Minimum order of $${data.min_amount} required` });
      return res.status(200).json({ valid: true, code: data.code, discount_percent: data.discount_percent, description: data.description });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('coupons API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
