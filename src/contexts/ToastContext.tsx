import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, Music } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'music';
interface Toast { id: number; message: string; type: ToastType; }

const ToastContext = createContext<{ toast: (m: string, t?: ToastType) => void }>({ toast: () => {} });

let idc = 0;
const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  music: Music,
};
const COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#06B6D4',
  music: '#EC4899',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idc;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-28 lg:bottom-28 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="glass-strong rounded-full px-5 py-3 flex items-center gap-2.5 shadow-2xl pointer-events-auto"
                style={{ border: `1px solid ${COLORS[t.type]}40` }}>
                <Icon size={17} style={{ color: COLORS[t.type] }} />
                <span className="text-sm font-medium whitespace-nowrap">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
