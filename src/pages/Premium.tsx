import { Check, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
  { name: 'Free', price: '$0', period: 'forever', features: ['Ad-supported listening', 'Standard audio quality', 'Shuffle play', 'Limited skips'], cta: 'Current Plan', highlight: false },
  { name: 'Premium', price: '$9.99', period: 'per month', features: ['Ad-free music', 'Lossless HiFi audio', 'Offline downloads', 'Unlimited skips', 'AI DJ & Smart Shuffle', 'Dolby Atmos spatial audio'], cta: 'Get Premium', highlight: true },
  { name: 'Family', price: '$14.99', period: 'per month', features: ['Everything in Premium', 'Up to 6 accounts', 'Parental controls', 'Cross-device sync', 'Shared playlists'], cta: 'Get Family', highlight: false },
];

export default function Premium() {
  return (
    <div className="px-4 md:px-6 py-10">
      <div className="text-center mb-12">
        <Crown size={40} className="mx-auto mb-3" style={{ color: '#EC4899' }} />
        <h1 className="font-display text-4xl md:text-6xl font-bold">Unlock <span className="text-gradient">SONIQ Premium</span></h1>
        <p className="mt-3" style={{ color: 'var(--text-dim)' }}>Lossless audio. Zero ads. Pure sound.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`glass rounded-3xl p-8 relative ${p.highlight ? 'glow-purple border-purple-500/40' : ''}`} style={{ borderColor: p.highlight ? 'rgba(124,58,237,0.4)' : undefined }}>
            {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 btn-glow text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</span>}
            <h3 className="font-display text-2xl font-bold mb-1">{p.name}</h3>
            <div className="mb-6"><span className="text-4xl font-bold text-gradient">{p.price}</span><span className="text-sm" style={{ color: 'var(--text-dim)' }}> / {p.period}</span></div>
            <ul className="space-y-3 mb-8">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm"><Check size={16} style={{ color: '#06B6D4' }} /> {f}</li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-semibold ${p.highlight ? 'btn-glow text-white' : 'glass'}`}>{p.cta}</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
