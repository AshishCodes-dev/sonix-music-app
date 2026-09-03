import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc3 } from 'lucide-react';

export default function IntroScreen() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('soniq_intro'));

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => { sessionStorage.setItem('soniq_intro', '1'); setShow(false); }, 2800);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(16px)' }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(circle at 50% 40%, #0b1d3d 0%, #020617 60%, #000 100%)' }}
        >
          {/* aurora orbs */}
          <div className="absolute w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 animate-float" style={{ background: 'radial-gradient(circle,#7C3AED,transparent 70%)', top: '10%', left: '10%' }} />
          <div className="absolute w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-30" style={{ background: 'radial-gradient(circle,#06B6D4,transparent 70%)', bottom: '5%', right: '8%' }} />
          <div className="absolute w-[35vw] h-[35vw] rounded-full blur-[120px] opacity-25 animate-float" style={{ background: 'radial-gradient(circle,#EC4899,transparent 70%)', bottom: '20%', left: '30%', animationDelay: '1.5s' }} />

          <div className="relative flex flex-col items-center">
            {/* spinning disc */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative mb-8"
            >
              <div className="w-28 h-28 rounded-full flex items-center justify-center animate-vinyl" style={{ background: 'conic-gradient(#06B6D4,#7C3AED,#EC4899,#06B6D4)', boxShadow: '0 0 60px rgba(124,58,237,0.6)' }}>
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#020617' }}>
                  <Disc3 size={44} className="text-white" />
                </div>
              </div>
            </motion.div>

            {/* wordmark */}
            <motion.h1
              initial={{ opacity: 0, y: 20, letterSpacing: '0.05em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
              transition={{ delay: 0.5, duration: 0.9 }}
              className="font-display text-5xl md:text-7xl font-bold text-gradient"
            >
              SONIQ
            </motion.h1>

            {/* animated equalizer */}
            <div className="flex items-end gap-1.5 h-10 mt-8">
              {[0, 0.1, 0.2, 0.3, 0.15, 0.25].map((d, i) => (
                <motion.span key={i} className="w-1.5 rounded-full"
                  style={{ background: 'linear-gradient(#06B6D4,#7C3AED,#EC4899)' }}
                  animate={{ height: ['20%', '100%', '20%'] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: d, ease: 'easeInOut' }} />
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="text-xs tracking-[0.5em] mt-6"
              style={{ color: 'var(--text-dim)' }}
            >
              FEEL THE SOUND
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
