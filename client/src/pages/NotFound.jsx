import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import Seo from '../components/Seo';
import Button from '../components/ui/Button';
import SceneArt from '../components/ui/SceneArt';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-12 text-center">
      <Seo title={t('notFound.title')} noindex />
      <div>
        <SceneArt scene="backwater" seed="404" className="mx-auto h-44 w-72 rounded-[var(--radius-panel)]" />
        <h1 className="h1 mt-8">{t('notFound.title')}</h1>
        <p className="mt-2 text-muted">{t('notFound.body')}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button to="/">{t('notFound.home')}</Button>
          <Button to="/explore" variant="secondary"><Compass className="size-4" aria-hidden />{t('nav.explore')}</Button>
        </div>
      </div>
    </div>
  );
}
