import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/format';

export default function Logo({ light = false, onClick }) {
  const { t } = useTranslation();
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2.5" aria-label={`${t('brand.name')} — ${t('nav.home')}`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill={light ? '#fff' : '#1e372b'} />
        <path d="M7 22c3.5-1.6 6.5-1.6 9 0s5.5 1.6 9 0" stroke={light ? '#1e372b' : '#e0c58f'} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M16 7c-1 4-1 8 0 11.5M16 11c-3-1.6-5.5-1-7 .6M16 11c3-1.6 5.5-1 7 .6M16 14.5c-2.5-1-4.5-.5-6 1M16 14.5c2.5-1 4.5-.5 6 1" stroke={light ? '#1e372b' : '#fff'} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      <span className={cx('font-display text-[1.35rem] leading-none tracking-[-0.01em]', light ? 'text-white' : 'text-ink')}>{t('brand.name')}</span>
    </Link>
  );
}
