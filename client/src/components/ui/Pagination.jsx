import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

export default function Pagination({ meta, onPage }) {
  const { t } = useTranslation();
  if (!meta || meta.pages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        <ChevronLeft className="size-4" aria-hidden /> {t('common.previous')}
      </Button>
      <span className="text-sm text-muted">{t('common.pageOf', { page: meta.page, pages: meta.pages })}</span>
      <Button variant="secondary" size="sm" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>
        {t('common.next')} <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  );
}
