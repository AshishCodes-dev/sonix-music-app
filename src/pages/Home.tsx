import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, Youtube, KeyRound, TrendingUp, Wand2 } from 'lucide-react';
import YTRow from '../components/YTRow';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import { useGatedPlay } from '../lib/useGatedPlay';
import { hasApiKey } from '../lib/youtube';

const CATEGORIES: { title: string; query: string; subtitle?: string }[] = [
  { title: 'Recommended For You', query: 'best songs 2024 mix', subtitle: 'Handpicked for your taste' },
  { title: 'New Releases', query: 'new song releases this week', subtitle: 'Fresh drops' },
  { title: 'Bollywood', query: 'latest bollywood hit songs 2024', subtitle: 'Top Hindi film music' },
  { title: 'Hollywood', query: 'top english pop songs 2024', subtitle: 'Global chart-toppers' },
  { title: 'Punjabi', query: 'latest punjabi songs 2024', subtitle: 'Bhangra & beats' },
  { title: 'Christian Worship', query: 'christian worship songs english', subtitle: 'Praise & worship' },
  { title: 'Tamil', query: 'tamil hit songs 2024', subtitle: 'Kollywood favourites' },
  { title: 'Telugu', query: 'telugu hit songs 2024', subtitle: 'Tollywood chartbusters' },
  { title: 'Malayalam', query: 'malayalam hit songs 2024', subtitle: 'Mollywood magic' },
  { title: 'Romantic', query: 'romantic love songs hindi english', subtitle: 'Feel the romance' },
  { title: 'Party', query: 'party dance songs 2024', subtitle: 'Turn it up' },
  { title: 'Lo-fi & Chill', query: 'lofi chill beats to relax', subtitle: 'Relax & unwind' },
  { title: 'Workout', query: 'workout gym motivation songs', subtitle: 'Push harder' },
  { title: 'Focus', query: 'focus study concentration music', subtitle: 'Deep work' },
  { title: 'Sleep', query: 'calm sleep relaxing music', subtitle: 'Drift away' },
];

const MOODS = [
  { label: 'Romantic', color: 'from-pink-600 to-rose-500' },
  { label: 'Party', color: 'from-purple-600 to-pink-500' },
  { label: 'Worship', color: 'from-sky-500 to-indigo-700' },
  { label: 'Chill', color: 'from-cyan-500 to-blue-600' },
  { label: 'Energetic', color: 'from-pink-500 to-purple-600' },
  { label: 'Sad', color: 'from-slate-600 to-blue-800' },
];

