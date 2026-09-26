import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Trash2, Share2, Plus } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { AnyCard } from '../components/cards/Cards';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState, EmptyState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';

export default function ListDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const { data: list, isLoading, error, refetch } = useQuery({ queryKey: ['me', 'list', id], queryFn: () => endpoints.list(id) });
  const saved = useQuery({ queryKey: ['me', 'saved'], queryFn: endpoints.saved, enabled: adding });
  const refresh = () => qc.invalidateQueries({ queryKey: ['me', 'list', id] });

  const add = useMutation({ mutationFn: (s) => endpoints.addListItem(id, { targetType: s.targetType, targetId: String(s.targetId) }), onSuccess: refresh, onError: (e) => toast.error(errorMessage(e)) });
  const removeItem = useMutation({ mutationFn: (s) => endpoints.removeListItem(id, s.targetType, s.targetId), onSuccess: refresh });
  const togglePublic = useMutation({
    mutationFn: () => endpoints.updateList(id, { name: list.name, isPublic: !list.isPublic }),
    onSuccess: async (l) => {
      refresh();
      if (l.isPublic) {
        const url = `${window.location.origin}/lists/shared/${l.shareSlug}`;
        try {
          await navigator.clipboard.writeText(url);
          toast.success(t('common.copied'));
        } catch {
          toast.info(url);
        }
      }
    },
  });
  const del = useMutation({ mutationFn: () => endpoints.deleteList(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['me', 'lists'] }); navigate('/saved?tab=lists'); } });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  const inList = new Set(list.items.map((i) => `${i.targetType}:${i.targetId}`));
  return (
    <div className="container-page py-8">
      <Seo title={list.name} noindex />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{list.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden />{t('saved.addToList')}</Button>
          <Button variant="secondary" onClick={() => togglePublic.mutate()}><Share2 className="size-4" aria-hidden />{list.isPublic ? t('common.copyLink') : t('common.share')}</Button>
          <Button variant="ghost" onClick={() => window.confirm('Delete this list?') && del.mutate()} aria-label="Delete list"><Trash2 className="size-4 text-laterite-600" /></Button>
        </div>
      </div>
      {list.items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.items.map((i) => (
            <div key={`${i.targetType}${i.targetId}`} className="relative">
              <AnyCard type={i.targetType} item={i.item} />
              <button type="button" onClick={() => removeItem.mutate(i)} className="absolute bottom-3 right-3 z-10 rounded-full bg-white p-2 shadow ring-1 ring-sand-300" aria-label={t('trip.remove')}>
                <Trash2 className="size-4 text-laterite-600" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState body={t('saved.emptyBody')} />
      )}
      <Modal open={adding} onClose={() => setAdding(false)} title={t('saved.addToList')}>
        {saved.isLoading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : saved.data?.length ? (
          <ul className="divide-y divide-sand-200">
            {saved.data.map((s) => (
              <li key={`${s.targetType}${s.targetId}`} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm">{s.item.name || s.item.title}</span>
                <Button size="sm" variant="secondary" disabled={inList.has(`${s.targetType}:${s.targetId}`)} onClick={() => add.mutate(s)}>
                  {inList.has(`${s.targetType}:${s.targetId}`) ? '✓' : <Plus className="size-4" aria-label={t('saved.addToList')} />}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t('saved.emptyBody')}</p>
        )}
      </Modal>
    </div>
  );
}
