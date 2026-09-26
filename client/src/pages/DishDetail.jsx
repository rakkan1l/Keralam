import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import DetailHero from '../components/detail/DetailHero';
import { InfoBlock, KeyFacts } from '../components/detail/Facts';
import { ActionBar, ShareButton, ReportButton } from '../components/detail/Actions';
import SaveButton from '../components/SaveButton';
import Section from '../components/ui/Section';
import { BusinessCard, CARD_GRID } from '../components/cards/Cards';
import { DetailFallback } from '../components/ui/PageLoader';
import { ErrorState, EmptyState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { localized } from '../utils/format';

export default function DishDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dish', slug], queryFn: () => endpoints.dish(slug) });
  if (isLoading || error) return <DetailFallback error={error} onRetry={refetch} ErrorComponent={ErrorState} />;
  const { dish, places } = data;
  const name = localized(dish, 'name', i18n.language);
  const price = dish.typicalPrice?.band && dish.typicalPrice.band !== 'unknown' ? t(`price.${dish.typicalPrice.band}`) : null;
  return (
    <article>
      <Seo title={name} description={dish.description} jsonLd={{ '@context': 'https://schema.org', '@type': 'Recipe', name: dish.name, description: dish.description, recipeCuisine: 'Kerala' }} />
      <DetailHero size="md" doc={dish} title={name} eyebrow={[dish.region, i18n.language !== 'ml' && dish.nameMl].filter(Boolean).join(' · ')} kind="dish" crumbs={[{ to: '/food', label: t('nav.food') }, { label: name }]} />
      <ActionBar>
        <SaveButton type="dish" doc={dish} variant="button" />
        <ShareButton title={name} />
      </ActionBar>
      <div className="container-page">
        <div className="py-10">
          <KeyFacts
            items={[
              { label: t('food.region'), value: dish.region },
              { label: t('food.dietary'), value: dish.dietary?.join(', ') || null },
              { label: t('food.typicalPrice'), value: price, hint: dish.typicalPrice?.note },
              { label: t('common.category'), value: dish.categories?.map((c) => t(`foodCategories.${c}`)).slice(0, 2).join(', ') || null },
            ]}
          />
        </div>
        <div className="max-w-3xl pb-6">
          <InfoBlock title={t('place.about')}>
            <p className="text-[17px] leading-[1.75] text-ink-soft">{localized(dish, 'description', i18n.language)}</p>
          </InfoBlock>
        </div>
        <Section title={t('food.whereToTry')} className="border-t border-line">
          {places.length ? <div className={CARD_GRID}>{places.slice(0, 6).map((b) => <BusinessCard key={b._id} business={b} />)}</div> : <EmptyState />}
        </Section>
        <div className="pb-12"><ReportButton targetType="dish" target={dish} /></div>
      </div>
    </article>
  );
}
