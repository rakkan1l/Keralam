import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { errorMessage, errorDetails } from '../services/api';
import { safeNext } from './Login';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Za-z]/, 'Include a letter').regex(/\d/, 'Include a number'),
});

export default function Register() {
  const { t } = useTranslation();
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (values) => {
    try {
      await signUp(values);
      navigate(safeNext(params.get('next')), { replace: true });
    } catch (err) {
      errorDetails(err).forEach((d) => setError(d.path, { message: d.message }));
      setError('root', { message: errorMessage(err) });
    }
  };
  const field = (name, type, auto, hint) => (
    <div>
      <label className="label" htmlFor={name}>{t(`auth.${name}`)}</label>
      <input id={name} type={type} autoComplete={auto} className="input" aria-invalid={!!errors[name]} aria-describedby={hint ? `${name}-hint` : undefined} {...register(name)} />
      {hint && <p id={`${name}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {errors[name] && <p className="mt-1 text-xs text-laterite-700">{errors[name].message}</p>}
    </div>
  );
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-10">
      <Seo title={t('nav.register')} noindex />
      <div className="card w-full max-w-md p-7">
        <h1 className="text-2xl">{t('auth.registerTitle')}</h1>
        <p className="mt-1 text-sm text-muted">{t('auth.registerSub')}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          {field('name', 'text', 'name')}
          {field('email', 'email', 'email')}
          {field('password', 'password', 'new-password', t('auth.passwordHint'))}
          {errors.root && <p role="alert" className="rounded-xl bg-laterite-50 p-3 text-sm text-laterite-700">{errors.root.message}</p>}
          <Button type="submit" className="w-full" loading={isSubmitting}>{t('nav.register')}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {t('auth.haveAccount')} <Link to="/login" className="font-medium text-forest-700 hover:underline">{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  );
}
