import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation, Share2, Flag } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { endpoints, errorMessage, errorDetails } from '../../services/api';
import { mapsLink } from '../../utils/format';
import { REPORT_KINDS } from '../../utils/constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function DirectionsButton({ doc, variant = 'primary' }) {
  const { t } = useTranslation();
  const href = mapsLink(doc);
  if (!href) return null;
  return (
    <Button href={href} variant={variant}>
      <Navigation className="size-4" aria-hidden /> {t('common.directions')}
    </Button>
  );
}

export function ShareButton({ title, text, url }) {
  const { t } = useTranslation();
  const toast = useToast();
  const share = async () => {
    const link = url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t('common.copied'));
    } catch {
      toast.error(link);
    }
  };
  return (
    <Button variant="secondary" onClick={share}>
      <Share2 className="size-4" aria-hidden /> {t('common.share')}
    </Button>
  );
}

const reportSchema = z.object({
  kind: z.enum(REPORT_KINDS),
  message: z.string().trim().min(5, 'Please add a few more details').max(2000),
  evidenceUrl: z.union([z.url({ protocol: /^https?$/ }), z.literal('')]).optional(),
  reporterEmail: z.union([z.email(), z.literal('')]).optional(),
});

export function ReportButton({ targetType, target }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: { kind: 'incorrect-info', message: '', evidenceUrl: '', reporterEmail: '' },
  });
  const onSubmit = async (values) => {
    try {
      await endpoints.createReport({ ...values, targetType, targetId: target?._id, targetName: target?.name || target?.title });
      toast.success(t('report.thanks'));
      reset();
      setOpen(false);
    } catch (err) {
      errorDetails(err).forEach((d) => setError(d.path, { message: d.message }));
      toast.error(errorMessage(err));
    }
  };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 hover:text-forest-800 hover:underline">
        <Flag className="size-4" aria-hidden /> {t('common.reportIssue')}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('report.title')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="r-kind">{t('report.kind')}</label>
            <select id="r-kind" className="input" {...register('kind')}>
              {REPORT_KINDS.map((k) => (
                <option key={k} value={k}>{t(`report.kinds.${k}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="r-msg">{t('report.message')}</label>
            <textarea id="r-msg" rows={4} className="input" placeholder={t('report.messagePlaceholder')} aria-invalid={!!errors.message} {...register('message')} />
            {errors.message && <p className="mt-1 text-xs text-laterite-700">{errors.message.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="r-url">{t('report.evidence')}</label>
            <input id="r-url" type="url" className="input" {...register('evidenceUrl')} />
            {errors.evidenceUrl && <p className="mt-1 text-xs text-laterite-700">{errors.evidenceUrl.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="r-email">{t('report.email')}</label>
            <input id="r-email" type="email" className="input" {...register('reporterEmail')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" loading={isSubmitting}>{t('common.submit')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
