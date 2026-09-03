import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Loader2, Play, Zap, Mic } from 'lucide-react';
import { searchYouTubeSongs, hasApiKey } from '../lib/youtube';
import { useGatedPlay } from '../lib/useGatedPlay';
import { useToast } from '../contexts/ToastContext';
import SongRow from '../components/SongRow';
import type { Song } from '../types';

// "AI" intent engine: maps natural language to a great YouTube search query.
// Detects mood, activity, language and energy from the user's sentence.
function buildQuery(input: string): { query: string; label: string } {
  const t = input.toLowerCase();

  const has = (...words: string[]) => words.some((w) => t.includes(w));

  // language
  let lang = '';
  if (has('hindi', 'bollywood', 'desi')) lang = 'hindi bollywood';
  else if (has('english', 'hollywood')) lang = 'english';
  else if (has('punjabi')) lang = 'punjabi';
  else if (has('tamil')) lang = 'tamil';
  else if (has('telugu')) lang = 'telugu';

  // mood / activity / FEELINGS mapping (AI Mood Detector)
  const map: [string[], string, string][] = [
    [['lonely', 'alone', 'miss', 'akela', 'tanha', 'empty'], 'emotional soothing songs for loneliness', '🌧️ For Lonely Hearts'],
    [['stress', 'stressed', 'anxious', 'tension', 'overwhelm', 'pareshan'], 'calm stress relief soothing music', '🧘 Stress Relief'],
    [['relax', 'chill', 'calm', 'sukoon', 'peace', 'unwind'], 'chill relaxing lofi songs', '😌 Relax & Unwind'],
    [['pray', 'prayer', 'worship', 'god', 'bhakti', 'jesus', 'devotion', 'bhajan'], 'worship devotional prayer songs', '🙏 Prayer & Worship'],
    [['motivat', 'motivation', 'confidence', 'success', 'grind', 'focus up'], 'powerful motivation songs', '🔥 Motivation'],
    [['breakup', 'break up', 'heartbreak', 'sad', 'dukhi', 'rone', 'cry', 'hurt'], 'sad emotional breakup songs', '💔 Breakup & Sad'],
    [['gym', 'workout', 'exercise', 'run', 'energetic', 'energy', 'pump'], 'high energy workout gym songs', '💪 Workout Energy'],
    [['party', 'dance', 'club', 'nach', 'celebrat'], 'party dance club banger songs', '🎉 Party Mode'],
    [['love', 'romantic', 'pyar', 'romance', 'valentine'], 'romantic love songs', '❤️ Romance'],
    [['study', 'padhai', 'concentrate', 'work', 'focus'], 'lofi study focus beats', '📚 Focus Flow'],
    [['sleep', 'night', 'raat', 'soothing', 'tired'], 'calm soothing sleep music', '🌙 Sleep'],
    [['happy', 'feel good', 'khush', 'joy', 'good mood', 'excited'], 'feel good happy upbeat songs', '☀️ Feel Good'],
    [['travel', 'road', 'drive', 'safar'], 'road trip travel songs', '🚗 Road Trip'],
    [['retro', 'old', 'purane', '90s', '80s', 'classic'], 'retro classic old hit songs', '📻 Retro'],
    [['rap', 'hip hop', 'hiphop'], 'hip hop rap songs', '🎤 Hip-Hop'],
  ];

  for (const [keys, q, label] of map) {
    if (has(...keys)) return { query: `${lang} ${q}`.trim(), label };
  }

  // Fallback: use the raw sentence + "songs"
  return { query: `${input} songs`, label: `🎵 ${input}` };
}

const SUGGESTIONS = [
  "I'm feeling lonely",
  "I'm stressed, help me relax",
  'I need motivation',
  'I want to pray',
  'Play gym energy songs',
  'Play romantic Bollywood',
  "I'm happy today",
  'Play sad breakup songs',
];

export default function AiDj() {
  const playSong = useGatedPlay();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);

  const voiceCommand = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast('Voice not supported on this browser', 'info'); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    setListening(true);
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); run(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  const run = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    if (!hasApiKey()) { setError('Add your YouTube API key in Settings to use AI DJ.'); return; }
    setInput(q);
    setError('');
    setLoading(true);
    setSongs([]);
    const { query, label } = buildQuery(q);
    setLabel(label);
    try {
      const res = await searchYouTubeSongs(query, 20);
      if (!res.length) { setError('No tracks found for that vibe. Try another.'); return; }
      setSongs(res);
      // Autoplay the first track and queue the rest
      playSong(res[0], res);
      toast(`AI DJ spinning: ${label}`, 'music');
    } catch (e: any) {
      if (/quota/i.test(String(e.message))) setError('YouTube quota reached — try again later or add a fresh key in Settings.');
      else setError('Could not build your mix. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-8 p-8 md:p-12"
        style={{ background: 'linear-gradient(120deg,#0f0524 0%,#2a0a4a 45%,#06283d 100%)' }}>
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 75% 25%, rgba(236,72,153,0.5), transparent 55%)' }} />
        <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full blur-3xl animate-float" style={{ background: 'rgba(124,58,237,0.4)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-xs tracking-[0.25em] glass px-3 py-1.5 rounded-full"><Sparkles size={13} style={{ color: '#EC4899' }} /> AI DJ</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold flex items-center gap-3 flex-wrap">
            Tell me the vibe <Wand2 className="hidden md:inline" />
          </h1>
          <p className="mt-3 max-w-lg opacity-90">Just say what you feel — "breakup songs", "gym energy", "chill study lofi" — and I'll instantly build the perfect mix and start playing. 🎧</p>

          {/* Input */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#EC4899' }} />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && run()}
                placeholder="Tell me your mood or say a command…"
                className="w-full glass-strong rounded-full pl-12 pr-12 py-3.5 outline-none text-sm focus:glow-purple"
                style={{ color: '#fff' }}
              />
              <button onClick={voiceCommand} className="absolute right-4 top-1/2 -translate-y-1/2" title="Speak">
                <Mic size={19} className={listening ? 'animate-pulse' : ''} style={{ color: listening ? '#EC4899' : '#06B6D4' }} />
              </button>
            </div>
            <button onClick={() => run()} disabled={loading}
              className="btn-glow text-white font-semibold px-7 py-3.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-60 shrink-0">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Mixing…</> : <><Sparkles size={18} /> Play the vibe</>}
            </button>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 mt-5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => run(s)} className="glass px-4 py-2 rounded-full text-xs hover:glow-purple transition">{s}</button>
            ))}
          </div>
        </div>
      </motion.div>

      {error && <div className="glass rounded-2xl p-5 text-sm mb-6" style={{ color: '#fda4af' }}>{error}</div>}

      {/* Results */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-2 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5">
                <div className="skeleton w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2"><div className="skeleton h-3 w-2/5 rounded" /><div className="skeleton h-2.5 w-1/4 rounded" /></div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {songs.length > 0 && !loading && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs tracking-[0.3em]" style={{ color: '#EC4899' }}>YOUR AI MIX</p>
              <h2 className="font-display text-2xl font-bold">{label}</h2>
            </div>
            <button onClick={() => playSong(songs[0], songs)} className="btn-glow text-white px-5 py-2.5 rounded-full text-sm flex items-center gap-1.5">
              <Play size={15} fill="white" /> Play All
            </button>
          </div>
          <div className="glass rounded-2xl p-2">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />)}
          </div>
        </section>
      )}
    </div>
  );
}
