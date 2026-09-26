import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, FlaskConical, Save, RotateCcw } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Chips from '../components/ui/Chips';
import PointInput from '../components/PointInput';
import { DistrictSelect, Toggle } from '../components/FilterPanel';
import { EmptyState } from '../components/ui/States';
import TripItinerary, { toSavePayload } from '../features/trips/TripItinerary';
import Assistant from '../features/trips/Assistant';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';
import { cx } from '../utils/format';

const DRAFT_KEY = 'kt_trip_draft';
const INTERESTS = ['nature', 'food', 'culture', 'adventure', 'shopping', 'photography'];

const schema = z
  .object({
    startPoint: z.object({ lat: z.number(), lng: z.number(), label: z.string() }).nullable(),
    startDistrict: z.string().optional(),
    duration: z.enum(['few-hours', 'one-day', 'weekend', 'multi-day']),
    days: z.coerce.number().int().min(2).max(7),
    budget: z.enum(['budget', 'moderate', 'premium']),
    groupType: z.enum(['solo', 'couple', 'family', 'friends', 'group']),
    interests: z.array(z.string()),
    transport: z.enum(['car', 'bike', 'public', 'taxi']),
    pace: z.enum(['relaxed', 'balanced', 'packed']),
    withChildren: z.boolean(),
    withElderly: z.boolean(),
    accessibilityNeeds: z.array(z.string()),
    respectOpeningHours: z.boolean(),
    startDate: z.string().optional(),
  })
  .refine((v) => v.startPoint || v.startDistrict, { message: 'Choose a starting point or district', path: ['startDistrict'] });

function Segmented({ options, value, onChange, labelFor, name }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)} className={cx('chip', value === o && 'chip-active')}>
          {labelFor(o)}
        </button>
      ))}
    </div>
  );
}

function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
}

