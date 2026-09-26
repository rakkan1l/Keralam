import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, MessageSquareText, Radio } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Panel } from './Facts';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { endpoints, errorMessage } from '../../services/api';
import { formatDate, cx } from '../../utils/format';

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  text: z.string().max(2000).optional(),
});

function Stars({ value, onChange, size = 'size-5' }) {
  return (
    <div className="flex gap-0.5" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}`} onClick={() => onChange(n)}>
            <Star className={cx(size, n <= value ? 'fill-turmeric-400 text-turmeric-400' : 'text-sand-400')} />
          </button>
        ) : (
          <Star key={n} className={cx(size, n <= value ? 'fill-turmeric-400 text-turmeric-400' : 'text-sand-300')} aria-hidden />
        ),
      )}
    </div>
  );
}

export function ReviewsSection({ targetType, target, reviews = [] }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5, title: '', text: '' } });
  const rating = watch('rating');

  const onSubmit = async (values) => {
    try {
      await endpoints.createReview({ ...values, targetType, targetId: target._id });
      toast.success(t('reviews.submitted'));
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Panel title={`${t('place.reviews')}${target.rating?.count ? ` · ${target.rating.average.toFixed(1)} (${target.rating.count})` : ''}`} icon={MessageSquareText}>
      {reviews.length ? (
        <ul className="divide-y divide-sand-200">
          {reviews.map((r) => (
            <li key={r._id} className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.user?.name || '—'}</span>
                <Stars value={r.rating} size="size-4" />
              </div>
              {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
              {r.text && <p className="mt-1 text-sm text-forest-900">{r.text}</p>}
              <p className="mt-1 text-xs text-muted">{formatDate(r.createdAt, i18n.language)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t('reviews.none')}</p>
      )}
      <div className="mt-3">
        {user ? (
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>{t('reviews.write')}</Button>
        ) : (
          <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`} className="text-sm font-medium text-forest-700 hover:underline">{t('reviews.signIn')}</Link>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={t('reviews.write')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <span className="label">{t('reviews.rating')}</span>
            <Stars value={Number(rating)} onChange={(n) => setValue('rating', n)} size="size-7" />
          </div>
          <div>
            <label className="label" htmlFor="rv-title">{t('reviews.title')}</label>
            <input id="rv-title" className="input" {...register('title')} />
          </div>
          <div>
            <label className="label" htmlFor="rv-text">{t('reviews.text')}</label>
            <textarea id="rv-text" rows={4} className="input" {...register('text')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" loading={isSubmitting}>{t('common.submit')}</Button>
          </div>
        </form>
      </Modal>
    </Panel>
  );
}

const LEVELS = { crowd: ['low', 'moderate', 'high'], parking: ['good', 'fair', 'poor', 'closed'], road: ['good', 'fair', 'poor', 'closed'], condition: ['good', 'fair', 'poor', 'closed'] };

export function CommunityUpdates({ targetType, target, initial = [] }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [kind, setKind] = useState('crowd');
  const [level, setLevel] = useState('moderate');
  const [note, setNote] = useState('');
  const { data: updates = initial } = useQuery({
    queryKey: ['updates', targetType, target._id],
    queryFn: () => endpoints.updates({ targetType, targetId: target._id }),
    initialData: initial,
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: () => endpoints.createUpdate({ targetType, targetId: target._id, kind, level, note: note || undefined }),
    onSuccess: () => {
      toast.success(t('updates.posted'));
      setNote('');
      qc.invalidateQueries({ queryKey: ['updates', targetType, target._id] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Panel title={t('place.conditions')} icon={Radio} footer={t('updates.unverified')}>
      {updates.length ? (
        <ul className="space-y-2">
          {updates.map((u) => (
            <li key={u._id} className="flex items-start justify-between gap-3 rounded-xl bg-sand-100 p-3 text-sm">
              <div>
                <p className="font-medium">
                  {t(`updates.kinds.${u.kind}`)}: {t(`levels.${u.level}`)}
                </p>
                {u.note && <p className="text-forest-900">{u.note}</p>}
              </div>
              <span className="shrink-0 text-xs text-muted">{formatDate(u.createdAt, i18n.language, { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t('updates.none')}</p>
      )}
      {user && (
        <form
          className="mt-4 grid gap-2 sm:grid-cols-[auto_auto_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="sr-only" htmlFor="u-kind">{t('updates.kind')}</label>
          <select id="u-kind" className="input" value={kind} onChange={(e) => { setKind(e.target.value); setLevel(LEVELS[e.target.value][0]); }}>
            {Object.keys(LEVELS).map((k) => <option key={k} value={k}>{t(`updates.kinds.${k}`)}</option>)}
          </select>
          <label className="sr-only" htmlFor="u-level">{t('updates.level')}</label>
          <select id="u-level" className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS[kind].map((l) => <option key={l} value={l}>{t(`levels.${l}`)}</option>)}
          </select>
          <label className="sr-only" htmlFor="u-note">{t('updates.note')}</label>
          <input id="u-note" className="input" maxLength={500} placeholder={t('updates.note')} value={note} onChange={(e) => setNote(e.target.value)} />
          <Button type="submit" size="sm" className="h-auto" loading={mutation.isPending}>{t('updates.add')}</Button>
        </form>
      )}
    </Panel>
  );
}
