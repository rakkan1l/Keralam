import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n';
import { cx } from '../../utils/format';

/** Segmented language control. Switching re-renders in place, keeping route, filters and trip state. */
export default function LanguageSwitcher({ className = '', dark = false }) {
  const { i18n, t } = useTranslation();
  return (
    <div className={cx('inline-flex rounded-full p-0.5', dark ? 'bg-white/10' : 'bg-sand-200', className)} role="group" aria-label={t('account.language')}>
      {LANGUAGES.filter((l) => l.enabled).map((l) => {
        const active = i18n.language === l.code;
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            aria-pressed={active}
            className={cx(
              'rounded-full px-3 py-1 text-xs font-medium transition',
              active ? (dark ? 'bg-white text-ink' : 'bg-white text-ink shadow-sm') : dark ? 'text-white/75 hover:text-white' : 'text-muted hover:text-ink',
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
