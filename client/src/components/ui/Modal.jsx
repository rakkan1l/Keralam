import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Accessible modal dialog: focus is moved in, Escape closes, background scroll is locked. */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const focusable = ref.current?.querySelector('input, select, textarea, button');
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative max-h-[90vh] w-full ${width} overflow-y-auto rounded-t-3xl bg-white p-6 shadow-[var(--shadow-lift)] sm:rounded-3xl`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl">{title}</h2>
          <button type="button" onClick={onClose} className="-m-2 rounded-full p-2 text-muted hover:bg-sand-100" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
