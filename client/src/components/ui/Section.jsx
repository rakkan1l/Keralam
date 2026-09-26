import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/format';

/** Section with an editorial header: eyebrow, title, optional subtitle and "view all" link. */
export default function Section({ eyebrow, title, subtitle, to, linkLabel, action, children, className = '', id }) {
  const { t } = useTranslation();
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className={cx('py-12 sm:py-16', className)} aria-labelledby={headingId} id={id}>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 id={headingId} className="h2">{title}</h2>
          {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
        </div>
        {action ||
          (to && (
            <Link to={to} className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-ink hover:text-forest-700 sm:inline-flex">
              {linkLabel || t('home.viewAll')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ))}
      </div>
      {children}
      {to && !action && (
        <Link to={to} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 sm:hidden">
          {linkLabel || t('home.viewAll')} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}

/** Standard page header used by listing pages. */
export function PageIntro({ eyebrow, title, subtitle, children }) {
  return (
    <header className="pt-10 pb-6 sm:pt-14 sm:pb-8">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="h1 max-w-3xl">{title}</h1>
      {subtitle && <p className="lead mt-3 max-w-2xl">{subtitle}</p>}
      {children}
    </header>
  );
}
