import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Seo from '../components/Seo';
import { AnyCard } from '../components/cards/Cards';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState, EmptyState } from '../components/ui/States';
import { endpoints } from '../services/api';

export default function SharedList() {
  const { slug } = useParams();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['shared-list', slug], queryFn: () => endpoints.sharedList(slug) });
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  return (
    <div className="container-page py-8">
      <Seo title={data.name} description={data.description} />
      <h1 className="text-3xl">{data.name}</h1>
      {data.owner && <p className="mt-1 text-sm text-muted">by {data.owner}</p>}
      {data.description && <p className="mt-2 max-w-2xl">{data.description}</p>}
      <div className="mt-6">
        {data.items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.items.map((i) => <AnyCard key={`${i.targetType}${i.targetId}`} type={i.targetType} item={i.item} />)}</div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
