import { BadgeCheck, FlaskConical, CircleAlert, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/format';

const TONES = {
  neutral: 'bg-sand-200 text-ink-soft',
  green: 'bg-forest-50 text-forest-700',
  amber: 'bg-turmeric-100 text-turmeric-600',
  red: 'bg-laterite-50 text-laterite-700',
  blue: 'bg-lagoon-50 text-lagoon-700',
  dark: 'bg-forest-950/70 text-white backdrop-blur',
  light: 'bg-white/90 text-ink backdrop-blur',
  outline: 'border border-line text-ink-soft',
};

export default function Badge({ tone = 'neutral', icon: Icon, className = '', children, title }) {
  return (
    <span title={title} className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

/**
 * Trust signals for a record. On cards (`compact`) only the most important signal is
 * shown so demo/verified labels don't overwhelm the imagery.
 */
export function TrustBadges({ doc, compact = false, onImage = false }) {
  const { t } = useTranslation();
  if (!doc) return null;
  const tone = (base) => (onImage ? 'light' : base);
  if (doc.status === 'temporarily_closed') return <Badge tone={tone('red')} icon={CircleAlert}>{t('common.temporarilyClosed')}</Badge>;
  const badges = [];
  if (doc.isDemo) badges.push(<Badge key="demo" tone={tone('amber')} icon={FlaskConical} title={t('common.demoHint')}>{t('common.demo')}</Badge>);
  else if (doc.verification?.verifiedAt) badges.push(<Badge key="v" tone={tone('green')} icon={BadgeCheck}>{t('common.verified')}</Badge>);
  if (doc.status === 'needs_update') badges.push(<Badge key="n" tone={tone('amber')} icon={Clock}>{t('common.needsUpdate')}</Badge>);
  if (compact) return badges[0] || null;
  if (!badges.length) badges.push(<Badge key="u" tone={onImage ? 'light' : 'outline'}>{t('common.unverified')}</Badge>);
  return <div className="flex flex-wrap gap-1.5">{badges}</div>;
}
