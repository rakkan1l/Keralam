import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ticket, ThumbsUp, ExternalLink } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero from '../components/detail/DetailHero';
import { InfoBlock, KeyFacts, ValueRow, NoticeList } from '../components/detail/Facts';
import { ActionBar, DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import SaveButton from '../components/SaveButton';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import { EventCard, CARD_GRID } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { DetailFallback } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';
import { districtName, localized, formatDateRange, formatDate, inr } from '../utils/format';

export default function EventDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const toast = useToast();
  const [interest, setInterest] = useState(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['event', slug], queryFn: () => endpoints.event(slug) });
  if (isLoading || error) return <DetailFallback error={error} onRetry={refetch} ErrorComponent={ErrorState} />;
  const { event: e, notices, related, expired } = data;
  const title = localized(e, 'title', lang);
  const fee = e.entryFee || {};
  const district = districtName(e.district, lang);
  const markInterest = async () => {
    try {
      const res = await endpoints.eventInterest(e._id);
      setInterest(res.interestCount);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };
  const facts = [
    { label: t('events.when'), value: formatDateRange(e.startDate, e.endDate, lang) },
    { label: t('events.venue'), value: [e.venue, district].filter(Boolean).join(', ') },
    { label: t('common.entryFee'), value: fee.isFree ? t('common.free') : typeof fee.amount === 'number' ? inr(fee.amount) : null },
    { label: t('events.tickets'), value: t(`events.ticket.${e.ticketStatus || 'unknown'}`) },
  ];
  const details = [
    [t('events.organizer'), e.organizer],
    [t('events.ageRestriction'), e.ageRestriction],
    [t('events.parking'), e.parking],
    [t('events.publicTransport'), e.publicTransport],
    [t('events.language'), e.languages?.join(', ')],
  ].filter(([, v]) => v);
  return (
    <article>
      <Seo
        title={title}
        description={e.description}
        type="article"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'Event', name: e.title, description: e.description, startDate: e.startDate, endDate: e.endDate, eventStatus: 'https://schema.org/EventScheduled', location: { '@type': 'Place', name: e.venue || districtName(e.district), address: { '@type': 'PostalAddress', addressLocality: districtName(e.district), addressRegion: 'Kerala', addressCountry: 'IN' } }, ...(e.organizer ? { organizer: { '@type': 'Organization', name: e.organizer } } : {}) }}
      />
      <DetailHero size="md" doc={e} title={title} eyebrow={`${t(`eventCategories.${e.category}`)} · ${district}`} kind="event" crumbs={[{ to: '/events', label: t('nav.events') }, { label: title }]} />
      <ActionBar>
        {!expired && (
          <Button onClick={markInterest} disabled={interest != null}>
            <ThumbsUp className="size-4" aria-hidden /> {interest != null ? t('events.interestedCount', { count: interest }) : t('events.interested')}
          </Button>
        )}
        {e.ticketUrl && <Button variant="secondary" href={e.ticketUrl}><Ticket className="size-4" aria-hidden />{t('events.tickets')}</Button>}
        <SaveButton type="event" doc={e} variant="button" />
        <ShareButton title={title} />
        <DirectionsButton doc={e} variant="ghost" />
      </ActionBar>
      <div className="container-page">
        {expired && <p className="mt-8 rounded-2xl bg-sand-200 px-4 py-3 text-sm font-medium">{t('events.expired')}</p>}
        <div className="py-10"><KeyFacts items={facts} /></div>
        <div className="grid gap-12 pb-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="min-w-0 space-y-10">
            <InfoBlock title={t('place.about')}>
              {notices.length > 0 && <NoticeList notices={notices} />}
              <p className="text-[17px] leading-[1.75] whitespace-pre-line text-ink-soft">{localized(e, 'description', lang) || t('common.notAvailable')}</p>
              {e.place && <p className="mt-4 text-sm"><Link to={`/places/${e.place.slug}`} className="link">{e.place.name}</Link></p>}
            </InfoBlock>
            {details.length > 0 && (
              <InfoBlock title={t('events.details')}>
                <dl className="divide-y divide-line">{details.map(([l, v]) => <ValueRow key={l} label={l} value={v} />)}</dl>
              </InfoBlock>
            )}
            <InfoBlock title={t('events.officialSource')}>
              {e.officialSourceUrl ? <a href={e.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5"><ExternalLink className="size-4" aria-hidden />{e.officialSourceUrl}</a> : <p className="text-muted italic">{t('common.notAvailable')}</p>}
              <p className="caption mt-3">{t('events.lastVerified')}: {e.lastVerifiedAt ? formatDate(e.lastVerifiedAt, lang) : t('events.neverVerified')}</p>
            </InfoBlock>
            <div className="border-t border-line pt-6"><ReportButton targetType="event" target={e} /></div>
          </div>
          <aside className="lg:sticky lg:top-36 lg:self-start">{e.location && <LazyMap className="h-64" markers={[toMarker(e, 'event')].filter(Boolean)} />}</aside>
        </div>
        {related.length > 0 && (
          <Section title={t('home.eventsTitle')} to="/events" className="border-t border-line">
            <div className={CARD_GRID}>{related.slice(0, 3).map((r) => <EventCard key={r._id} event={r} />)}</div>
          </Section>
        )}
      </div>
    </article>
  );
}
