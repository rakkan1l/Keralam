import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, LogOut, LayoutDashboard, Heart, Luggage } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageIntro } from '../components/ui/Section';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { DistrictSelect } from '../components/FilterPanel';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';
import { LANGUAGES } from '../i18n';
import { formatDate } from '../utils/format';

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  homeDistrict: z.string().optional(),
  language: z.enum(['en', 'ml']),
  trustedContacts: z.array(z.object({ name: z.string().trim().min(1, 'Required'), phone: z.string().trim().min(3, 'Required').max(30) })).max(5),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/),
});

function PasswordForm() {
  const { t } = useTranslation();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(passwordSchema) });
  return (
    <form
      className="panel space-y-4"
      onSubmit={handleSubmit(async (v) => {
        try {
          await endpoints.changePassword(v);
          toast.success(t('account.updated'));
          reset();
        } catch (err) {
          toast.error(errorMessage(err));
        }
      })}
    >
      <h2 className="h3 text-lg">{t('account.changePassword')}</h2>
      <div>
        <label className="label" htmlFor="cp">{t('account.currentPassword')}</label>
        <input id="cp" type="password" autoComplete="current-password" className="input" {...register('currentPassword')} />
      </div>
      <div>
        <label className="label" htmlFor="np">{t('account.newPassword')}</label>
        <input id="np" type="password" autoComplete="new-password" className="input" aria-invalid={!!errors.newPassword} {...register('newPassword')} />
        <p className="mt-1 text-xs text-muted">{t('auth.passwordHint')}</p>
      </div>
      <Button type="submit" loading={isSubmitting}>{t('account.changePassword')}</Button>
    </form>
  );
}

export default function Account() {
  const { t, i18n } = useTranslation();
  const { setUser, logout, isStaff } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['me', 'profile'], queryFn: endpoints.profile });
  const reviews = useQuery({ queryKey: ['me', 'reviews'], queryFn: endpoints.myReviews });
  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', homeDistrict: '', language: 'en', trustedContacts: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'trustedContacts' });

  useEffect(() => {
    if (data) reset({ name: data.user.name, homeDistrict: data.user.homeDistrict || '', language: data.user.preferences?.language === 'ml' ? 'ml' : 'en', trustedContacts: data.trustedContacts || [] });
  }, [data, reset]);

  if (isLoading) return <PageLoader />;
  const onSubmit = async (v) => {
    try {
      const res = await endpoints.updateProfile({ name: v.name, homeDistrict: v.homeDistrict, preferences: { language: v.language }, trustedContacts: v.trustedContacts });
      setUser(res.user);
      qc.setQueryData(['me', 'profile'], res);
      i18n.changeLanguage(v.language);
      toast.success(t('account.updated'));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="container-page max-w-3xl pb-20">
      <Seo title={t('account.title')} noindex />
      <PageIntro eyebrow={t('nav.myAccount')} title={data.user.name} subtitle={data.user.email} />
      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        <Link to="/saved" className="panel flex items-center gap-3 p-5 transition hover:bg-sand-50"><Heart className="size-5 text-forest-600" aria-hidden /><span className="font-medium">{t('nav.savedPlaces')}</span></Link>
        <Link to="/saved?tab=trips" className="panel flex items-center gap-3 p-5 transition hover:bg-sand-50"><Luggage className="size-5 text-forest-600" aria-hidden /><span className="font-medium">{t('nav.savedTrips')}</span></Link>
        {isStaff ? (
          <Link to="/admin" className="panel flex items-center gap-3 p-5 transition hover:bg-sand-50"><LayoutDashboard className="size-5 text-forest-600" aria-hidden /><span className="font-medium">{t('account.contentDashboard')}</span></Link>
        ) : (
          <button type="button" onClick={async () => { await logout(); navigate('/'); }} className="panel flex items-center gap-3 p-5 text-left transition hover:bg-sand-50"><LogOut className="size-5 text-laterite-600" aria-hidden /><span className="font-medium">{t('nav.logout')}</span></button>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="panel space-y-5" noValidate>
        <h2 className="h3 text-lg">{t('account.profile')}</h2>
        <div>
          <label className="label" htmlFor="name">{t('auth.name')}</label>
          <input id="name" className="input" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-laterite-700">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="home">{t('account.homeDistrict')}</label>
          <DistrictSelect id="home" value={watch('homeDistrict')} onChange={(v) => setValue('homeDistrict', v, { shouldDirty: true })} placeholder="—" />
        </div>
        <div>
          <label className="label" htmlFor="lang">{t('account.language')}</label>
          <select id="lang" className="input" {...register('language')}>
            {LANGUAGES.filter((l) => l.enabled).map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="label">{t('help.trustedContacts')}</legend>
          <div className="space-y-2">
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input aria-label={t('account.contactName')} placeholder={t('account.contactName')} className="input" {...register(`trustedContacts.${i}.name`)} />
                <input aria-label={t('account.contactPhone')} placeholder={t('account.contactPhone')} type="tel" className="input" {...register(`trustedContacts.${i}.phone`)} />
                <button type="button" onClick={() => remove(i)} className="grid size-11 place-items-center rounded-[10px] hover:bg-sand-100" aria-label={t('trip.remove')}><Trash2 className="size-4 text-laterite-600" /></button>
              </div>
            ))}
          </div>
          {fields.length < 5 && <Button variant="ghost" size="sm" className="mt-2" onClick={() => append({ name: '', phone: '' })}><Plus className="size-4" aria-hidden />{t('account.addContact')}</Button>}
        </fieldset>
        <Button type="submit" loading={isSubmitting}>{t('account.saveChanges')}</Button>
      </form>
      <div className="mt-6"><PasswordForm /></div>
      <section className="panel mt-6">
        <h2 className="h3 text-lg">{t('account.myReviews')}</h2>
        {reviews.data?.length ? (
          <ul className="mt-3 divide-y divide-line">
            {reviews.data.map((r) => (
              <li key={r._id} className="flex items-center justify-between py-2 text-sm">
                <span>{'★'.repeat(r.rating)} {r.title || r.text?.slice(0, 60)}</span>
                <span className="flex items-center gap-2"><Badge tone={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber'}>{r.status}</Badge><span className="text-xs text-muted">{formatDate(r.createdAt, i18n.language)}</span></span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">{t('reviews.none')} <Link to="/explore" className="underline">{t('nav.explore')}</Link></p>
        )}
      </section>
      {isStaff && (
        <Button variant="ghost" className="mt-6" onClick={async () => { await logout(); navigate('/'); }}><LogOut className="size-4" aria-hidden />{t('nav.logout')}</Button>
      )}
    </div>
  );
}
