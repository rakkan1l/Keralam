import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Section({ title, subtitle, to, action, children, className = '', id }) {
  const { t } = useTranslation();
  return (
    <section className={`py-8 sm:py-10 ${className}`} aria-labelledby={id}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id={id} className="text-2xl sm:text-[1.75rem]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>}
        </div>
        {action ||
          (to && (
            <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-forest-700 hover:text-forest-900">
              {t('home.viewAll')} <ArrowRight className="size-4" aria-hidden />
            </Link>
          ))}
      </div>
      {children}
    </section>
  );
}
