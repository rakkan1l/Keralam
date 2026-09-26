import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();
  const col = (title, links) => (
    <div>
      <h3 className="mb-3 font-sans text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(([to, key]) => (
          <li key={to}>
            <Link to={to} className="text-forest-100/80 hover:text-white">{t(`nav.${key}`)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="mt-16 bg-forest-900 pb-24 pt-12 text-forest-100 lg:pb-12">
      <div className="container-page grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-white">{t('brand.name')}</p>
          <p className="mt-1 text-sm text-turmeric-100">{t('brand.tagline')}</p>
          <p className="mt-4 max-w-sm text-sm text-forest-100/80">{t('footer.about')}</p>
          <LanguageSwitcher className="mt-5 bg-forest-800 [&_button]:text-forest-100 [&_button[aria-pressed=true]]:text-forest-900" />
        </div>
        {col(t('footer.discover'), [['/explore', 'explore'], ['/districts', 'districts'], ['/hidden-gems', 'hiddenGems'], ['/food', 'food'], ['/events', 'events']])}
        {col(t('footer.plan'), [['/trip-builder', 'aiTrip'], ['/directions', 'travel'], ['/stays', 'stays'], ['/near-me', 'nearMe'], ['/saved', 'saved']])}
        {col(t('footer.support'), [['/help', 'help'], ['/shopping', 'shopping'], ['/theatres', 'theatres'], ['/activities', 'activities'], ['/account', 'account']])}
      </div>
      <div className="container-page mt-10 border-t border-forest-800 pt-6 text-xs text-forest-100/70">
        <p>{t('footer.dataNote')}</p>
        <p className="mt-2">© {new Date().getFullYear()} Keralam · {t('footer.rights')} Map data © OpenStreetMap contributors.</p>
      </div>
    </footer>
  );
}
