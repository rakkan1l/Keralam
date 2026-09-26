import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Utensils } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero from '../components/detail/DetailHero';
import { Panel, ValueRow } from '../components/detail/Facts';
import SaveButton from '../components/SaveButton';
import { ShareButton, ReportButton } from '../components/detail/Actions';
import Badge from '../components/ui/Badge';
import Section from '../components/ui/Section';
import { BusinessCard } from '../components/cards/Cards';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState, EmptyState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { localized } from '../utils/format';

export default function DishDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dish', slug], queryFn: () => endpoints.dish(slug) });
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  const { dish, places } = data;
  const name = localized(dish, 'name', i18n.language);
  return (
    <article>
      <Seo title={name} description={dish.description} jsonLd={{ '@context': 'https://schema.org', '@type': 'Recipe', name: dish.name, description: dish.description, recipeCuisine: 'Kerala' }} />
      <DetailHero doc={dish} title={name} subtitle={dish.region} kind="dish" crumbs={[{ to: '/food', label: t('nav.food') }, { label: name }]} />
      <div className="container-page mt-6 flex flex-wrap gap-2">
        <SaveButton type="dish" doc={dish} variant="button" />
        <ShareButton title={name} />
      </div>
      <div className="container-page mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="card p-6">
          <h2 className="mb-2 text-xl">{t('place.about')}</h2>
          {i18n.language !== 'ml' && dish.nameMl && <p className="mb-2 text-lg text-forest-700">{dish.nameMl}</p>}
          <p className="leading-relaxed">{localized(dish, 'description', i18n.language)}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {dish.categories?.map((c) => <Badge key={c} tone="green">{t(`foodCategories.${c}`)}</Badge>)}
          </div>
        </section>
        <Panel title={t('food.title')} icon={Utensils}>
          <dl className="divide-y divide-sand-200">
            <ValueRow label={t('food.region')} value={dish.region} />
            <ValueRow label={t('food.dietary')} value={dish.dietary?.length ? dish.dietary.join(', ') : null} />
            <ValueRow label={t('food.typicalPrice')} value={dish.typicalPrice?.band && dish.typicalPrice.band !== 'unknown' ? `${t(`price.${dish.typicalPrice.band}`)}${dish.typicalPrice.estimated ? ` (${t('common.estimated')})` : ''}` : null} unknown={dish.typicalPrice?.note || t('common.notAvailable')} />
          </dl>
        </Panel>
      </div>
      <div className="container-page">
        <Section title={t('food.whereToTry')}>
          {places.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{places.map((b) => <BusinessCard key={b._id} business={b} />)}</div> : <EmptyState />}
        </Section>
        <ReportButton targetType="dish" target={dish} />
      </div>
    </article>
  );
}
