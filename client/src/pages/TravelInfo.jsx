import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plane, TrainFront, Bus, TramFront, Ship, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PageIntro } from '../components/ui/Section';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { districtName } from '../utils/format';

const GROUPS = [
  ['airport', Plane],
  ['railway-station', TrainFront],
  ['metro-station', TramFront],
  ['bus-stand', Bus],
  ['boat-jetty', Ship],
];

export default function TravelInfo() {
  const { t, i18n } = useTranslation();
  const { data = [], isLoading, error, refetch } = useQuery({ queryKey: ['transport', 'all'], queryFn: () => endpoints.transport({}) });
  return (
    <div className="container-page pb-20">
      <Seo title={t('pages.travelInfoTitle')} description={t('pages.travelInfoSub')} />
      <PageIntro eyebrow={t('nav.travelInfo')} title={t('pages.travelInfoTitle')} subtitle={t('pages.travelInfoSub')} />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {GROUPS.map(([kind, Icon]) => {
            const nodes = data.filter((n) => n.kind === kind);
            if (!nodes.length) return null;
            return (
              <section key={kind} className="border-t border-line pt-6">
                <h2 className="h3 mb-3 flex items-center gap-2 text-lg"><Icon className="size-5 text-forest-600" aria-hidden />{t(`travelInfo.kinds.${kind}`)}</h2>
                <ul className="divide-y divide-line">
                  {nodes.map((n) => (
                    <li key={n._id} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                      <span>
                        {n.name}
                        {n.code && <span className="text-muted"> · {n.code}</span>}
                        <span className="block text-[13px] text-muted">{districtName(n.district, i18n.language)}</span>
                      </span>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${n.location.coordinates[1]},${n.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="link inline-flex shrink-0 items-center gap-1 text-sm">
                        {t('common.directions')} <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          <section className="border-t border-line pt-6 md:col-span-2">
            <h2 className="h3 mb-3 text-lg">{t('travelInfo.notesTitle')}</h2>
            <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] text-ink-soft">
              <li>{t('travelInfo.note1')}</li>
              <li>{t('travelInfo.note2')}</li>
              <li>{t('travelInfo.note3')} <Link to="/help" className="link">{t('nav.emergencyAssistance')}</Link>.</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
