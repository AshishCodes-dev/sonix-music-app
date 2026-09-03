import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import type { Song } from '../types';
import { loadYouTubeApi, getVideoCandidates, hasApiKey, YT_KEY_EVENT } from '../lib/youtube';
import { request } from '../lib/api';
import { announceTrack } from '../lib/voiceDj';
import { applyAlbumColor } from '../lib/albumColor';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerCtx {
  current: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  needsKey: boolean;
  sleepTimer: number | null;   // minutes remaining, null = off
  speed: number;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song) => void;
  setSleepTimer: (minutes: number | null) => void;
  setSpeed: (s: number) => void;
}

// Global bridge so non-provider code (HistoryProvider, toasts) can react to playback.
export const playerBus = {
  onPlay: null as null | ((song: Song) => void),
};

const PlayerContext = createContext<PlayerCtx>({} as PlayerCtx);

// Build the search query for a song
function queryFor(song: Song): string {
  return `${song.title} ${song.artist_name} official audio`;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<any>(null);          // YT.Player instance
  const hostRef = useRef<HTMLDivElement>(null); // hidden div the iframe mounts into
  const pollRef = useRef<number | null>(null);
  const candidatesRef = useRef<string[]>([]);   // current song's video candidates
  const candIdxRef = useRef(0);
  const readyRef = useRef(false);

  const [current, setCurrent] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(!hasApiKey());

  // React live whenever the API key changes (save/remove in Settings) — even
  // across tabs (storage event) — so the player picks it up without a refresh.
  useEffect(() => {
    const sync = () => {
      const has = hasApiKey();
      setNeedsKey(!has);
      if (has) setError(null);
    };
    window.addEventListener(YT_KEY_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(YT_KEY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);
  const sleepDeadlineRef = useRef<number | null>(null);
  const [speed, setSpeedState] = useState(1);

  const setSpeed = (s: number) => {
    setSpeedState(s);
    try { playerRef.current?.setPlaybackRate?.(s); } catch {}
  };

  // keep refs of state needed inside YT callbacks
  const repeatRef = useRef(repeat); repeatRef.current = repeat;
  const shuffleRef = useRef(shuffle); shuffleRef.current = shuffle;
  const indexRef = useRef(index); indexRef.current = index;
  const queueRef = useRef(queue); queueRef.current = queue;
  const isPlayingRef = useRef(isPlaying); isPlayingRef.current = isPlaying;
  const progressRef = useRef(0); progressRef.current = progress;
  const durationRef = useRef(0); durationRef.current = duration;
  const volumeRef = useRef(volume); volumeRef.current = volume;
  const lastErrorRef = useRef<string>('');

  // ---- init YouTube IFrame player ----
  useEffect(() => {
    let mounted = true;
    loadYouTubeApi().then((YT) => {
      if (!mounted || !hostRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        height: '200',
        width: '356',
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0, fs: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            readyRef.current = true;
            playerRef.current.setVolume(Math.round(volume * 100));
          },
          onStateChange: (e: any) => {
            const YTP = window.YT.PlayerState;
            if (e.data === YTP.PLAYING) { setIsPlaying(true); setIsLoading(false); }
            else if (e.data === YTP.PAUSED) setIsPlaying(false);
            else if (e.data === YTP.BUFFERING) setIsLoading(true);
            else if (e.data === YTP.ENDED) handleEnded();
          },
          onError: (e: any) => {
            // YouTube error codes:
            // 2 = invalid param, 5 = HTML5 player error,
            // 100 = video removed/private, 101 & 150 = embedding disabled by owner
            const code = e?.data;
            const reason =
              code === 101 || code === 150 ? 'embedding disabled'
              : code === 100 ? 'video removed'
              : code === 2 ? 'invalid video'
              : code === 5 ? 'player error'
              : 'unavailable';
            console.warn('[YT error]', code, reason, '— trying next result');
            lastErrorRef.current = reason;
            // This candidate can't play — try the next matching result automatically
            tryNextCandidate();
          },
        },
      });
    });
    return () => { mounted = false; if (pollRef.current) window.clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- progress polling ----
  useEffect(() => {
    pollRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (p && readyRef.current && typeof p.getCurrentTime === 'function') {
        try {
          setProgress(p.getCurrentTime() || 0);
          const d = p.getDuration() || 0;
          if (d) setDuration(d);
        } catch {}
      }
    }, 500);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, []);

  const logHistory = useCallback((song: Song) => {
    if (playerBus.onPlay) { try { playerBus.onPlay(song); } catch {} }
    // AI Voice DJ intro + dynamic album-color theme
    try { announceTrack(song.title, song.artist_name, song.id); } catch {}
    try { if (song.cover) applyAlbumColor(song.cover); } catch {}
    try {
      const uid = JSON.parse(localStorage.getItem('soniq_uid') || 'null');
      if (uid && !String(song.id).startsWith('yt_')) request('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: uid, song_id: song.id }) });
    } catch {}
    if (!String(song.id).startsWith('yt_')) {
      request('/api/songs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: song.id, incrementPlays: true }) }).catch(() => {});
    }
  }, []);

  // ---- sleep timer ----
  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerState(minutes);
    sleepDeadlineRef.current = minutes ? Date.now() + minutes * 60000 : null;
  }, []);

  useEffect(() => {
    if (sleepTimer === null) return;
    const iv = window.setInterval(() => {
      if (!sleepDeadlineRef.current) return;
      const remaining = sleepDeadlineRef.current - Date.now();
      if (remaining <= 0) {
        try { playerRef.current?.pauseVideo(); } catch {}
        setIsPlaying(false);
        setSleepTimerState(null);
        sleepDeadlineRef.current = null;
      } else {
        setSleepTimerState(Math.ceil(remaining / 60000));
      }
    }, 1000);
    return () => window.clearInterval(iv);
  }, [sleepTimer]);

  // play a specific candidate video id
  const cueCandidate = useCallback((i: number) => {
    const ids = candidatesRef.current;
    if (!playerRef.current || !readyRef.current || !ids.length || i >= ids.length) {
      setIsLoading(false);
      if (i >= ids.length) setError('This track could not be played. Try another.');
      return;
    }
    candIdxRef.current = i;
    try {
      playerRef.current.loadVideoById(ids[i]);
      // Ensure volume is applied and force playback. Some browsers only allow
      // autoplay when muted — we start, then unmute right after.
      const p = playerRef.current;
      p.playVideo();
      setTimeout(() => {
        try {
          const st = p.getPlayerState?.();
          // 1 = playing. If not playing yet, retry with a muted start then unmute.
          if (st !== 1) {
            p.mute();
            p.playVideo();
            setTimeout(() => { try { p.unMute(); p.setVolume(Math.round(volumeRef.current * 100)); } catch {} }, 400);
          }
        } catch {}
      }, 600);
    } catch {}
  }, []);

  const tryNextCandidate = useCallback(() => {
    const nextI = candIdxRef.current + 1;
    if (nextI < candidatesRef.current.length) {
      cueCandidate(nextI);
    } else {
      // all candidates failed -> auto-skip to next song in queue
      setIsLoading(false);
      const why = lastErrorRef.current === 'embedding disabled'
        ? 'This song blocks external playback on YouTube. Trying another version…'
        : 'Could not play this track. Trying the next one…';
      if (queueRef.current.length > 1) { setError(why); setTimeout(() => nextSongRef.current(), 500); }
      else setError(lastErrorRef.current === 'embedding disabled'
        ? 'This song can’t be embedded (owner disabled it). Try searching another version.'
        : 'Unable to play this track. Please try another song.');
    }
  }, [cueCandidate]);

  // Resolve a song -> YouTube candidates -> play
  const resolveAndPlay = useCallback(async (song: Song) => {
    if (!hasApiKey()) { setNeedsKey(true); setError('Add your YouTube API key in Settings to play music.'); return; }
    setNeedsKey(false);
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setDuration(0);
    try {
      // Wait until YT player is ready (max ~5s)
      let waited = 0;
      while (!readyRef.current && waited < 5000) { await new Promise(r => setTimeout(r, 150)); waited += 150; }
      // If the song already carries a YouTube video id (from YouTube search or a
      // cached row), play it DIRECTLY — no extra search request, so no quota used.
      const directId = (song as any).youtube_id as string | undefined;
      let ids: string[];
      if (directId) {
        ids = [directId];
      } else {
        ids = await getVideoCandidates(queryFor(song));
      }
      if (!ids.length) { setError('No results found for this track.'); setIsLoading(false); return; }
      candidatesRef.current = ids;
      candIdxRef.current = 0;
      cueCandidate(0);
    } catch (err: any) {
      setIsLoading(false);
      const msg = String(err.message || '');
      if (msg.includes('NO_API_KEY')) { setNeedsKey(true); setError('Add your YouTube API key in Settings to play music.'); }
      else if (/quota/i.test(msg)) setError('Daily YouTube search limit reached — it resets after midnight (Pacific Time). Add a fresh API key in Settings to keep playing now.');
      else if (msg.includes(':')) setError(msg.split(':').slice(2).join(':') || 'Search failed. Check your API key in Settings.');
      else setError('Search failed. Check your API key in Settings.');
    }
  }, [cueCandidate]);

  const playSong = useCallback((song: Song, q?: Song[]) => {
    const list = q && q.length ? q : [song];
    const idx = list.findIndex(s => s.id === song.id);
    setQueue(list);
    setIndex(idx < 0 ? 0 : idx);
    setCurrent(song);
    logHistory(song);
    resolveAndPlay(song);
  }, [logHistory, resolveAndPlay]);

  const next = useCallback(() => {
    if (!queueRef.current.length) return;
    let ni;
    if (shuffleRef.current) ni = Math.floor(Math.random() * queueRef.current.length);
    else ni = indexRef.current + 1 >= queueRef.current.length ? 0 : indexRef.current + 1;
    setIndex(ni);
    const song = queueRef.current[ni];
    setCurrent(song);
    logHistory(song);
    resolveAndPlay(song);
  }, [logHistory, resolveAndPlay]);

  // ref so YT callbacks always call latest next()
  const nextSongRef = useRef(next); nextSongRef.current = next;

  const prev = useCallback(() => {
    if (!queueRef.current.length) return;
    const p = playerRef.current;
    if (p && readyRef.current && p.getCurrentTime && p.getCurrentTime() > 3) { p.seekTo(0); return; }
    const pi = indexRef.current - 1 < 0 ? queueRef.current.length - 1 : indexRef.current - 1;
    setIndex(pi);
    const song = queueRef.current[pi];
    setCurrent(song);
    logHistory(song);
    resolveAndPlay(song);
  }, [logHistory, resolveAndPlay]);

  const handleEnded = useCallback(() => {
    if (repeatRef.current === 'one') { cueCandidate(candIdxRef.current); return; }
    if (repeatRef.current === 'off' && indexRef.current + 1 >= queueRef.current.length && !shuffleRef.current) {
      setIsPlaying(false); return;
    }
    nextSongRef.current();
  }, [cueCandidate]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p || !current) return;
    if (isPlaying) { p.pauseVideo(); setIsPlaying(false); }
    else { p.playVideo(); }
  }, [isPlaying, current]);

  useEffect(() => {
    const p = playerRef.current;
    if (p && readyRef.current && p.setVolume) p.setVolume(Math.round(volume * 100));
  }, [volume]);

  const seek = (t: number) => {
    const p = playerRef.current;
    if (p && readyRef.current && p.seekTo) { p.seekTo(t, true); setProgress(t); }
  };
  const setVolume = (v: number) => setVolumeState(v);
  const toggleShuffle = () => setShuffle(s => !s);
  const cycleRepeat = () => setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  const addToQueue = (song: Song) => setQueue(q => [...q, song]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight' && e.shiftKey) next();
      if (e.code === 'ArrowLeft' && e.shiftKey) prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, next, prev]);

  // ---- MediaSession: lock-screen controls + background playback metadata ----
  useEffect(() => {
    if (!('mediaSession' in navigator) || !current) return;
    const ms: any = (navigator as any).mediaSession;
    try {
      const art = current.cover
        ? [96, 128, 192, 256, 384, 512].map((s) => ({ src: current.cover, sizes: `${s}x${s}`, type: 'image/jpeg' }))
        : [];
      // @ts-ignore
      ms.metadata = new window.MediaMetadata({
        title: current.title,
        artist: current.artist_name,
        album: current.album_name || 'SONIQ',
        artwork: art,
      });
      ms.setActionHandler('play', () => { playerRef.current?.playVideo(); });
      ms.setActionHandler('pause', () => { playerRef.current?.pauseVideo(); });
      ms.setActionHandler('previoustrack', () => prev());
      ms.setActionHandler('nexttrack', () => next());
      ms.setActionHandler('seekto', (d: any) => { if (d.seekTime != null) seek(d.seekTime); });
      ms.setActionHandler('seekforward', () => seek(Math.min((progressRef.current || 0) + 10, durationRef.current || 0)));
      ms.setActionHandler('seekbackward', () => seek(Math.max((progressRef.current || 0) - 10, 0)));
    } catch {}
  }, [current, next, prev]);

  // keep playback-state + position synced for the lock screen
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    (navigator as any).mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !(navigator as any).mediaSession.setPositionState) return;
    if (!duration) return;
    try {
      (navigator as any).mediaSession.setPositionState({
        duration: duration,
        playbackRate: speed || 1,
        position: Math.min(progress, duration),
      });
    } catch {}
  }, [progress, duration, speed]);

  // Keep playback alive across tab switches / screen locks (best-effort).
  // Note: mobile browsers throttle/suspend hidden iframes — full background
  // playback on a locked screen is restricted by YouTube itself. We do
  // everything possible so audio keeps going when the app is visible and
  // resumes instantly when the user returns.
  useEffect(() => {
    const resume = () => {
      if (isPlayingRef.current) {
        try {
          const p = playerRef.current;
          if (p && p.getPlayerState && p.getPlayerState() !== 1) p.playVideo();
        } catch {}
      }
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') resume(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', resume);
    window.addEventListener('pageshow', resume);
    // Periodic self-heal: if we think we're playing but the player paused
    // (e.g. after coming back from another tab), nudge it back to playing.
    const heal = window.setInterval(() => {
      if (isPlayingRef.current && document.visibilityState === 'visible') resume();
    }, 4000);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', resume);
      window.removeEventListener('pageshow', resume);
      window.clearInterval(heal);
    };
  }, []);

  return (
    <PlayerContext.Provider value={{ current, queue, isPlaying, isLoading, progress, duration, volume, shuffle, repeat, error, needsKey, sleepTimer, speed, playSong, togglePlay, next, prev, seek, setVolume, toggleShuffle, cycleRepeat, addToQueue, setSleepTimer, setSpeed }}>
      {children}
      {/* YouTube player host — kept off-screen but NOT zero-size/opacity-0
          (YouTube blocks playback in fully hidden or 0x0 iframes). We render it
          at real size and clip it out of view so audio always plays. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: 356,
          height: 200,
          // push it just off the visible area but keep it rendered & non-zero
          transform: 'translateY(120%)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div ref={hostRef} />
      </div>
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
