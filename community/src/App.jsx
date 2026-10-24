import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import HomePage from './features/home/HomePage.jsx';

// Home ships in the main bundle; every other page is split into its own chunk.
const GangsPage = lazy(() => import('./features/gangs/GangsPage.jsx'));
const AdminPage = lazy(() => import('./features/admin/AdminPage.jsx'));
const RulesPage = lazy(() => import('./features/rules/RulesPage.jsx'));
const ApplyPage = lazy(() => import('./features/apply/ApplyPage.jsx'));
const NotFoundPage = lazy(() => import('./features/system/NotFoundPage.jsx'));

function PageFallback() {
  return <div className="page-fallback theme-dark" aria-busy="true" aria-label="Loading page" />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        {[
          ['gangs', GangsPage],
          ['admin', AdminPage],
          ['rules', RulesPage],
          ['apply', ApplyPage],
          ['*', NotFoundPage],
        ].map(([path, Page]) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<PageFallback />}>
                <Page />
              </Suspense>
            }
          />
        ))}
      </Route>
    </Routes>
  );
}
