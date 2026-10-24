import { Link } from 'react-router-dom';
import { applyLink, communityLinks, navigation, site } from '../../config/site.js';
import Mark from '../ui/Mark.jsx';
import './layout.css';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer theme-dark">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" className="brand">
              <span className="brand__mark">
                <Mark />
              </span>
              <span className="brand__name">{site.name}</span>
            </Link>
            <p className="muted site-footer__tagline">{site.tagline}</p>
          </div>

          <nav aria-label="Footer" className="site-footer__col">
            <p className="caps site-footer__label">Explore</p>
            <ul role="list">
              {[...navigation, applyLink].map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__col">
            <p className="caps site-footer__label">Community</p>
            {communityLinks.length > 0 ? (
              <ul role="list">
                {communityLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted site-footer__pending">Official community links will appear here once they are confirmed.</p>
            )}
          </div>

          <div className="site-footer__col">
            <p className="caps site-footer__label">Server</p>
            <p className="muted site-footer__pending">Pre-launch. The game server is not open yet — applications are the first step.</p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {year} {site.name}
          </p>
          <p>Not affiliated with or endorsed by Rockstar Games, Take-Two Interactive or Cfx.re.</p>
        </div>
      </div>
    </footer>
  );
}
