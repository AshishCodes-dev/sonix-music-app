import type { Song, Artist, Album, Playlist } from '../types';
import supabase from './supabase';

export async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  return fetch(path, { ...init, headers });
}

async function get<T>(path: string): Promise<T> {
  const res = await request(path);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export const getSongs = (q = ''): Promise<Song[]> => get(`/api/songs${q ? '?' + q : ''}`);
export const getSong = (id: number): Promise<Song> => get(`/api/songs?id=${id}`);
export const getArtists = (q = ''): Promise<Artist[]> => get(`/api/artists${q ? '?' + q : ''}`);
export const getArtist = (id: number): Promise<Artist> => get(`/api/artists?id=${id}`);
export const getAlbums = (q = ''): Promise<Album[]> => get(`/api/albums${q ? '?' + q : ''}`);
export const getAlbum = (id: number): Promise<Album> => get(`/api/albums?id=${id}`);
export const getPlaylists = (q = ''): Promise<Playlist[]> => get(`/api/playlists${q ? '?' + q : ''}`);
export const getPlaylist = (id: number): Promise<Playlist> => get(`/api/playlists?id=${id}`);
export const getRecommendations = (q = ''): Promise<Song[]> => get(`/api/recommendations${q ? '?' + q : ''}`);

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatCount(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}
