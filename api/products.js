import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const q = req.query;
      if (q.id) {
        const { data, error } = await supabase.from('products').select('*').eq('id', q.id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (q.slug) {
        const { data, error } = await supabase.from('products').select('*').eq('slug', q.slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      let query = supabase.from('products').select('*');
      if (q.category) query = query.eq('category', q.category);
      if (q.gender) query = query.eq('gender', q.gender);
      if (q.brand) query = query.eq('brand', q.brand);
      if (q.collection) query = query.eq('collection', q.collection);
      if (q.featured === 'true') query = query.eq('is_featured', true);
      if (q.trending === 'true') query = query.eq('is_trending', true);
      if (q.isnew === 'true') query = query.eq('is_new', true);
      if (q.bestseller === 'true') query = query.eq('is_bestseller', true);
      if (q.sale === 'true') query = query.eq('is_sale', true);
      if (q.minPrice) query = query.gte('price', Number(q.minPrice));
      if (q.maxPrice) query = query.lte('price', Number(q.maxPrice));
      if (q.rating) query = query.gte('rating', Number(q.rating));
      if (q.search) query = query.ilike('name', `%${q.search}%`);

      switch (q.sort) {
        case 'price-asc': query = query.order('price', { ascending: true }); break;
        case 'price-desc': query = query.order('price', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        case 'discount': query = query.order('discount', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        default: query = query.order('id', { ascending: true });
      }
      if (q.limit) query = query.limit(Number(q.limit));

      const { data, error } = await query;
      if (error) throw error;

      // client-side filters that need array containment (color/size)
      let result = data;
      if (q.color) result = result.filter(p => (p.colors || []).some(c => (c.name || c).toLowerCase() === q.color.toLowerCase()));
      if (q.size) result = result.filter(p => (p.sizes || []).map(s => String(s).toLowerCase()).includes(q.size.toLowerCase()));
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const { data, error } = await supabase.from('products').insert(body).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...rest } = req.body || {};
      const { data, error } = await supabase.from('products').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('products API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
