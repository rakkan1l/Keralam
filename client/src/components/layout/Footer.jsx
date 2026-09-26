import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

const LINKS = [
  ['/explore', 'discover'],
  ['/districts', 'districts'],
  ['/trip-builder', 'aiPlanner'],
  ['/events', 'events'],
  ['/help', 'emergencyAssistance'],
  ['/about', 'about'],
];

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-forest-950 text-white/75">
      <div className="container-page py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-white/65">{t('footer.about')}</p>
          </div>
          <nav aria-label={t('footer.discover')}>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-sm">
              {LINKS.map(([to, key]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white">{t(`nav.${key}`)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} {t('brand.name')}</span>
            <Link to="/about#contact" className="hover:text-white">{t('footer.contact')}</Link>
            <Link to="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white">{t('footer.terms')}</Link>
          </div>
          <LanguageSwitcher dark />
        </div>
        <p className="mt-5 max-w-3xl text-[11px] leading-relaxed text-white/45">{t('footer.dataNote')} Map data © OpenStreetMap contributors.</p>
      </div>
    </footer>
  );
}
