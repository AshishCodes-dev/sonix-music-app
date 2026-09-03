import { useState } from 'react';
import { Check } from 'lucide-react';
import supabase from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { isVoiceDjOn, setVoiceDj } from '../lib/voiceDj';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [saved, setSaved] = useState(false);
  const [quality, setQuality] = useState('High');
  const [crossfade, setCrossfade] = useState(true);
  const [voiceDj, setVoiceDjState] = useState(isVoiceDjOn());

  const save = async () => { try { await supabase.auth.updateUser({ data: { full_name: name } }); } catch {} setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="px-4 md:px-6 py-6 max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-6">Settings</h1>

      {/* Streaming status — no setup needed */}
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-2 text-sm" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
        <Check size={17} /> Streaming is active — search and play any song instantly.
      </div>

      {user ? (
        <div className="glass rounded-2xl p-6 mb-4">
          <h2 className="font-display text-xl font-bold mb-4">Account</h2>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-dim)' }}>Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full glass rounded-xl px-4 py-2.5 mb-3 outline-none" style={{ color: 'var(--text)' }} />
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-dim)' }}>Email</label>
          <input disabled value={user?.email || ''} className="w-full glass rounded-xl px-4 py-2.5 outline-none opacity-60" />
          <button onClick={save} className="btn-glow text-white px-6 py-2.5 rounded-xl mt-4 text-sm">{saved ? '✓ Saved' : 'Save Changes'}</button>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold mb-1">Account</h2>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Sign in to sync your playlists and likes.</p>
          </div>
          <a href="/login" className="btn-glow text-white px-6 py-2.5 rounded-xl text-sm shrink-0">Sign In</a>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-4">Playback</h2>
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div><p className="text-sm font-medium">Audio Quality</p><p className="text-xs" style={{ color: 'var(--text-dim)' }}>Higher quality uses more data</p></div>
          <select value={quality} onChange={e => setQuality(e.target.value)} className="glass rounded-lg px-3 py-2 text-sm outline-none" style={{ color: 'var(--text)' }}>
            {['Low', 'Normal', 'High', 'Lossless HiFi'].map(q => <option key={q} style={{ background: '#081120' }}>{q}</option>)}
          </select>
        </div>
        <label className="flex items-center justify-between py-3">
          <div><p className="text-sm font-medium">Autoplay next song</p><p className="text-xs" style={{ color: 'var(--text-dim)' }}>Continue playing similar music</p></div>
          <input type="checkbox" checked={crossfade} onChange={e => setCrossfade(e.target.checked)} className="w-5 h-5 accent-purple-500" />
        </label>
        <label className="flex items-center justify-between py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div><p className="text-sm font-medium">AI Voice DJ 🎙️</p><p className="text-xs" style={{ color: 'var(--text-dim)' }}>Announce each song like a live radio DJ</p></div>
          <input type="checkbox" checked={voiceDj} onChange={e => { setVoiceDjState(e.target.checked); setVoiceDj(e.target.checked); }} className="w-5 h-5 accent-purple-500" />
        </label>
      </div>
    </div>
  );
}
