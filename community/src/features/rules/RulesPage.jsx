import { useEffect, useState } from 'react';
import { usePageMeta } from '../../components/layout/usePageMeta.js';
import PageHero from '../../components/ui/PageHero.jsx';
import ButtonLink from '../../components/ui/ButtonLink.jsx';
import { Notice, StatusPill } from '../../components/ui/Status.jsx';
import { rulesDocument } from '../../data/rules.js';
import './rules.css';

const { categories, status, lastUpdated } = rulesDocument;

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const sectionIds = categories.map((category) => category.id);

export default function RulesPage() {
  usePageMeta('Rules', 'Server rules organised by category — conduct, roleplay standards, combat, gangs, safe zones and appeals.');
  const active = useActiveSection(sectionIds);
  const updated = lastUpdated ? new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(lastUpdated)) : null;

  return (
    <>
      <PageHero
        index="Chapter 04"
        eyebrow="Server rules"
        title={
          <>
            Know the standard <em>before you arrive</em>.
          </>
        }
        lede="Clear rules, organised by category. Applying to join means agreeing to follow them."
        seed={34}
        variant="dusk"
      >
        <div className="rules-hero__meta">
          <StatusPill tone="pending">{status === 'official' ? 'Official' : 'Draft — pending approval'}</StatusPill>
          <span className="caps muted">{updated ? `Updated ${updated}` : 'Not yet published'}</span>
        </div>
      </PageHero>

      <section className="rules section theme-light" aria-label="Rules">
        <div className="container rules__layout">
          <nav className="rules-toc" aria-label="Rule categories">
            <p className="caps rules-toc__label">Contents</p>
            <ol role="list">
              {categories.map((category, index) => (
                <li key={category.id}>
                  <a
                    href={`#${category.id}`}
                    className={`rules-toc__link${active === category.id ? ' is-active' : ''}`}
                    aria-current={active === category.id ? 'true' : undefined}
                  >
                    <span className="caps">{String(index + 1).padStart(2, '0')}</span>
                    {category.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="rules__content">
            {status !== 'official' && (
              <Notice title="Draft rulebook">
                These rules are a working draft based on common roleplay standards, published so the page can be
                reviewed. They are not final and will be replaced by the official rulebook before launch.
              </Notice>
            )}

            {categories.map((category, categoryIndex) => (
              <article key={category.id} id={category.id} className="rule-category" aria-labelledby={`${category.id}-title`}>
                <header className="rule-category__head">
                  <span className="rule-category__num display">{String(categoryIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 id={`${category.id}-title`} className="heading rule-category__title">
                      {category.title}
                    </h2>
                    <p className="muted">{category.summary}</p>
                  </div>
                </header>
                <ol role="list" className="rule-list">
                  {category.rules.map((rule, ruleIndex) => (
                    <li key={rule.title} className="rule">
                      <span className="caps rule__id">
                        {categoryIndex + 1}.{ruleIndex + 1}
                      </span>
                      <div>
                        <h3 className="rule__title">{rule.title}</h3>
                        <p className="muted">{rule.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            ))}

            <div className="rules__end">
              <p className="heading rules__end-title">
                Ready to play <em>by the standard</em>?
              </p>
              <ButtonLink to="/apply">Apply Now</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
