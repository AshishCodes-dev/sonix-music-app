import { motion } from 'framer-motion';

export default function Loader({ full }: { full?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${full ? 'fixed inset-0 z-50' : 'py-32'}`} style={{ background: full ? 'var(--bg)' : undefined }}>
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-end gap-1 h-12">
          {[0, 0.15, 0.3, 0.45, 0.6].map((d, i) => (
            <motion.span key={i} className="w-1.5 rounded-full" style={{ background: 'linear-gradient(#06B6D4,#7C3AED,#EC4899)' }}
              animate={{ height: ['20%', '100%', '20%'] }} transition={{ repeat: Infinity, duration: 0.9, delay: d }} />
          ))}
        </div>
        <p className="font-display text-xs tracking-[0.4em]" style={{ color: 'var(--text-dim)' }}>SONIQ</p>
      </div>
    </div>
  );
}
