import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, FlaskConical, Save, ArrowLeft, ArrowRight, SlidersHorizontal, Check } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Chips from '../components/ui/Chips';
import PointInput from '../components/PointInput';
import { PageIntro } from '../components/ui/Section';
import { DistrictSelect, Toggle } from '../components/FilterPanel';
import { EmptyState } from '../components/ui/States';
import TripItinerary, { toSavePayload } from '../features/trips/TripItinerary';
import Assistant from '../features/trips/Assistant';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';
import { cx, districtName } from '../utils/format';

const DRAFT_KEY = 'kt_trip_draft';
const INTERESTS = ['nature', 'food', 'culture', 'adventure', 'shopping', 'photography'];
const STEPS = ['start', 'duration', 'budget', 'interests', 'transport', 'needs'];

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

/** Large, tappable option cards used in each step. */
function Options({ options, value, onChange, labelFor, hintFor, name, cols = 'sm:grid-cols-2' }) {
  return (
    <div className={cx('grid gap-3', cols)} role="radiogroup" aria-label={name}>
      {options.map((o) => {
        const active = value === o;
        return (
          <button key={o} type="button" role="radio" aria-checked={active} onClick={() => onChange(o)} className={cx('flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-left transition', active ? 'border-forest-800 bg-forest-50' : 'border-line bg-white hover:border-forest-300')}>
            <span>
              <span className="block text-[15px] font-medium text-ink">{labelFor(o)}</span>
              {hintFor && <span className="block text-[13px] text-muted">{hintFor(o)}</span>}
            </span>
            <span className={cx('grid size-5 shrink-0 place-items-center rounded-full border', active ? 'border-forest-800 bg-forest-800 text-white' : 'border-sand-400')}>{active && <Check className="size-3" aria-hidden />}</span>
          </button>
        );
      })}
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
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [trip, setTrip] = useState(() => loadDraft());
  const [step, setStep] = useState(0);
  const { data: ai } = useQuery({ queryKey: ['ai-status'], queryFn: endpoints.aiStatus, staleTime: 600_000 });

  // The generated plan survives language switches and reloads within the session.
  useEffect(() => {
    try {
      if (trip) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(trip));
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }, [trip]);

  const { control, handleSubmit, watch, trigger, formState: { errors } } = useForm({
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
  const values = watch();

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const next = async () => {
    if (STEPS[step] === 'start' && !(values.startPoint || values.startDistrict)) {
      await trigger('startDistrict');
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const aiOn = ai?.configured;
  const last = step === STEPS.length - 1;

  // ---- Result view ----
  if (trip) {
    return (
      <div className="container-page pb-16">
        <Seo title={trip.title} noindex />
        <header className="flex flex-col gap-5 pt-10 pb-8 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-2">{aiOn && trip.generator === 'ai' ? t('trip.aiMode') : t('trip.demoMode')}</p>
            <label htmlFor="trip-title" className="sr-only">{t('trip.tripTitle')}</label>
            <input id="trip-title" value={trip.title} onChange={(e) => setTrip({ ...trip, title: e.target.value })} className="h1 w-full bg-transparent focus:outline-none" />
            {trip.notice && <p className="mt-2 text-sm text-muted">{trip.notice}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => { setTrip(null); setStep(0); }}><SlidersHorizontal className="size-4" aria-hidden />{t('trip.editPreferences')}</Button>
            {user ? (
              <Button onClick={() => save.mutate()} loading={save.isPending} disabled={!trip.days?.length}><Save className="size-4" aria-hidden />{t('trip.saveTrip')}</Button>
            ) : (
              <Button to="/login?next=/trip-builder"><Save className="size-4" aria-hidden />{t('trip.signInToSave')}</Button>
            )}
          </div>
        </header>
        {trip.days?.length ? <TripItinerary trip={trip} onChange={setTrip} /> : <EmptyState title={t('trip.empty')} body={trip.summary?.warnings?.[0]} />}
      </div>
    );
  }

  // ---- Wizard ----
  const stepKey = STEPS[step];
  return (
    <div className="container-page pb-16">
      <Seo title={t('trip.title')} description={t('trip.subtitle')} />
      <PageIntro eyebrow={t('nav.aiPlanner')} title={t('trip.title')} subtitle={t('trip.subtitle')} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <form onSubmit={last ? handleSubmit((v) => generate.mutate(v)) : (e) => { e.preventDefault(); next(); }} className="panel" noValidate>
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t(`trip.steps.${stepKey}`)}</span>
              <span className="text-muted tabular-nums">{t('trip.stepOf', { n: step + 1, total: STEPS.length })}</span>
            </div>
            <div className="mt-3 flex gap-1.5" aria-hidden>
              {STEPS.map((s, i) => <span key={s} className={cx('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-forest-700' : 'bg-sand-300')} />)}
            </div>
          </div>

          <div key={stepKey} className="animate-fade-up min-h-72 space-y-5">
            {stepKey === 'start' && (
              <>
                <h2 className="h2">{t('trip.q.start')}</h2>
                <Controller name="startPoint" control={control} render={({ field }) => <PointInput id="trip-start" label={t('trip.start')} value={field.value} onChange={field.onChange} allowGps />} />
                <Controller
                  name="startDistrict"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="label" htmlFor="trip-district">{t('trip.orDistrict')}</label>
                      <DistrictSelect id="trip-district" value={field.value} onChange={field.onChange} placeholder={t('trip.chooseDistrict')} />
                      {errors.startDistrict && <p role="alert" className="mt-1.5 text-sm text-laterite-700">{t('trip.startRequired')}</p>}
                    </div>
                  )}
                />
              </>
            )}
            {stepKey === 'duration' && (
              <>
                <h2 className="h2">{t('trip.q.duration')}</h2>
                <Controller name="duration" control={control} render={({ field }) => <Options name={t('trip.duration')} options={['few-hours', 'one-day', 'weekend', 'multi-day']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.durations.${o}`)} />} />
                <div className="flex flex-wrap gap-6 pt-2">
                  {values.duration === 'multi-day' && (
                    <Controller name="days" control={control} render={({ field }) => (
                      <div><label className="label" htmlFor="trip-days">{t('trip.days')}</label><input id="trip-days" type="number" min={2} max={7} className="input w-28" {...field} /></div>
                    )} />
                  )}
                  <Controller name="startDate" control={control} render={({ field }) => (
                    <div><label className="label" htmlFor="trip-date">{t('trip.startDate')}</label><input id="trip-date" type="date" className="input w-48" {...field} /></div>
                  )} />
                </div>
              </>
            )}
            {stepKey === 'budget' && (
              <>
                <h2 className="h2">{t('trip.q.budget')}</h2>
                <Controller name="budget" control={control} render={({ field }) => <Options cols="sm:grid-cols-3" name={t('trip.budget')} options={['budget', 'moderate', 'premium']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.budgets.${o}`)} />} />
                <p className="label pt-3">{t('trip.group')}</p>
                <Controller name="groupType" control={control} render={({ field }) => <Chips options={['solo', 'couple', 'family', 'friends', 'group']} value={field.value} onChange={(v) => field.onChange(v || field.value)} labelFor={(o) => t(`trip.groups.${o}`)} ariaLabel={t('trip.group')} />} />
              </>
            )}
            {stepKey === 'interests' && (
              <>
                <h2 className="h2">{t('trip.q.interests')}</h2>
                <p className="text-sm text-muted">{t('trip.pickAny')}</p>
                <Controller name="interests" control={control} render={({ field }) => <Chips options={INTERESTS} value={field.value} multiple onChange={field.onChange} labelFor={(o) => t(`trip.interestList.${o}`)} ariaLabel={t('trip.interests')} />} />
              </>
            )}
            {stepKey === 'transport' && (
              <>
                <h2 className="h2">{t('trip.q.transport')}</h2>
                <Controller name="transport" control={control} render={({ field }) => <Options name={t('trip.transport')} options={['car', 'bike', 'public', 'taxi']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.transports.${o}`)} />} />
                <p className="label pt-3">{t('trip.pace')}</p>
                <Controller name="pace" control={control} render={({ field }) => <Options cols="sm:grid-cols-3" name={t('trip.pace')} options={['relaxed', 'balanced', 'packed']} value={field.value} onChange={field.onChange} labelFor={(o) => t(`trip.paces.${o}`)} hintFor={(o) => t(`trip.paceHints.${o}`)} />} />
              </>
            )}
            {stepKey === 'needs' && (
              <>
                <h2 className="h2">{t('trip.q.needs')}</h2>
                <div className="divide-y divide-line">
                  <Controller name="withChildren" control={control} render={({ field }) => <Toggle label={t('trip.withChildren')} checked={field.value} onChange={field.onChange} />} />
                  <Controller name="withElderly" control={control} render={({ field }) => <Toggle label={t('trip.withElderly')} checked={field.value} onChange={field.onChange} />} />
                  <Controller name="respectOpeningHours" control={control} render={({ field }) => <Toggle label={t('trip.respectHours')} checked={field.value} onChange={field.onChange} />} />
                </div>
                <p className="label pt-2">{t('trip.accessibility')}</p>
                <Controller name="accessibilityNeeds" control={control} render={({ field }) => <Chips options={['wheelchair', 'minimal-walking', 'stroller']} value={field.value} multiple onChange={field.onChange} labelFor={(o) => t(`trip.needs.${o}`)} ariaLabel={t('trip.accessibility')} />} />
              </>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft className="size-4" aria-hidden />{t('common.back')}</Button>
            {last ? (
              <Button key="submit" type="submit" size="lg" loading={generate.isPending}><Sparkles className="size-4" aria-hidden />{generate.isPending ? t('trip.generating') : t('trip.generate')}</Button>
            ) : (
              <Button key="next" onClick={next}>{t('common.next')}<ArrowRight className="size-4" aria-hidden /></Button>
            )}
          </div>
        </form>

        <aside className="space-y-6">
          <div className="flex gap-3 text-sm">
            {aiOn ? <Sparkles className="mt-0.5 size-5 shrink-0 text-forest-600" aria-hidden /> : <FlaskConical className="mt-0.5 size-5 shrink-0 text-turmeric-600" aria-hidden />}
            <div>
              <p className="font-semibold">{aiOn ? t('trip.aiMode') : t('trip.demoMode')}</p>
              <p className="mt-1 text-muted">{aiOn ? t('trip.aiModeBody') : t('trip.demoModeBody')}</p>
            </div>
          </div>
          <div className="border-t border-line pt-6">
            <p className="caption mb-3 font-semibold tracking-wider uppercase">{t('trip.summary')}</p>
            <dl className="space-y-2 text-sm">
              {[
                [t('trip.start'), values.startPoint?.label || (values.startDistrict ? districtName(values.startDistrict, i18n.language) : '—')],
                [t('trip.duration'), t(`trip.durations.${values.duration}`)],
                [t('trip.budget'), t(`trip.budgets.${values.budget}`)],
                [t('trip.interests'), values.interests.map((i) => t(`trip.interestList.${i}`)).join(', ') || '—'],
                [t('trip.pace'), `${t(`trip.transports.${values.transport}`)} · ${t(`trip.paces.${values.pace}`)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <div className="mt-16"><Assistant /></div>
    </div>
  );
}
