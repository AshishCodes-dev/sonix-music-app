import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function MediaCard({ to, cover, title, subtitle, round, onPlay }: { to: string; cover: string; title: string; subtitle: string; round?: boolean; onPlay?: (e: React.MouseEvent) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={to} className="group block glass rounded-2xl p-4 relative transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.09] hover:shadow-2xl hover:shadow-purple-500/25 hover:ring-1 hover:ring-white/10">
        <div className={`relative overflow-hidden mb-3 ${round ? 'rounded-full' : 'rounded-xl'} aspect-square shadow-lg bg-black/30`}>
          <img src={cover} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
          {/* darken on hover for button contrast */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 55%)' }} />
          {onPlay && (
            <button
              onClick={(e) => { e.preventDefault(); onPlay(e); }}
              className="absolute bottom-2 right-2 z-30 w-11 h-11 rounded-full btn-glow flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl shadow-purple-500/50">
              <Play size={18} className="text-white ml-0.5" fill="white" />
            </button>
          )}
        </div>
        <p className="font-semibold text-sm truncate group-hover:text-white transition-colors">{title}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-dim)' }}>{subtitle}</p>
      </Link>
    </motion.div>
  );
}
