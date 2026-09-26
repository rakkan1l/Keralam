import { Link } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import { TrustBadges } from '../ui/Badge';

/** Shared hero for detail pages: image (or scene art), breadcrumbs, title and badges. */
export default function DetailHero({ doc, title, subtitle, crumbs = [], categories, kind, children, meta }) {
  const images = doc?.images || [];
  return (
    <div>
      <div className="relative h-72 overflow-hidden bg-sand-200 sm:h-96">
        <SmartImage image={images[0]} alt={title} categories={categories} kind={kind} seed={title} eager />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-6 text-white">
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-white/80">
            {crumbs.map((c, i) => (
              <span key={c.to || c.label} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" aria-hidden />}
                {c.to ? <Link to={c.to} className="hover:text-white hover:underline">{c.label}</Link> : <span>{c.label}</span>}
              </span>
            ))}
          </nav>
          <h1 className="text-3xl text-white sm:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-4" aria-hidden /> {subtitle}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TrustBadges doc={doc} onImage />
            {meta}
          </div>
        </div>
      </div>
      {images.length > 1 && (
        <div className="container-page mt-3 flex gap-2 overflow-x-auto">
          {images.slice(1, 6).map((img) => (
            <img key={img.url} src={img.url} alt={img.alt || title} loading="lazy" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
