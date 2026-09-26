import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Ticket, ThumbsUp, ExternalLink, Info } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero from '../components/detail/DetailHero';
import { Panel, ValueRow, NoticeList } from '../components/detail/Facts';
import { DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import SaveButton from '../components/SaveButton';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import { EventCard } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { PageLoader } from '../components/ui/PageLoader';
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
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  const { event: e, notices, related, expired } = data;
  const title = localized(e, 'title', lang);
  const fee = e.entryFee || {};
  const markInterest = async () => {
    try {
      const res = await endpoints.eventInterest(e._id);
      setInterest(res.interestCount);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: e.venue || districtName(e.district), address: { '@type': 'PostalAddress', addressLocality: districtName(e.district), addressRegion: 'Kerala', addressCountry: 'IN' } },
    ...(e.organizer ? { organizer: { '@type': 'Organization', name: e.organizer } } : {}),
  };
  return (
    <article>
      <Seo title={title} description={e.description} jsonLd={jsonLd} type="article" />
      <DetailHero doc={e} title={title} subtitle={`${e.venue ? `${e.venue}, ` : ''}${districtName(e.district, lang)}`} kind="event" crumbs={[{ to: '/events', label: t('nav.events') }, { label: title }]} meta={<Badge tone="light">{t(`eventCategories.${e.category}`)}</Badge>} />
      {expired && <div className="container-page mt-4"><p className="rounded-2xl bg-sand-200 p-3 text-sm font-medium">{t('events.expired')}</p></div>}
      <div className="container-page mt-6 flex flex-wrap gap-2">
        {!expired && (
          <Button variant="accent" onClick={markInterest} disabled={interest != null}>
            <ThumbsUp className="size-4" aria-hidden /> {interest != null ? t('events.interestedCount', { count: interest }) : t('events.interested')}
          </Button>
        )}
        <DirectionsButton doc={e} variant="secondary" />
        <SaveButton type="event" doc={e} variant="button" />
        <ShareButton title={title} />
      </div>
      <div className="container-page mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-2 text-xl">{t('place.about')}</h2>
            <p className="whitespace-pre-line leading-relaxed">{localized(e, 'description', lang) || t('common.notAvailable')}</p>
            {e.place && <p className="mt-3 text-sm"><Link to={`/places/${e.place.slug}`} className="font-medium text-forest-700 hover:underline">{e.place.name}</Link></p>}
            {notices.length > 0 && <div className="mt-4"><NoticeList notices={notices} /></div>}
          </section>
          <ReportButton targetType="event" target={e} />
        </div>
        <aside className="space-y-6">
          <Panel title={formatDateRange(e.startDate, e.endDate, lang)} icon={CalendarDays} footer={
            <span className="inline-flex items-center gap-1"><Info className="size-3.5" aria-hidden />{t('events.lastVerified')}: {e.lastVerifiedAt ? formatDate(e.lastVerifiedAt, lang) : t('events.neverVerified')}</span>
          }>
            <dl className="divide-y divide-sand-200">
              <ValueRow label={t('events.organizer')} value={e.organizer} />
              <ValueRow label={t('events.venue')} value={e.venue} />
              <ValueRow label={t('common.entryFee')} value={fee.isFree ? t('common.free') : typeof fee.amount === 'number' ? inr(fee.amount) : null} unknown={fee.notes || t('common.notAvailable')} />
              <ValueRow label={t('events.tickets')} value={t(`events.ticket.${e.ticketStatus || 'unknown'}`)} />
              <ValueRow label={t('events.ageRestriction')} value={e.ageRestriction} />
              <ValueRow label={t('events.parking')} value={e.parking} />
              <ValueRow label={t('events.publicTransport')} value={e.publicTransport} />
              <ValueRow label={t('events.language')} value={e.languages?.join(', ')} />
            </dl>
            <div className="mt-3 flex flex-col gap-2">
              {e.ticketUrl && <Button href={e.ticketUrl} size="sm"><Ticket className="size-4" aria-hidden />{t('events.tickets')}</Button>}
              {e.officialSourceUrl ? (
                <a href={e.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline"><ExternalLink className="size-4" aria-hidden />{t('events.officialSource')}</a>
              ) : (
                <p className="text-xs italic text-muted">{t('events.officialSource')}: {t('common.notAvailable')}</p>
              )}
            </div>
          </Panel>
          {e.location && <LazyMap className="h-64" markers={[toMarker(e, 'event')].filter(Boolean)} />}
        </aside>
      </div>
      {related.length > 0 && (
        <div className="container-page">
          <Section title={t('home.eventsThisWeek')} to="/events">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <EventCard key={r._id} event={r} />)}</div>
          </Section>
        </div>
      )}
    </article>
  );
}
