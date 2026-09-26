import { useTranslation } from 'react-i18next';
import { SearchX, WifiOff } from 'lucide-react';
import Button from './Button';
import { errorMessage } from '../../services/api';

export function EmptyState({ icon: Icon = SearchX, title, body, action }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-panel)] bg-sand-200/50 px-6 py-16 text-center">
      <Icon className="mb-4 size-7 text-forest-500" aria-hidden />
      <h3 className="h3">{title || t('common.noResults')}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{body ?? t('common.noResultsBody')}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-panel)] bg-laterite-50 px-6 py-14 text-center">
      <WifiOff className="mb-4 size-7 text-laterite-600" aria-hidden />
      <h3 className="h3">{t('common.error')}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{error?.response?.status === 404 ? errorMessage(error) : t('common.errorBody')}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
