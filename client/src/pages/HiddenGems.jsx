import { useTranslation } from 'react-i18next';
import { PlaceExplorer } from './Explore';

export default function HiddenGems() {
  const { t } = useTranslation();
  return <PlaceExplorer fixed={{ hiddenGem: 'true' }} title={t('home.hiddenGems')} subtitle={t('home.hiddenGemsSub')} />;
}
