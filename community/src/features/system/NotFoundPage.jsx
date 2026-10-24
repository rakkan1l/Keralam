import { usePageMeta } from '../../components/layout/usePageMeta.js';
import PageHero from '../../components/ui/PageHero.jsx';
import ButtonLink from '../../components/ui/ButtonLink.jsx';

export default function NotFoundPage() {
  usePageMeta('Page not found');
  return (
    <PageHero
      eyebrow="404"
      title={
        <>
          This street <em>doesn’t exist</em>.
        </>
      }
      lede="The page you were looking for could not be found."
      seed={404}
    >
      <ButtonLink to="/">Return home</ButtonLink>
    </PageHero>
  );
}
