import { useTranslation } from 'react-i18next';
import { SearchX, WifiOff } from 'lucide-react';
import Button from './Button';
import { errorMessage } from '../../services/api';

export function EmptyState({ icon: Icon = SearchX, title, body, action }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-sand-300 bg-white/60 px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-forest-50 text-forest-700">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title || t('common.noResults')}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{body ?? t('common.noResultsBody')}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-card)] bg-laterite-50 px-6 py-12 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-white text-laterite-600">
        <WifiOff className="size-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{t('common.error')}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{error?.response?.status === 404 ? errorMessage(error) : t('common.errorBody')}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
