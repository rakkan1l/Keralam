import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Heart, ListPlus, Map, History, Plus, Lock, Globe } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { AnyCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
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
  if (user && q.isLoading) return <GridSkeleton />;
  if (!items?.length) return <EmptyState icon={Heart} title={t('saved.empty')} body={t('saved.emptyBody')} action={<Button to="/explore">{t('nav.explore')}</Button>} />;
  return (
    <>
      {!user && <p className="mb-4 rounded-2xl bg-lagoon-50 p-3 text-sm text-lagoon-700">{t('common.signInToSave')} <Link to="/login?next=/saved" className="font-semibold underline">{t('nav.login')}</Link></p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((s) => <AnyCard key={`${s.targetType}${s.targetId}`} type={s.targetType} item={s.item} />)}
      </div>
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
      <Button onClick={() => setOpen(true)} className="mb-5"><Plus className="size-4" aria-hidden />{t('saved.newList')}</Button>
      {q.isLoading ? (
        <GridSkeleton count={3} />
      ) : q.data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {q.data.map((l) => (
            <Link key={l._id} to={`/lists/${l._id}`} className="card p-5 transition hover:ring-forest-300">
              <div className="flex items-start justify-between">
                <h3 className="font-sans text-lg font-semibold">{l.name}</h3>
                {l.isPublic ? <Globe className="size-4 text-lagoon-500" aria-label={t('saved.public')} /> : <Lock className="size-4 text-muted" aria-hidden />}
              </div>
              <p className="mt-1 text-sm text-muted">{l.items.length} · {formatDate(l.updatedAt, i18n.language)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={ListPlus} title={t('saved.lists')} body={t('saved.emptyBody')} />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={t('saved.newList')} size="sm">
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }} className="space-y-4">
          <div>
            <label className="label" htmlFor="list-name">{t('saved.listName')}</label>
            <input id="list-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="size-4 accent-forest-700" />{t('saved.public')}</label>
          <div className="flex justify-end"><Button type="submit" loading={create.isPending}>{t('common.submit')}</Button></div>
        </form>
      </Modal>
    </>
  );
}

function Trips() {
  const { t, i18n } = useTranslation();
  const q = useQuery({ queryKey: ['me', 'trips'], queryFn: endpoints.trips });
  if (q.isLoading) return <GridSkeleton count={3} />;
  if (!q.data?.length) return <EmptyState icon={Map} title={t('saved.noTrips')} body={t('trip.subtitle')} action={<Button to="/trip-builder" variant="accent">{t('home.buildTrip')}</Button>} />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {q.data.map((trip) => (
        <Link key={trip._id} to={`/trips/${trip._id}`} className="card p-5 transition hover:ring-forest-300">
          <h3 className="font-sans text-lg font-semibold">{trip.title}</h3>
          <p className="mt-1 text-sm text-muted">{trip.days?.length || 0} {t('trip.days').toLowerCase()} · {trip.summary?.totalDistanceKm ?? '—'} km</p>
          <div className="mt-3 flex gap-1.5">
            <Badge tone={trip.generator === 'ai' ? 'green' : 'amber'}>{trip.generator}</Badge>
            {trip.isPublic && <Badge tone="blue">{t('saved.public')}</Badge>}
            <Badge>{formatDate(trip.updatedAt, i18n.language)}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Recent() {
  const q = useQuery({ queryKey: ['me', 'recent'], queryFn: endpoints.recent });
  if (q.isLoading) return <GridSkeleton />;
  if (!q.data?.length) return <EmptyState icon={History} />;
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{q.data.map((r) => <AnyCard key={`${r.targetType}${r.targetId}`} type={r.targetType} item={r.item} />)}</div>;
}

export default function Saved() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [params, set] = useQueryParams();
  const tab = params.tab || 'places';
  const tabs = [
    ['places', t('saved.places'), Heart],
    ['lists', t('saved.lists'), ListPlus],
    ['trips', t('saved.trips'), Map],
    ['recent', t('saved.recent'), History],
  ];
  return (
    <div className="container-page py-8">
      <Seo title={t('saved.title')} noindex />
      <h1 className="text-3xl sm:text-4xl">{t('saved.title')}</h1>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map(([key, label, Icon]) => (
          <button key={key} role="tab" aria-selected={tab === key} type="button" onClick={() => set({ tab: key === 'places' ? '' : key })} className={cx('chip shrink-0', tab === key && 'chip-active')}>
            <Icon className="size-4" aria-hidden /> {label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'places' ? (
          <SavedItems />
        ) : !user ? (
          <EmptyState icon={Lock} title={t('saved.signInFor')} body={t('auth.guestNote')} action={<Button to={`/login?next=/saved?tab=${tab}`}>{t('nav.login')}</Button>} />
        ) : tab === 'lists' ? (
          <Lists />
        ) : tab === 'trips' ? (
          <Trips />
        ) : (
          <Recent />
        )}
      </div>
    </div>
  );
}
