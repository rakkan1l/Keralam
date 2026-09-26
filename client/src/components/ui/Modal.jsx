import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Accessible dialog: focus moves in and returns, Escape/backdrop close, scroll locked. */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const focusable = ref.current?.querySelector('input, select, textarea, button:not([data-close])');
    (focusable || ref.current)?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-forest-950/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`animate-fade-up relative max-h-[90vh] w-full ${width} overflow-y-auto rounded-t-[var(--radius-panel)] bg-white p-6 shadow-[var(--shadow-overlay)] sm:rounded-[var(--radius-panel)] sm:p-7`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="h3 text-lg">{title}</h2>
          <button type="button" data-close onClick={onClose} className="-m-2 grid size-10 place-items-center rounded-full text-muted hover:bg-sand-100 hover:text-ink" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
