import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function getBearerToken(req) {
  const header = req.headers?.authorization || '';
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  return match?.[1] || null;
}

export async function getAuthenticatedUser(req) {
  const accessToken = getBearerToken(req);
  if (!accessToken) return { user: null, authenticated: false };

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return { user: null, authenticated: false };

  return { user: data.user, authenticated: true };
}

export function sendUnauthorized(res) {
  return res.status(401).json({ error: 'Unauthorized' });
}