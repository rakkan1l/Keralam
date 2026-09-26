import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services/api';
import { cx } from '../utils/format';

export default function SaveButton({ type, doc, variant = 'overlay', className = '' }) {
  const { t } = useTranslation();
  const { isSaved, toggle } = useSaved();
  const toast = useToast();
  if (!doc?._id) return null;
  const saved = isSaved(type, doc._id);

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await toggle(type, doc);
      if (res.saved) toast.success(res.guest ? t('common.signInToSave') : t('common.saved'));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const label = saved ? t('common.unsave') : t('common.save');
  if (variant === 'button') {
    return (
      <button type="button" onClick={onClick} aria-pressed={saved} className={cx('inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium ring-1 transition', saved ? 'bg-laterite-50 text-laterite-700 ring-laterite-100' : 'bg-white text-forest-900 ring-sand-300 hover:ring-forest-300', className)}>
        <Heart className={cx('size-4', saved && 'fill-current')} aria-hidden />
        {saved ? t('common.saved') : t('common.save')}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={saved} aria-label={label} title={label} className={cx('grid size-9 place-items-center rounded-full bg-white/90 text-forest-900 shadow-sm backdrop-blur transition hover:scale-105', saved && 'text-laterite-600', className)}>
      <Heart className={cx('size-[18px]', saved && 'fill-current')} aria-hidden />
    </button>
  );
}
