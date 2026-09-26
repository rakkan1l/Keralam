import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Siren } from 'lucide-react';

/** Always-visible emergency shortcut on mobile (sits above the bottom navigation). */
export default function EmergencyButton() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  if (pathname.startsWith('/help')) return null;
  return (
    <Link
      to="/help"
      className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-laterite-600 px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lift)] hover:bg-laterite-700 sm:hidden"
      aria-label={t('nav.emergency')}
    >
      <Siren className="size-4" aria-hidden />
      SOS
    </Link>
  );
}
