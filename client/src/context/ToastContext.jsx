import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };
const TONES = {
  success: 'bg-forest-900 text-white',
  error: 'bg-laterite-600 text-white',
  info: 'bg-white text-ink border border-line',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (message, type = 'success') => {
      const id = ++idRef.current;
      setToasts((all) => [...all.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );
  const value = useMemo(
    () => ({ success: (m) => push(m, 'success'), error: (m) => push(m, 'error'), info: (m) => push(m, 'info') }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} role="status" className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-[var(--shadow-overlay)] ${TONES[t.type]}`}>
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="flex-1">{t.message}</span>
              <button type="button" onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100" aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
