import { Link } from 'react-router-dom';
import './ui.css';

export function Arrow() {
  return (
    <svg className="arrow" width="18" height="10" viewBox="0 0 18 10" aria-hidden="true" focusable="false">
      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Router-aware call-to-action. Variants: gold (primary), ghost, ink. */
export default function ButtonLink({ to, href, variant = 'gold', size, arrow = true, children, className = '', ...rest }) {
  const classes = ['btn', `btn--${variant}`, size && `btn--${size}`, className].filter(Boolean).join(' ');
  const content = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  );
  if (href) {
    return (
      <a className={classes} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link className={classes} to={to} {...rest}>
      {content}
    </Link>
  );
}
