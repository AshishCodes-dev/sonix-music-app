import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Song } from '../types';

interface LikesCtx {
  likedSongs: Song[];
  isLiked: (id: number | string) => boolean;
  toggleLike: (song: Song | number | string) => void;
}

const LikesContext = createContext<LikesCtx>({} as LikesCtx);
const STORAGE = 'soniq_liked_v2';

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(likedSongs)); } catch {}
  }, [likedSongs]);

  const isLiked = useCallback((id: number | string) => likedSongs.some((s) => String(s.id) === String(id)), [likedSongs]);

  const toggleLike = useCallback((song: Song | number | string) => {
    // Accept either a full Song object (preferred) or just an id (legacy).
    if (typeof song === 'number' || typeof song === 'string') {
      setLikedSongs((prev) => prev.filter((s) => String(s.id) !== String(song)));
      return;
    }
    setLikedSongs((prev) => {
      const exists = prev.some((s) => String(s.id) === String(song.id));
      return exists ? prev.filter((s) => String(s.id) !== String(song.id)) : [song, ...prev];
    });
  }, []);

  return <LikesContext.Provider value={{ likedSongs, isLiked, toggleLike }}>{children}</LikesContext.Provider>;
}

export const useLikes = () => useContext(LikesContext);
