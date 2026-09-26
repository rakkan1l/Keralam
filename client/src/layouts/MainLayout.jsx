import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';
import Footer from '../components/layout/Footer';
import EmergencyButton from '../components/layout/EmergencyButton';
import { PageLoader } from '../components/ui/PageLoader';

export default function MainLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-50 rounded-full bg-forest-800 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t('nav.skipToContent')}
      </a>
      <Navbar />
      <main id="main" className="flex-1 pb-20 lg:pb-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <EmergencyButton />
      <BottomNav />
    </div>
  );
}