export default function TripBuilder() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [trip, setTrip] = useState(() => loadDraft());
  const { data: ai } = useQuery({ queryKey: ['ai-status'], queryFn: endpoints.aiStatus, staleTime: 600_000 });

  // The generated plan survives language switches and page reloads within the session.
  useEffect(() => {
    try {
      if (trip) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(trip));
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }, [trip]);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      startPoint: null,
      startDistrict: search.get('district') || '',
      duration: 'one-day',
      days: 3,
      budget: 'moderate',
      groupType: 'couple',
      interests: ['nature', 'food'],
      transport: 'car',
      pace: 'balanced',
      withChildren: false,
      withElderly: false,
      accessibilityNeeds: [],
      respectOpeningHours: true,
      startDate: '',
    },
  });
  const duration = watch('duration');

  const generate = useMutation({
    mutationFn: (v) =>
      endpoints.generateTrip({
        start: v.startPoint ? { label: v.startPoint.label, coordinates: [v.startPoint.lng, v.startPoint.lat] } : { district: v.startDistrict },
        duration: v.duration,
        days: v.duration === 'multi-day' ? v.days : undefined,
        budget: v.budget,
        groupType: v.groupType,
        interests: v.interests,
        transport: v.transport,
        pace: v.pace,
        withChildren: v.withChildren,
        withElderly: v.withElderly,
        accessibilityNeeds: v.accessibilityNeeds,
        respectOpeningHours: v.respectOpeningHours,
        startDate: v.startDate || undefined,
      }),
    onSuccess: (data) => {
      setTrip(data);
      requestAnimationFrame(() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' }));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const save = useMutation({
    mutationFn: () => endpoints.saveTrip(toSavePayload(trip)),
    onSuccess: (saved) => {
      toast.success(t('trip.savedTrip'));
      setTrip(null);
      navigate(`/trips/${saved._id}`);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const aiOn = ai?.configured;
  return (
    <div className="container-page py-8">
      <Seo title={t('trip.title')} description={t('trip.subtitle')} />
      <header className="max-w-3xl">
        <h1 className="flex items-center gap-3 text-3xl sm:text-4xl"><Sparkles className="size-8 text-laterite-500" aria-hidden />{t('trip.title')}</h1>
        <p className="mt-2 text-muted">{t('trip.subtitle')}</p>
        <div className={cx('mt-4 flex gap-3 rounded-2xl p-4 text-sm ring-1', aiOn ? 'bg-forest-50 ring-forest-200' : 'bg-turmeric-100/60 ring-turmeric-400/30')}>
          {aiOn ? <Sparkles className="size-5 shrink-0 text-forest-700" aria-hidden /> : <FlaskConical className="size-5 shrink-0 text-turmeric-600" aria-hidden />}
          <div>
            <p className="font-semibold">{aiOn ? t('trip.aiMode') : t('trip.demoMode')}</p>
            <p className="text-forest-900">{aiOn ? t('trip.aiModeBody') : t('trip.demoModeBody')}</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit((v) => generate.mutate(v))} className="card mt-6 grid gap-6 p-5 sm:p-7 lg:grid-cols-2" noValidate>
        <div className="space-y-5">
          <Controller name="startPoint" control={control} render={({ field }) => <PointInput id="trip-start" label={t('trip.start')} value={field.value} onChange={field.onChange} allowGps />} />
          <Controller
            name="startDistrict"
            control={control}
            render={({ field }) => (
              <div>
                <label className="label" htmlFor="trip-district">{t('common.district')}</label>
                <DistrictSelect id="trip-district" value={field.value} onChange={field.onChange} />
                {errors.startDistrict && <p role="alert" className="mt-1 text-xs text-laterite-700">{errors.startDistrict.message}</p>}
              </div>
            )}
          />
          <div>
            <span className="label">{t('trip.duration')}</span>
            <Controller name="duration" control={control} render={({ field }) => <Segmented name={t('trip.duration')} options={['few-hours', 'one-day', 'weekend', 'multi-day']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.durations.${o}`)} />} />
          </div>
          {duration === 'multi-day' && (
            <Controller
              name="days"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="label" htmlFor="trip-days">{t('trip.days')}</label>
                  <input id="trip-days" type="number" min={2} max={7} className="input w-28" {...field} />
                </div>
              )}
            />
          )}
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <div>
                <label className="label" htmlFor="trip-date">{t('trip.startDate')}</label>
                <input id="trip-date" type="date" className="input w-48" {...field} />
              </div>
            )}
          />
          <div>
            <span className="label">{t('trip.interests')}</span>
            <Controller name="interests" control={control} render={({ field }) => <Chips options={INTERESTS} value={field.value} multiple onChange={field.onChange} labelFor={(o) => t(`trip.interestList.${o}`)} ariaLabel={t('trip.interests')} />} />
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <span className="label">{t('trip.budget')}</span>
            <Controller name="budget" control={control} render={({ field }) => <Segmented name={t('trip.budget')} options={['budget', 'moderate', 'premium']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.budgets.${o}`)} />} />
          </div>
          <div>
            <span className="label">{t('trip.group')}</span>
            <Controller name="groupType" control={control} render={({ field }) => <Segmented name={t('trip.group')} options={['solo', 'couple', 'family', 'friends', 'group']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.groups.${o}`)} />} />
          </div>
          <div>
            <span className="label">{t('trip.transport')}</span>
            <Controller name="transport" control={control} render={({ field }) => <Segmented name={t('trip.transport')} options={['car', 'bike', 'public', 'taxi']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.transports.${o}`)} />} />
          </div>
          <div>
            <span className="label">{t('trip.pace')}</span>
            <Controller name="pace" control={control} render={({ field }) => <Segmented name={t('trip.pace')} options={['relaxed', 'balanced', 'packed']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.paces.${o}`)} />} />
          </div>
          <div>
            <span className="label">{t('trip.accessibility')}</span>
            <Controller name="accessibilityNeeds" control={control} render={({ field }) => <Chips options={['wheelchair', 'minimal-walking', 'stroller']} value={field.value} multiple onChange={field.onChange} labelFor={(o) => t(`trip.needs.${o}`)} ariaLabel={t('trip.accessibility')} />} />
          </div>
          <div className="space-y-1">
            <Controller name="withChildren" control={control} render={({ field }) => <Toggle label={t('trip.withChildren')} checked={field.value} onChange={field.onChange} />} />
            <Controller name="withElderly" control={control} render={({ field }) => <Toggle label={t('trip.withElderly')} checked={field.value} onChange={field.onChange} />} />
            <Controller name="respectOpeningHours" control={control} render={({ field }) => <Toggle label={t('trip.respectHours')} checked={field.value} onChange={field.onChange} />} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <Button type="submit" size="lg" variant="accent" loading={generate.isPending}>
            <Sparkles className="size-5" aria-hidden /> {generate.isPending ? t('trip.generating') : t('trip.generate')}
          </Button>
        </div>
      </form>

      {trip && (
        <section id="itinerary" className="mt-10 scroll-mt-20">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label htmlFor="trip-title" className="sr-only">Title</label>
              <input id="trip-title" value={trip.title} onChange={(e) => setTrip({ ...trip, title: e.target.value })} className="w-full bg-transparent font-display text-2xl text-forest-950 focus:outline-none sm:text-3xl" />
              {trip.notice && <p className="mt-1 text-sm text-muted">{trip.notice}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setTrip(null)}><RotateCcw className="size-4" aria-hidden />{t('trip.regenerate')}</Button>
              {user ? (
                <Button onClick={() => save.mutate()} loading={save.isPending} disabled={!trip.days?.length}><Save className="size-4" aria-hidden />{t('trip.saveTrip')}</Button>
              ) : (
                <Button to="/login?next=/trip-builder"><Save className="size-4" aria-hidden />{t('trip.saveTrip')}</Button>
              )}
            </div>
          </div>
          {trip.days?.length ? <TripItinerary trip={trip} onChange={setTrip} /> : <EmptyState title={t('trip.empty')} body={trip.summary?.warnings?.[0]} />}
        </section>
      )}

      <div className="mt-10">
        <Assistant />
      </div>
    </div>
  );
}
