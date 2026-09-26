import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Phone, Siren, Hospital, Pill, ShieldAlert, Share2, MessageCircle, BadgeCheck, CircleHelp, LifeBuoy, Users } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { NoticeList } from '../components/detail/Facts';
import { ErrorState } from '../components/ui/States';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { endpoints } from '../services/api';
import { formatDate } from '../utils/format';
import en from '../i18n/locales/en.json';

function ShareLocation() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { request, status } = useUserLocation();
  const toast = useToast();
  const [link, setLink] = useState(null);
  const profile = useQuery({ queryKey: ['me', 'profile'], queryFn: endpoints.profile, enabled: Boolean(user) });
  const contacts = profile.data?.trustedContacts || [];

  const locate = async () => {
    try {
      const p = await request();
      const url = `https://www.google.com/maps?q=${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
      setLink(url);
      return url;
    } catch {
      toast.error(t('nearby.denied'));
      return null;
    }
  };
  const message = (url) => `My current location: ${url}`;
  const shareNative = async () => {
    const url = link || (await locate());
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: t('help.shareLocation'), text: message(url) });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(message(url));
      toast.success(t('common.copied'));
    } catch {
      toast.info(url);
    }
  };

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-xl"><Share2 className="size-5 text-forest-600" aria-hidden />{t('help.shareLocation')}</h2>
      <p className="mt-1 text-sm text-muted">{t('help.shareLocationBody')}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={shareNative} loading={status === 'locating'}><Share2 className="size-4" aria-hidden />{t('help.shareVia')}</Button>
        {link && <a href={`https://wa.me/?text=${encodeURIComponent(message(link))}`} target="_blank" rel="noopener noreferrer" className="chip"><MessageCircle className="size-4" aria-hidden />WhatsApp</a>}
        {link && <a href={`sms:?&body=${encodeURIComponent(message(link))}`} className="chip">SMS</a>}
      </div>
      {link && <p className="mt-3 break-all text-xs text-muted">{link}</p>}
      <div className="mt-5 border-t border-sand-200 pt-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Users className="size-4" aria-hidden />{t('help.trustedContacts')}</h3>
        {contacts.length ? (
          <ul className="space-y-2">
            {contacts.map((c) => (
              <li key={c.phone} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{c.name} · {c.phone}</span>
                <span className="flex gap-2">
                  <a className="chip py-1 text-xs" href={`tel:${c.phone}`}><Phone className="size-3.5" aria-hidden /></a>
                  <button type="button" className="chip py-1 text-xs" onClick={async () => { const url = link || (await locate()); if (url) window.location.href = `sms:${c.phone}?&body=${encodeURIComponent(message(url))}`; }}>SMS</button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{user ? <Link to="/account" className="underline">{t('help.noContacts')}</Link> : t('help.noContacts')}</p>
        )}
      </div>
    </section>
  );
}

export default function Help() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['emergency'], queryFn: () => endpoints.emergency() });
  const contacts = data?.contacts || [];
  const primary = contacts.find((c) => c.category === 'general');
  const tips = t('help.tipsList', { returnObjects: true });

  return (
    <div className="container-page py-8">
      <Seo title={t('help.title')} description={t('home.touristHelpSub')} />
      <h1 className="flex items-center gap-3 text-3xl sm:text-4xl"><LifeBuoy className="size-8 text-laterite-500" aria-hidden />{t('help.title')}</h1>
      <p className="mt-2 text-muted">{t('help.subtitle')}</p>

      {primary && (
        <a href={`tel:${primary.number}`} className="mt-6 flex items-center justify-between gap-4 rounded-[1.75rem] bg-laterite-600 p-6 text-white shadow-[var(--shadow-lift)] transition hover:bg-laterite-700">
          <span>
            <span className="flex items-center gap-2 text-sm font-medium text-laterite-100"><Siren className="size-5" aria-hidden />{t('help.emergencyLine')}</span>
            <span className="mt-1 block font-display text-5xl">{primary.number}</span>
            <span className="text-sm text-laterite-100">{primary.name}</span>
          </span>
          <span className="grid size-16 place-items-center rounded-full bg-white/15"><Phone className="size-7" aria-hidden /></span>
        </a>
      )}
      {primary && !primary.verified && <p className="mt-2 text-xs text-muted">{t('help.pendingVerificationBody')}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['hospitals', Hospital, t('help.hospitals')],
          ['pharmacies', Pill, t('help.pharmacies')],
          ['police', ShieldAlert, t('help.police')],
        ].map(([cat, Icon, label]) => (
          <Link key={cat} to={`/near-me?category=${cat}`} className="card flex items-center gap-3 p-4 transition hover:ring-forest-300">
            <span className="grid size-11 place-items-center rounded-full bg-forest-50 text-forest-700"><Icon className="size-5" aria-hidden /></span>
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="text-xl">{t('help.numbers')}</h2>
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : isLoading ? (
            <div className="mt-4 space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <ul className="mt-3 divide-y divide-sand-200">
              {contacts.map((c) => (
                <li key={c._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{lang === 'ml' && c.nameMl && c.mlReviewed ? c.nameMl : c.name}</p>
                    {c.description && <p className="text-xs text-muted">{c.description}</p>}
                    <div className="mt-1">
                      {c.verified ? (
                        <Badge tone="green" icon={BadgeCheck}>
                          {t('common.verified')}
                          {c.verifiedAt ? ` · ${formatDate(c.verifiedAt, lang)}` : ''}
                        </Badge>
                      ) : (
                        <Badge icon={CircleHelp} title={t('help.pendingVerificationBody')}>{t('help.pendingVerification')}</Badge>
                      )}
                      {c.sourceUrl && <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-forest-700 underline">{t('common.source')}</a>}
                    </div>
                  </div>
                  <a href={`tel:${c.number}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700">
                    <Phone className="size-4" aria-hidden /> {c.number}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <ShareLocation />
          <section className="card p-5 sm:p-6">
            <h2 className="text-xl">{t('help.notices')}</h2>
            <div className="mt-3">{data?.notices?.length ? <NoticeList notices={data.notices} /> : <p className="text-sm text-muted">{t('help.noNotices')}</p>}</div>
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="text-xl">{t('help.tips')}</h2>
            {lang !== 'en' && <p className="mt-1 text-xs text-muted">{t('help.mlReviewNote')}</p>}
            {/* Safety guidance is shown in reviewed English until a human-reviewed translation exists. */}
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{(Array.isArray(tips) ? tips : en.help.tipsList).map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </section>
        </div>
      </div>
    </div>
  );
}
