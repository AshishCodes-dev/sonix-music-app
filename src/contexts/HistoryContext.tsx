import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Song } from '../types';
import { playerBus } from './PlayerContext';

interface HistoryCtx {
  recent: Song[];
  addRecent: (song: Song) => void;
  clearRecent: () => void;
}

const HistoryContext = createContext<HistoryCtx>({} as HistoryCtx);
const STORAGE = 'soniq_recent_v2';

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useState<Song[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; }
  });

  const addRecent = useCallback((song: Song) => {
    setRecent((prev) => {
      const next = [song, ...prev.filter((s) => s.id !== song.id)].slice(0, 30);
      try { localStorage.setItem(STORAGE, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try { localStorage.removeItem(STORAGE); } catch {}
  }, []);

  // Hook into the player so every played song is recorded (library + YouTube).
  useEffect(() => {
    playerBus.onPlay = (song: Song) => addRecent(song);
    return () => { playerBus.onPlay = null; };
  }, [addRecent]);

  return (
    <HistoryContext.Provider value={{ recent, addRecent, clearRecent }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);
