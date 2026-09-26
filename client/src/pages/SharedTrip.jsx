import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import TripItinerary from '../features/trips/TripItinerary';
import { endpoints } from '../services/api';

export default function SharedTrip() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { data: trip, isLoading, error, refetch } = useQuery({ queryKey: ['shared-trip', slug], queryFn: () => endpoints.sharedTrip(slug) });
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  return (
    <div className="container-page py-8">
      <Seo title={trip.title} description={`${trip.days.length}-day Kerala itinerary`} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">{trip.title}</h1>
          <Badge className="mt-1" tone={trip.generator === 'ai' ? 'green' : 'amber'}>{trip.generator === 'ai' ? t('trip.aiMode') : t('trip.demoMode')}</Badge>
        </div>
        <Button to="/trip-builder" variant="accent">{t('home.buildTrip')}</Button>
      </div>
      <TripItinerary trip={trip} />
    </div>
  );
}
