import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

const schema = z.object({ email: z.email('Enter a valid email'), password: z.string().min(1, 'Password is required') });

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate(safeNext(params.get('next')), { replace: true });
    } catch (err) {
      setError('root', { message: errorMessage(err) });
    }
  };
  return (
    <div className="container-page grid min-h-[75vh] place-items-center py-14">
      <Seo title={t('nav.login')} noindex />
      <div className="panel w-full max-w-md sm:p-10">
        <h1 className="h1 text-[2rem]">{t('auth.signInTitle')}</h1>
        <p className="mt-1 text-sm text-muted">{t('auth.signInSub')}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" autoComplete="email" className="input" aria-invalid={!!errors.email} {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-laterite-700">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" autoComplete="current-password" className="input" aria-invalid={!!errors.password} {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-laterite-700">{errors.password.message}</p>}
          </div>
          {errors.root && <p role="alert" className="rounded-xl bg-laterite-50 p-3 text-sm text-laterite-700">{errors.root.message}</p>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>{t('nav.login')}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {t('auth.noAccount')} <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className="font-medium text-forest-700 hover:underline">{t('nav.register')}</Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted">{t('auth.guestNote')}</p>
      </div>
    </div>
  );
}
