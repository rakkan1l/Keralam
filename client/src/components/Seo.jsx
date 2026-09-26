import { useLocation } from 'react-router-dom';

const SITE = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');

/**
 * Page metadata using React 19's native <title>/<meta>/<link> hoisting.
 * `jsonLd` renders schema.org structured data for destinations and events.
 */
export default function Seo({ title, description, image, type = 'website', jsonLd, noindex = false }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} · Keralam` : 'Keralam — Kerala, Discovered Your Way';
  const canonical = `${SITE || (typeof window !== 'undefined' ? window.location.origin : '')}${pathname}`;
  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      {noindex && <meta name="robots" content="noindex" />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  );
}
