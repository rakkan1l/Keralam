import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Pagination({ meta, onPage }) {
  const { t } = useTranslation();
  if (!meta || meta.pages <= 1) return null;
  const btn = 'grid size-10 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-forest-300 disabled:opacity-40 disabled:hover:border-line';
  return (
    <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Pagination">
      <button type="button" className={btn} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label={t('common.previous')}>
        <ChevronLeft className="size-4" />
      </button>
      <span className="text-sm text-muted tabular-nums">{t('common.pageOf', { page: meta.page, pages: meta.pages })}</span>
      <button type="button" className={btn} disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)} aria-label={t('common.next')}>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
