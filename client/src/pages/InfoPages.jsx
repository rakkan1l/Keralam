import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import { PageIntro } from '../components/ui/Section';

/*
 * About / Privacy / Terms. The privacy text describes what this codebase actually
 * does (cookie auth, local storage, first-party analytics). Operators should have it
 * reviewed and add their legal entity and contact details before launch.
 */

function Prose({ children }) {
  return <div className="max-w-2xl space-y-5 pb-20 text-[16px] leading-[1.75] text-ink-soft [&_h2]:pt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">{children}</div>;
}

export function About() {
  const { t } = useTranslation();
  return (
    <div className="container-page">
      <Seo title={t('pages.aboutTitle')} description={t('footer.about')} />
      <PageIntro eyebrow={t('nav.about')} title={t('pages.aboutTitle')} subtitle={t('footer.about')} />
      <Prose>
        <p>Keralam helps travellers and residents discover Kerala’s fourteen districts — from well-known destinations to quieter local favourites — and plan how to get there.</p>
        <h2>How we handle information</h2>
        <ul>
          <li>Every listing carries a status. Only published content appears on the site.</li>
          <li>Opening hours, entry fees, safety and accessibility details are shown as verified only after an editor has checked them against a named source.</li>
          <li>When we don’t know something, we say so instead of guessing.</li>
          <li>Listings marked “Demo content” are sample data used while the platform is being built.</li>
        </ul>
        <h2>Help us keep it accurate</h2>
        <p>Spotted something wrong or out of date? Use “Report incorrect information” on any page — reports go straight to our editors.</p>
        <h2 id="contact">Contact</h2>
        <p>For corrections, use the report link on the relevant page. For anything else, contact the team that operates this deployment of Keralam. In an emergency, go to <Link to="/help" className="link">Emergency Assistance</Link>.</p>
      </Prose>
    </div>
  );
}

export function Privacy() {
  const { t } = useTranslation();
  return (
    <div className="container-page">
      <Seo title={t('pages.privacyTitle')} />
      <PageIntro eyebrow={t('footer.privacy')} title={t('pages.privacyTitle')} />
      <Prose>
        <h2>What we store</h2>
        <ul>
          <li><strong>Account:</strong> your name, email, a securely hashed password, language preference, home district and any trusted contacts you add.</li>
          <li><strong>Your activity:</strong> saved places, lists, trips, reviews, reports and community updates you submit, and recently viewed places while signed in.</li>
          <li><strong>Usage analytics:</strong> searches, page views, saves, route requests and trip creation, kept for up to 180 days to improve the service.</li>
        </ul>
        <h2>On your device</h2>
        <ul>
          <li>A secure, http-only cookie keeps you signed in.</li>
          <li>Your language choice, and places saved before you sign in, are kept in your browser’s local storage.</li>
        </ul>
        <h2>Location</h2>
        <p>We only ask for your location when you use a feature that needs it (Near Me, directions, sharing your location). It is used to sort results and is not stored on our servers.</p>
        <h2>Third parties</h2>
        <p>Maps are loaded from OpenStreetMap tile servers. Optional services — image hosting, routing, weather and AI trip planning — are only contacted if the operator has enabled them.</p>
      </Prose>
    </div>
  );
}

export function Terms() {
  const { t } = useTranslation();
  return (
    <div className="container-page">
      <Seo title={t('pages.termsTitle')} />
      <PageIntro eyebrow={t('footer.terms')} title={t('pages.termsTitle')} />
      <Prose>
        <ul>
          <li>Information on Keralam is provided to help you plan. Always confirm opening hours, prices, safety conditions and transport locally before you travel.</li>
          <li>Routes and travel times may be estimates and do not include live traffic.</li>
          <li>Bookings made through external links are between you and the provider.</li>
          <li>Reviews and community updates must be honest, lawful and your own. We moderate submissions and may remove content.</li>
          <li>In an emergency, contact the emergency services directly.</li>
        </ul>
      </Prose>
    </div>
  );
}
