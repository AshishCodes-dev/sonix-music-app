import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Mic, X, Play, Loader2, TrendingUp } from 'lucide-react';
import SongRow from '../components/SongRow';
import { useGatedPlay } from '../lib/useGatedPlay';
import { searchYouTubeSongs, hasApiKey } from '../lib/youtube';
import type { Song } from '../types';

const GENRES = [
  { name: 'Bollywood', color: 'from-orange-500 to-pink-600' },
  { name: 'Hollywood', color: 'from-fuchsia-500 to-purple-600' },
  { name: 'Punjabi', color: 'from-yellow-500 to-orange-600' },
  { name: 'Tamil', color: 'from-emerald-500 to-teal-600' },
  { name: 'Telugu', color: 'from-cyan-500 to-blue-600' },
  { name: 'Hindi', color: 'from-rose-500 to-red-600' },
  { name: 'English', color: 'from-indigo-500 to-blue-700' },
  { name: 'Christian', color: 'from-sky-500 to-indigo-600' },
  { name: 'Lo-fi', color: 'from-violet-500 to-purple-700' },
  { name: 'Workout', color: 'from-red-600 to-orange-600' },
  { name: 'Romantic', color: 'from-pink-600 to-rose-500' },
  { name: 'Party', color: 'from-purple-600 to-pink-500' },
];

const QUICK = ['Arijit Singh', 'Trending 2024', 'Punjabi hits', 'Ed Sheeran', 'Lo-fi beats', 'Worship songs'];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const navigate = useNavigate();
  const playSong = useGatedPlay();
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState(q);
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);

  // fetch results when the URL query changes
  useEffect(() => {
    setText(q);
    if (!q.trim()) { setResults([]); setError(''); return; }
    if (!hasApiKey()) { setError('key'); setResults([]); return; }
    setLoading(true); setError('');
    searchYouTubeSongs(q, 24)
      .then((r) => { if (!r.length) setError('none'); setResults(r); })
      .catch((e) => { setError(/quota/i.test(String(e.message)) ? 'quota' : 'fail'); setResults([]); })
      .finally(() => setLoading(false));
  }, [q]);

  const submit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setParams({ q: v });
  };

  const clear = () => { setText(''); setParams({}); inputRef.current?.focus(); };

  const voiceSearch = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    setListening(true);
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setText(t); submit(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto">
      {/* Premium search bar */}
      <div className="sticky top-0 z-10 pb-4 pt-1">
        <div className="relative group">
          <SearchIcon size={22} className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(text)}
            autoFocus
            placeholder="Search songs, artists, albums…"
            className="w-full glass-strong rounded-full pl-14 pr-28 py-4 md:py-4 text-base md:text-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:shadow-[0_0_40px_rgba(124,58,237,0.3)]"
            style={{ color: 'var(--text)' }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {text && (
              <button onClick={clear} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition" title="Clear">
                <X size={18} style={{ color: 'var(--text-dim)' }} />
              </button>
            )}
            <button onClick={voiceSearch} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition" title="Voice search">
              <Mic size={19} className={listening ? 'animate-pulse' : ''} style={{ color: listening ? '#EC4899' : '#06B6D4' }} />
            </button>
          </div>
        </div>

        {/* quick chips (only when idle) */}
        {!q && (
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK.map((s) => (
              <button key={s} onClick={() => submit(s)} className="glass px-4 py-2 rounded-full text-sm hover:glow-purple transition">{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Idle state — browse genres */}
      {!q && (
        <div className="mt-4">
          <h2 className="font-display text-2xl font-bold mb-4">Browse all</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GENRES.map((g) => (
              <button key={g.name} onClick={() => submit(g.name + ' songs')}
                className={`relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br ${g.color} p-5 flex items-start text-left hover:scale-[1.03] transition-transform duration-300 shadow-lg`}>
                <span className="font-display font-bold text-xl md:text-2xl text-white drop-shadow">{g.name}</span>
                <TrendingUp className="absolute bottom-3 right-3 text-white/40" size={28} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {q && (
        <div className="mt-2">
          {error === 'key' ? (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>Connect your YouTube API key to search millions of songs.</p>
              <Link to="/settings" className="btn-glow text-white px-6 py-2.5 rounded-full text-sm inline-block">Open Settings</Link>
            </div>
          ) : error === 'quota' ? (
            <div className="glass rounded-2xl p-6 text-center text-sm" style={{ color: '#fda4af' }}>Daily search limit reached. It resets after midnight, or add a fresh key in Settings.</div>
          ) : error === 'fail' ? (
            <div className="glass rounded-2xl p-6 text-center text-sm" style={{ color: '#fda4af' }}>Search failed. Please try again.</div>
          ) : loading ? (
            <div className="glass rounded-2xl p-2 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <div className="skeleton w-11 h-11 rounded-lg" />
                  <div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-2/5 rounded" /><div className="skeleton h-2.5 w-1/4 rounded" /></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl md:text-2xl font-bold truncate pr-3">Results for “{q}”</h2>
                <button onClick={() => playSong(results[0], results)} className="btn-glow text-white px-5 py-2.5 rounded-full text-sm flex items-center gap-1.5 shrink-0">
                  <Play size={15} fill="white" /> Play All
                </button>
              </div>
              <div className="glass rounded-2xl p-2">
                {results.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={results} />)}
              </div>
            </>
          ) : error === 'none' ? (
            <div className="glass rounded-2xl p-10 text-center">
              <SearchIcon size={40} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
              <p className="font-display text-lg font-bold">No results found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>Try a different search.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
