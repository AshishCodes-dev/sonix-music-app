export default function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4 w-4">
      {[0, 0.2, 0.4, 0.1].map((d, i) => (
        <span key={i} className="eq-bar w-0.5 rounded-full"
          style={{ background: 'linear-gradient(#06B6D4,#7C3AED)', animationDelay: `${d}s`, animationPlayState: active ? 'running' : 'paused', height: active ? undefined : '30%' }} />
      ))}
    </div>
  );
}
