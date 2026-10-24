import './ui.css';

/**
 * Honest status label. `tone`: pending | neutral | positive.
 * Only use `positive` for states backed by real data.
 */
export function StatusPill({ tone = 'neutral', children }) {
  return (
    <span className={`status status--${tone}`}>
      <span className="status__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Inline notice explaining what is not yet connected, configured or confirmed. */
export function Notice({ title, children, tone = 'info' }) {
  return (
    <div className={`notice notice--${tone}`} role="note">
      <span className="notice__mark" aria-hidden="true" />
      <div>
        {title && <p className="notice__title">{title}</p>}
        <div className="notice__body">{children}</div>
      </div>
    </div>
  );
}
