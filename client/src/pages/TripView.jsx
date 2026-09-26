import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Save, Share2, Trash2, Link2Off } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import TripItinerary, { toSavePayload } from '../features/trips/TripItinerary';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';

export default function TripView() {
  const { id } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['me', 'trip', id], queryFn: () => endpoints.trip(id) });
  const [trip, setTrip] = useState(null);
  useEffect(() => setTrip(data || null), [data]);

  const save = useMutation({
    mutationFn: () => endpoints.updateTrip(id, toSavePayload(trip)),
    onSuccess: (updated) => {
      qc.setQueryData(['me', 'trip', id], updated);
      toast.success(t('account.updated'));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const share = useMutation({
    mutationFn: (isPublic) => endpoints.shareTrip(id, isPublic),
    onSuccess: async (res) => {
      qc.setQueryData(['me', 'trip', id], (old) => ({ ...old, ...res }));
      if (res.isPublic) {
        const url = `${window.location.origin}/trips/shared/${res.shareSlug}`;
        try {
          await navigator.clipboard.writeText(url);
          toast.success(t('common.copied'));
        } catch {
          toast.info(url);
        }
      }
    },
  });
  const remove = useMutation({
    mutationFn: () => endpoints.deleteTrip(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me', 'trips'] });
      navigate('/saved?tab=trips');
    },
  });

  if (isLoading || (!trip && !error)) return <PageLoader />;
  if (error) return <div className="container-page py-16"><ErrorState error={error} onRetry={refetch} /></div>;
  const dirty = JSON.stringify(toSavePayload(trip)) !== JSON.stringify(toSavePayload(data));
  return (
    <div className="container-page pb-16">
      <Seo title={trip.title} noindex />
      <div className="flex flex-col gap-5 pt-10 pb-8 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
        <div>
          <label htmlFor="title" className="sr-only">Title</label>
          <input id="title" value={trip.title} onChange={(e) => setTrip({ ...trip, title: e.target.value })} className="h1 w-full bg-transparent focus:outline-none" />
          <div className="mt-1 flex gap-2">
            <Badge tone={trip.generator === 'ai' ? 'green' : 'amber'}>{trip.generator === 'ai' ? t('trip.aiMode') : t('trip.demoMode')}</Badge>
            {data.isPublic && <Badge tone="blue">{t('saved.public')}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => save.mutate()} disabled={!dirty} loading={save.isPending}><Save className="size-4" aria-hidden />{t('account.saveChanges')}</Button>
          <Button variant="secondary" onClick={() => share.mutate(true)} loading={share.isPending}><Share2 className="size-4" aria-hidden />{t('trip.shareTrip')}</Button>
          {data.isPublic && <Button variant="ghost" onClick={() => share.mutate(false)} aria-label={t('trip.stopSharing')} title={t('trip.stopSharing')}><Link2Off className="size-4" aria-hidden /></Button>}
          <Button variant="ghost" onClick={() => window.confirm(t('trip.confirmDelete')) && remove.mutate()} aria-label={t('trip.deleteTrip')}><Trash2 className="size-4 text-laterite-600" aria-hidden /></Button>
        </div>
      </div>
      <TripItinerary trip={trip} onChange={setTrip} />
    </div>
  );
}
