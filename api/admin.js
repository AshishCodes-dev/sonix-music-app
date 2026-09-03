import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const [prod, orders, reviews, subs] = await Promise.all([
        supabase.from('products').select('id, price, stock, category'),
        supabase.from('orders').select('*'),
        supabase.from('reviews').select('id'),
        supabase.from('newsletter').select('id'),
      ]);
      const products = prod.data || [];
      const allOrders = orders.data || [];
      const revenue = allOrders.reduce((s, o) => s + Number(o.total || 0), 0);
      const byCategory = {};
      products.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });
      const statusCount = {};
      allOrders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });
      return res.status(200).json({
        totalProducts: products.length,
        totalOrders: allOrders.length,
        totalReviews: (reviews.data || []).length,
        totalSubscribers: (subs.data || []).length,
        revenue,
        lowStock: products.filter(p => p.stock < 10).length,
        byCategory,
        statusCount,
        recentOrders: allOrders.slice(0, 8),
      });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('admin API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
