import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { applyLink, navigation, site } from '../../config/site.js';
import Mark from '../ui/Mark.jsx';
import { Arrow } from '../ui/ButtonLink.jsx';
import './layout.css';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    document.body.style.overflow = 'hidden';
    panel?.querySelector(FOCUSABLE)?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = [toggle, ...panel.querySelectorAll(FOCUSABLE)].filter(Boolean);
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <header className={`site-header theme-dark${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container site-header__bar">
        <Link to="/" className="brand" aria-label={`${site.name} — home`}>
          <span className="brand__mark">
            <Mark />
          </span>
          <span className="brand__name">{site.name}</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul role="list" className="site-nav__list">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="site-nav__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <NavLink to={applyLink.to} className="btn btn--gold btn--sm site-nav__cta">
            <span>{applyLink.label}</span>
            <Arrow />
          </NavLink>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-toggle__lines" aria-hidden="true" />
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        className="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
      >
        <nav aria-label="Mobile primary" className="container mobile-menu__inner">
          <ol role="list" className="mobile-menu__list">
            {navigation.map((item, index) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="mobile-menu__link" onClick={() => setOpen(false)}>
                  <span className="mobile-menu__index caps">{String(index + 1).padStart(2, '0')}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ol>
          <Link to={applyLink.to} className="btn btn--gold btn--lg mobile-menu__cta" onClick={() => setOpen(false)}>
            <span>{applyLink.label}</span>
            <Arrow />
          </Link>
        </nav>
      </div>
    </header>
  );
}
