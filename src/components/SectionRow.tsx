import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

export default function SectionRow({ title, viewAll, children }: { title: string; viewAll?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
        {viewAll && <Link to={viewAll} className="text-xs uppercase tracking-widest hover:text-white transition" style={{ color: 'var(--text-dim)' }}>See all</Link>}
      </div>
      {children}
    </section>
  );
}
