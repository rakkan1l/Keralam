import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import { TrustBadges } from '../ui/Badge';

/**
 * Editorial hero for detail pages: full-bleed image with the title set over a soft
 * gradient. The site header floats over it on place and district pages.
 */
export default function DetailHero({ doc, title, eyebrow, intro, crumbs = [], categories, kind, scene, children, size = 'lg' }) {
  const heights = { lg: 'min-h-[520px] sm:min-h-[78vh]', md: 'min-h-[420px] sm:min-h-[58vh]' };
  return (
    <section className={`relative isolate flex items-end overflow-hidden bg-forest-900 ${heights[size]}`}>
      <div className="absolute inset-0 -z-10">
        <SmartImage image={doc?.images?.[0]} alt={title} categories={categories} kind={kind} scene={scene} seed={title} eager />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/85 via-forest-950/20 to-forest-950/35" />
      <div className="container-page w-full pt-28 pb-10 sm:pb-14">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-white/75">
            {crumbs.map((c, i) => (
              <span key={c.to || c.label} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" aria-hidden />}
                {c.to ? <Link to={c.to} className="hover:text-white">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-white/80 uppercase">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-white">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">{intro}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <TrustBadges doc={doc} onImage />
          {children}
        </div>
      </div>
    </section>
  );
}

/** Title block for detail pages that don't use a full-bleed hero. */
export function DetailHeader({ doc, title, eyebrow, intro, crumbs = [], children }) {
  return (
    <header className="pt-8 pb-6 sm:pt-12">
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted">
          {crumbs.map((c, i) => (
            <span key={c.to || c.label} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3" aria-hidden />}
              {c.to ? <Link to={c.to} className="hover:text-ink">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="h1 max-w-3xl">{title}</h1>
      {intro && <p className="lead mt-3 max-w-2xl">{intro}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TrustBadges doc={doc} />
        {children}
      </div>
    </header>
  );
}

/** Photo gallery; renders nothing unless there is more than one real image. */
export function Gallery({ images = [], title }) {
  if (images.length < 2) return null;
  const [first, ...rest] = images.slice(0, 5);
  return (
    <section aria-label="Photos" className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
      <img src={first.url} alt={first.alt || title} loading="lazy" className="h-64 w-full rounded-[var(--radius-card)] object-cover sm:col-span-2 sm:row-span-2 sm:h-full" />
      {rest.map((img) => (
        <img key={img.url} src={img.url} alt={img.alt || title} loading="lazy" className="hidden h-40 w-full rounded-[var(--radius-card)] object-cover sm:block" />
      ))}
    </section>
  );
}
