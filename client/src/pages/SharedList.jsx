import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import { AnyCard } from '../components/cards/Cards';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState, EmptyState } from '../components/ui/States';
import { endpoints } from '../services/api';

export default function SharedList() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['shared-list', slug], queryFn: () => endpoints.sharedList(slug) });
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-16"><ErrorState error={error} onRetry={refetch} /></div>;
  return (
    <div className="container-page pb-20">
      <Seo title={data.name} description={data.description} />
      <h1 className="h1 pt-10 sm:pt-14">{data.name}</h1>
      {data.owner && <p className="mt-2 text-sm text-muted">{t('saved.by', { name: data.owner })}</p>}
      {data.description && <p className="mt-2 max-w-2xl">{data.description}</p>}
      <div className="mt-6">
        {data.items.length ? (
          <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((i) => <AnyCard key={`${i.targetType}${i.targetId}`} type={i.targetType} item={i.item} />)}</div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
