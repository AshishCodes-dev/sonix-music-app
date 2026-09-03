import supabase from './db-client.js';

function genOrderNo() {
  return 'LX' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_email, order_no, id } = req.query;
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (id) query = query.eq('id', id);
      if (order_no) query = query.eq('order_no', order_no);
      if (user_email) query = query.eq('user_email', user_email);
      const { data, error } = await query;
      if (error) throw error;
      if (order_no || id) return res.status(200).json(data[0] || null);
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const order = {
        order_no: genOrderNo(),
        user_id: body.user_id || null,
        user_email: body.user_email,
        items: body.items,
        subtotal: body.subtotal,
        shipping: body.shipping,
        tax: body.tax,
        discount: body.discount || 0,
        total: body.total,
        coupon: body.coupon || null,
        address: body.address,
        payment_method: body.payment_method,
        status: 'Processing',
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('orders').insert(order).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('orders API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
