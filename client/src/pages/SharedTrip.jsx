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
    <div className="container-page pb-16">
      <Seo title={trip.title} description={`${trip.days.length}-day Kerala itinerary`} />
      <div className="flex flex-col gap-5 pt-10 pb-8 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
        <div>
          <h1 className="h1">{trip.title}</h1>
          <Badge className="mt-1" tone={trip.generator === 'ai' ? 'green' : 'amber'}>{trip.generator === 'ai' ? t('trip.aiMode') : t('trip.demoMode')}</Badge>
        </div>
        <Button to="/trip-builder">{t('home.planCta')}</Button>
      </div>
      <TripItinerary trip={trip} />
    </div>
  );
}
