import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { SavedProvider } from './context/SavedContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import { loadServerOverrides } from './i18n';
import { endpoints } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (count, err) => count < 2 && (!err?.response || err.response.status >= 500),
    },
  },
});

function TranslationOverrides() {
  const { i18n } = useTranslation();
  useEffect(() => {
    loadServerOverrides(i18n.language, endpoints.translations);
  }, [i18n.language]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <SavedProvider>
              <LocationProvider>
                <TranslationOverrides />
                <AppRoutes />
              </LocationProvider>
            </SavedProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