export default function Home() {
  const { user } = useAuth();
  const { recent } = useHistory();
  const playSong = useGatedPlay();
  const [keyed, setKeyed] = useState(hasApiKey());

  useEffect(() => {
    const sync = () => setKeyed(hasApiKey());
    window.addEventListener('soniq-yt-key-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('soniq-yt-key-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = user?.user_metadata?.full_name?.split(' ')[0] || (user?.email?.split('@')[0]) || '';

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Hero — crazy premium */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        className="relative rounded-[28px] overflow-hidden mb-8 p-8 md:p-14 neon-ring"
        style={{ background: 'radial-gradient(120% 140% at 0% 0%, #2a0a4a 0%, #0b1030 45%, #041526 100%)' }}>
        {/* animated color orbs */}
        <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle,#7C3AED,transparent 70%)', opacity: 0.55 }} />
        <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle,#06B6D4,transparent 70%)', opacity: 0.4, animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,#EC4899,transparent 70%)', opacity: 0.35 }} />
        {/* floating sparks */}
        {[...Array(8)].map((_, i) => (
          <span key={i} className="absolute rounded-full" style={{
            left: `${8 + i * 11}%`, bottom: '-10px', width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2,
            background: ['#06B6D4', '#7C3AED', '#EC4899'][i % 3],
            animation: `rise ${7 + (i % 4)}s linear ${i * 0.8}s infinite`, filter: 'blur(0.5px)',
          }} />
        ))}

        <div className="relative">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-5">
            <Sparkles size={14} style={{ color: '#EC4899' }} />
            <span className="text-[11px] tracking-[0.25em] uppercase">{greeting}{name ? `, ${name}` : ''}</span>
          </motion.div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-[1.02] max-w-3xl">
            Every song. <br className="hidden md:block" />
            <span className="text-gradient">One tap away.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base md:text-lg opacity-90">Stream millions of tracks — Bollywood, Hollywood, Punjabi, Tamil, worship & more. With an AI DJ that spins your vibe. 🎧</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link to="/search" className="btn-glow text-white font-semibold px-7 py-3.5 rounded-full flex items-center gap-2 shadow-xl">
              <Play size={18} fill="white" /> Start Listening
            </Link>
            <Link to="/ai-dj" className="glass-strong text-white font-semibold px-7 py-3.5 rounded-full flex items-center gap-2 hover:bg-white/10 transition shine">
              <Wand2 size={18} /> Try AI DJ
            </Link>
          </div>
        </div>
      </motion.div>

      {/* API key prompt */}
      {!keyed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ border: '1px solid rgba(236,72,153,0.3)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(236,72,153,0.15)' }}>
            <Youtube size={22} style={{ color: '#EC4899' }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Add your YouTube API key to unlock full playback</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-dim)' }}>It's free and takes 2 minutes. Then search and play any song in the world.</p>
          </div>
          <Link to="/settings" className="btn-glow text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0">
            <KeyRound size={15} /> Add Key
          </Link>
        </motion.div>
      )}

      {/* Recently played */}
      {recent.length > 0 && (
        <section className="mb-9">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-2xl font-bold">Continue Listening</h2>
            <Link to="/recent" className="text-xs uppercase tracking-widest hover:text-white" style={{ color: 'var(--text-dim)' }}>See all</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {recent.slice(0, 12).map((s) => (
              <div key={s.id} className="group shrink-0 w-40 glass rounded-xl p-3 hover:-translate-y-1.5 hover:bg-white/[0.09] hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer" onClick={() => playSong(s, recent)}>
                <div className="relative rounded-lg overflow-hidden aspect-square mb-2.5 bg-black/30">
                  <img src={s.cover} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 55%)' }} />
                  <button className="absolute bottom-2 right-2 z-30 w-11 h-11 rounded-full btn-glow flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl shadow-purple-500/50">
                    <Play size={17} className="text-white ml-0.5" fill="white" />
                  </button>
                </div>
                <p className="text-sm font-medium truncate">{s.title}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-dim)' }}>{s.artist_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI DJ banner — the wow feature */}
      <Link to="/ai-dj" className="block mb-9">
        <motion.div whileHover={{ scale: 1.01 }} className="relative rounded-2xl overflow-hidden p-6 md:p-8 group"
          style={{ background: 'linear-gradient(120deg,#2a0a4a,#0f0524,#06283d)' }}>
          <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity" style={{ background: 'radial-gradient(circle at 85% 30%, rgba(236,72,153,0.55), transparent 55%)' }} />
          <div className="absolute -bottom-8 left-1/4 w-40 h-40 rounded-full blur-3xl animate-float" style={{ background: 'rgba(124,58,237,0.4)' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl btn-glow flex items-center justify-center shrink-0"><Wand2 size={26} className="text-white" /></div>
            <div className="flex-1">
              <p className="text-xs tracking-[0.25em] mb-1" style={{ color: '#EC4899' }}>NEW · AI DJ</p>
              <h3 className="font-display text-xl md:text-2xl font-bold">Say the vibe, I'll spin the mix</h3>
              <p className="text-sm mt-0.5 opacity-90">"Breakup songs chala" · "Gym energy english" · "Chill study lofi"</p>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 bg-white text-black font-semibold px-5 py-2.5 rounded-full text-sm shrink-0"><Sparkles size={15} /> Try it</span>
          </div>
        </motion.div>
      </Link>

      {/* Mood shortcuts */}
      <section className="mb-9">
        <h2 className="font-display text-2xl font-bold mb-4">Moods & Vibes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOODS.map(m => (
            <Link key={m.label} to={`/search?q=${encodeURIComponent(m.label + ' songs')}`} className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br ${m.color} p-4 flex items-end hover:scale-[1.03] transition`}>
              <span className="font-display font-bold text-lg">{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Live YouTube category rows.
          First two rows use the cheap 1-unit trending endpoint (India + Global)
          so the Home page always loads even when the 100-unit search quota runs out. */}
      {keyed ? (
        <>
          <YTRow title="Trending in India" query="trending india songs" subtitle="Most popular right now" trendingRegion="IN" />
          <YTRow title="Global Top Charts" query="global top songs" subtitle="What the world is playing" trendingRegion="US" />
          {CATEGORIES.map((c) => <YTRow key={c.query} title={c.title} query={c.query} subtitle={c.subtitle} />)}
        </>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.query} to="/settings" className="glass rounded-2xl p-6 h-40 flex flex-col justify-between hover:bg-white/8 transition">
              <Youtube size={24} style={{ color: '#EC4899' }} />
              <div>
                <p className="font-display font-bold">{c.title}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>Add API key to unlock</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
