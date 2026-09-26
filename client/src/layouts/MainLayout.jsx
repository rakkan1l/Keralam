import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { PageLoader } from '../components/ui/PageLoader';

// Pages whose first section is a full-bleed image; the header floats over it.
const OVERLAY_ROUTES = [/^\/$/, /^\/(places|districts|listings|stays|events)\/[^/]+$/, /^\/food\/dishes\/[^/]+$/];

export default function MainLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const overlay = OVERLAY_ROUTES.some((r) => r.test(pathname));
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[80] rounded-full bg-forest-800 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t('nav.skipToContent')}
      </a>
      <Header overlay={overlay} />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
