import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Music2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlaylists, request } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Playlist } from '../types';

export default function Library() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const load = () => {
    if (user) getPlaylists(`user_id=${user.id}`).then(setPlaylists);
    else getPlaylists('featured=true').then(setPlaylists);
  };
  useEffect(load, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await request('/api/playlists', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, user_id: user?.id, owner_name: user?.user_metadata?.full_name || 'You', is_public: isPublic, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80' }) });
    setShowModal(false); setName(''); setDesc(''); load();
  };

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Your Library</h1>
        {user && <button onClick={() => setShowModal(true)} className="btn-glow text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Create Playlist</button>}
      </div>
      {!user && <div className="glass rounded-2xl p-8 text-center mb-6"><p style={{ color: 'var(--text-dim)' }}>Log in to create your own playlists and save music.</p><Link to="/login" className="btn-glow text-white px-6 py-2.5 rounded-full inline-block mt-4 text-sm">Log In</Link></div>}
      {playlists.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center"><Music2 size={48} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} /><p className="font-display text-xl">No playlists yet</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {playlists.map(pl => (
            <Link key={pl.id} to={`/playlist/${pl.id}`} className="glass rounded-2xl p-4 hover:bg-white/8 transition">
              {pl.cover ? <img src={pl.cover} className="aspect-square rounded-xl object-cover mb-3" /> : <div className="aspect-square rounded-xl mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}><Music2 size={32} /></div>}
              <p className="font-semibold text-sm truncate">{pl.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{(pl.song_ids || []).length} songs</p>
            </Link>
          ))}
        </div>
      )}

      <AnimatePresence>{showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <motion.form initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} onSubmit={create}
            className="glass-strong rounded-3xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-5"><h2 className="font-display text-2xl font-bold">New Playlist</h2><button type="button" onClick={() => setShowModal(false)}><X /></button></div>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Playlist name" className="w-full glass rounded-xl px-4 py-3 mb-3 outline-none focus:glow-purple" style={{ color: 'var(--text)' }} />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full glass rounded-xl px-4 py-3 mb-3 outline-none resize-none" style={{ color: 'var(--text)' }} />
            <label className="flex items-center gap-2 mb-5 text-sm" style={{ color: 'var(--text-dim)' }}><input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="accent-purple-500" /> Make public</label>
            <button className="btn-glow text-white w-full py-3 rounded-xl font-semibold">Create</button>
          </motion.form>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
