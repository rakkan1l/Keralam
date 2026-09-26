import { BadgeCheck, FlaskConical, CircleHelp, Gem, CircleAlert, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../utils/format';

const TONES = {
  neutral: 'bg-sand-200 text-forest-900',
  green: 'bg-forest-100 text-forest-800',
  amber: 'bg-turmeric-100 text-turmeric-600',
  red: 'bg-laterite-100 text-laterite-700',
  blue: 'bg-lagoon-50 text-lagoon-700',
  dark: 'bg-forest-900/85 text-white backdrop-blur',
  light: 'bg-white/90 text-forest-900 backdrop-blur',
};

export default function Badge({ tone = 'neutral', icon: Icon, className = '', children, title }) {
  return (
    <span title={title} className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

/** Shows verified / unverified / demo / status for a content record. */
export function TrustBadges({ doc, compact = false, onImage = false }) {
  const { t } = useTranslation();
  if (!doc) return null;
  const badges = [];
  if (doc.isDemo) badges.push(<Badge key="demo" tone={onImage ? 'light' : 'amber'} icon={FlaskConical} title={t('common.demoHint')}>{t('common.demo')}</Badge>);
  else if (doc.verification?.verifiedAt) badges.push(<Badge key="v" tone={onImage ? 'light' : 'green'} icon={BadgeCheck} title={t('common.verified')}>{t('common.verified')}</Badge>);
  else if (!compact) badges.push(<Badge key="u" tone="neutral" icon={CircleHelp} title={t('common.unverifiedHint')}>{t('common.unverified')}</Badge>);
  if (doc.status === 'temporarily_closed') badges.push(<Badge key="c" tone="red" icon={CircleAlert}>{t('common.temporarilyClosed')}</Badge>);
  if (doc.status === 'needs_update') badges.push(<Badge key="n" tone="amber" icon={Clock}>{t('common.needsUpdate')}</Badge>);
  if (doc.hiddenGem && !compact) badges.push(<Badge key="g" tone="blue" icon={Gem}>{t('nav.hiddenGems')}</Badge>);
  return <div className="flex flex-wrap gap-1.5">{badges}</div>;
}
