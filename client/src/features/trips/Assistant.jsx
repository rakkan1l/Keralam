import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useUserLocation } from '../../context/LocationContext';
import { endpoints, errorMessage } from '../../services/api';
import { districtName } from '../../utils/format';

const CONF = { verified: 'green', estimated: 'amber', unavailable: 'neutral' };

/** Travel assistant panel. Answers come from database retrieval; AI phrasing only when configured. */
export default function Assistant() {
  const { t, i18n } = useTranslation();
  const { position } = useUserLocation();
  const [question, setQuestion] = useState('');
  const ask = useMutation({
    mutationFn: () => endpoints.ask({ question, context: position ? { coordinates: [position.lng, position.lat] } : undefined }),
  });
  const res = ask.data;
  return (
    <section className="panel" aria-labelledby="assistant-title">
      <h2 id="assistant-title" className="h2 flex items-center gap-2.5"><MessageCircle className="size-5 text-forest-600" aria-hidden />{t('trip.assistant')}</h2>
      <p className="mt-1 text-sm text-muted">{t('trip.assistantPreview')}</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim().length >= 3) ask.mutate();
        }}
      >
        <label htmlFor="ask" className="sr-only">{t('trip.ask')}</label>
        <input id="ask" className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('trip.askPlaceholder')} maxLength={1000} />
        <Button type="submit" loading={ask.isPending} aria-label={t('trip.ask')}><Send className="size-4" aria-hidden /></Button>
      </form>
      {ask.error && <p role="alert" className="mt-3 text-sm text-laterite-700">{errorMessage(ask.error)}</p>}
      {res && (
        <div className="mt-4 space-y-3" aria-live="polite">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={res.mode === 'ai' ? 'green' : 'amber'}>{res.mode === 'ai' ? t('trip.aiMode') : t('trip.demoMode')}</Badge>
            {res.interpretation?.map((i) => <Badge key={`${i.type}${i.label}`} tone="blue">{i.label}</Badge>)}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed">{res.answer}</p>
          {res.missingInformation?.length > 0 && <p className="text-xs text-muted">{t('common.notAvailable')}: {res.missingInformation.join('; ')}</p>}
          <ul className="divide-y divide-line border-y border-line">
            {res.sources.places.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  <Link to={`/places/${p.slug}`} className="font-medium text-forest-800 hover:underline">{p.name}</Link>
                  <span className="text-muted"> · {districtName(p.district, i18n.language)}{p.distanceKmFromStart ? ` · ${p.distanceKmFromStart} km` : ''}</span>
                </span>
                <span className="flex gap-1">
                  <Badge tone={CONF[p.openingHours.confidence]}>{t('common.openingHours')}: {t(`trip.confidence.${p.openingHours.confidence}`)}</Badge>
                  <Badge tone={CONF[p.entryFee.confidence]}>{t('common.entryFee')}: {p.entryFee.value != null ? `₹${p.entryFee.value}` : t(`trip.confidence.${p.entryFee.confidence}`)}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
