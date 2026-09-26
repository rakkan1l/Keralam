import { useTranslation } from 'react-i18next';
import { PlaceExplorer } from './Explore';

export default function HiddenGems() {
  const { t } = useTranslation();
  return <PlaceExplorer fixed={{ hiddenGem: 'true' }} eyebrow={t('home.gemsEyebrow')} title={t('home.gemsTitle')} subtitle={t('home.gemsSub')} />;
}
