import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { LANGUAGES } from '../../i18n';
import { cx } from '../../utils/format';

/** Switching language re-renders in place — the current route, filters and trip state are kept. */
export default function LanguageSwitcher({ className = '', compact = false }) {
  const { i18n } = useTranslation();
  const enabled = LANGUAGES.filter((l) => l.enabled);
  return (
    <div className={cx('inline-flex items-center gap-1 rounded-full bg-sand-200/70 p-1', className)} role="group" aria-label="Language">
      {!compact && <Languages className="ml-1.5 size-4 text-forest-700" aria-hidden />}
      {enabled.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          onClick={() => i18n.changeLanguage(l.code)}
          aria-pressed={i18n.language === l.code}
          className={cx('rounded-full px-2.5 py-1 text-xs font-semibold transition', i18n.language === l.code ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-800 hover:bg-white/60')}
        >
          {l.code === 'en' ? 'EN' : 'മല'}
        </button>
      ))}
    </div>
  );
}
