import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Heart, ListPlus, Luggage, History, Plus, Lock, Globe, ArrowUpRight } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PageIntro } from '../components/ui/Section';
import { AnyCard, CARD_GRID } from '../components/cards/Cards';
import { GridSkeleton, Skeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { useQueryParams } from '../hooks/useQueryParams';
import { endpoints, errorMessage } from '../services/api';
import { formatDate, cx } from '../utils/format';

function SavedItems() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { guestItems } = useSaved();
  const q = useQuery({ queryKey: ['me', 'saved'], queryFn: endpoints.saved, enabled: Boolean(user) });
  const items = user ? q.data : guestItems;
  if (user && q.error) return <ErrorState error={q.error} onRetry={q.refetch} />;
  if (user && q.isLoading) return <GridSkeleton className={CARD_GRID} count={3} />;
  if (!items?.length) return <EmptyState icon={Heart} title={t('saved.empty')} body={t('saved.emptyBody')} action={<Button to="/explore">{t('home.exploreCta')}</Button>} />;
  return (
    <>
      {!user && (
        <p className="mb-8 text-sm text-muted">
          {t('common.signInToSave')} <Link to="/login?next=/saved" className="link">{t('nav.login')}</Link>
        </p>
      )}
      <div className={CARD_GRID}>{items.map((s) => <AnyCard key={`${s.targetType}${s.targetId}`} type={s.targetType} item={s.item} />)}</div>
    </>
  );
}

function Lists() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const q = useQuery({ queryKey: ['me', 'lists'], queryFn: endpoints.lists });
  const create = useMutation({
    mutationFn: () => endpoints.createList({ name, isPublic }),
    onSuccess: () => {
      setOpen(false);
      setName('');
      qc.invalidateQueries({ queryKey: ['me', 'lists'] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  return (
    <>
      <div className="mb-6 flex justify-end"><Button variant="secondary" onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden />{t('saved.newList')}</Button></div>
      {q.isLoading ? (
        <Skeleton className="h-40" />
      ) : q.data?.length ? (
        <ul className="divide-y divide-line border-y border-line">
          {q.data.map((l) => (
            <li key={l._id}>
              <Link to={`/lists/${l._id}`} className="group flex items-center justify-between gap-4 py-4">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[16px] font-semibold">
                    {l.name}
                    {l.isPublic ? <Globe className="size-4 text-lagoon-500" aria-label={t('saved.public')} /> : <Lock className="size-3.5 text-muted" aria-hidden />}
                  </span>
                  <span className="text-[13px] text-muted">{t('saved.itemsCount', { count: l.items.length })} · {formatDate(l.updatedAt, i18n.language)}</span>
                </span>
                <ArrowUpRight className="size-4 text-muted transition group-hover:text-ink" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={ListPlus} title={t('saved.noLists')} body={t('saved.listsBody')} />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={t('saved.newList')} size="sm">
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }} className="space-y-4">
          <div>
            <label className="label" htmlFor="list-name">{t('saved.listName')}</label>
            <input id="list-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="size-4 accent-forest-700" />{t('saved.public')}</label>
          <div className="flex justify-end"><Button type="submit" loading={create.isPending}>{t('common.submit')}</Button></div>
        </form>
      </Modal>
    </>
  );
}

function Trips() {
  const { t, i18n } = useTranslation();
  const q = useQuery({ queryKey: ['me', 'trips'], queryFn: endpoints.trips });
  if (q.isLoading) return <Skeleton className="h-40" />;
  if (!q.data?.length) return <EmptyState icon={Luggage} title={t('saved.noTrips')} body={t('trip.subtitle')} action={<Button to="/trip-builder">{t('home.planCta')}</Button>} />;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {q.data.map((trip) => (
        <li key={trip._id}>
          <Link to={`/trips/${trip._id}`} className="group flex items-center justify-between gap-4 py-4">
            <span className="min-w-0">
              <span className="block truncate text-[16px] font-semibold">{trip.title}</span>
              <span className="text-[13px] text-muted">
                {t('saved.tripMeta', { days: trip.days?.length || 0, km: trip.summary?.totalDistanceKm ?? '—' })} · {formatDate(trip.updatedAt, i18n.language)}
                {trip.isPublic && ` · ${t('saved.shared')}`}
              </span>
            </span>
            <ArrowUpRight className="size-4 text-muted transition group-hover:text-ink" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Recent() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ['me', 'recent'], queryFn: endpoints.recent });
  if (q.isLoading) return <GridSkeleton className={CARD_GRID} count={3} />;
  if (!q.data?.length) return <EmptyState icon={History} title={t('saved.noRecent')} body={t('saved.recentBody')} />;
  return <div className={CARD_GRID}>{q.data.map((r) => <AnyCard key={`${r.targetType}${r.targetId}`} type={r.targetType} item={r.item} />)}</div>;
}

export default function Saved() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [params, set] = useQueryParams();
  const tab = params.tab || 'places';
  const tabs = [
    ['places', t('saved.places')],
    ['trips', t('saved.trips')],
    ['lists', t('saved.lists')],
    ['recent', t('saved.recent')],
  ];
  return (
    <div className="container-page pb-20">
      <Seo title={t('saved.title')} noindex />
      <PageIntro eyebrow={t('nav.sectionPersonal')} title={t('saved.title')} />
      <div className="mb-10 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} type="button" onClick={() => set({ tab: key === 'places' ? '' : key })} className={cx('-mb-px shrink-0 border-b-2 pb-3 text-[15px] font-medium transition', tab === key ? 'border-forest-800 text-ink' : 'border-transparent text-muted hover:text-ink')}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'places' ? (
        <SavedItems />
      ) : !user ? (
        <EmptyState icon={Lock} title={t('saved.signInFor')} body={t('auth.guestNote')} action={<Button to={`/login?next=${encodeURIComponent(`/saved?tab=${tab}`)}`}>{t('nav.login')}</Button>} />
      ) : tab === 'lists' ? (
        <Lists />
      ) : tab === 'trips' ? (
        <Trips />
      ) : (
        <Recent />
      )}
    </div>
  );
}
