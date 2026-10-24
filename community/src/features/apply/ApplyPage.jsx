import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../components/layout/usePageMeta.js';
import PageHero from '../../components/ui/PageHero.jsx';
import ButtonLink from '../../components/ui/ButtonLink.jsx';
import { Notice, StatusPill } from '../../components/ui/Status.jsx';
import { applications } from '../../config/site.js';
import { submitApplication } from '../../services/applications.js';
import { experienceOptions, fieldOrder, initialValues, limits, validate } from './fields.js';
import './apply.css';

const steps = [
  { title: 'Apply', body: 'Tell us who you are and the character you want to bring to the city.' },
  { title: 'Review', body: 'Authorised staff read every application.' },
  { title: 'Decision', body: 'You are contacted with the outcome through the details you provide.' },
  { title: 'Launch', body: 'Accepted applicants are onboarded when the server opens.' },
];

const labels = {
  discord: 'Discord username',
  timezone: 'Time zone',
  experience: 'Roleplay experience',
  characterName: 'Planned character name',
  characterConcept: 'Character concept',
  motivation: 'Why do you want to join?',
  ageConfirmed: 'Age requirement',
  rulesAccepted: 'Server rules',
};

function Field({ name, label, hint, error, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field__label" htmlFor={name}>
        {label}
      </label>
      {hint && (
        <p className="field__hint" id={`${name}-hint`}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="field__error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (name, { hint, error }) =>
  [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined;

export default function ApplyPage() {
  usePageMeta('Apply', 'Apply to join the community before the server launches.');
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('editing'); // editing | submitting | sent | not-configured | error
  const [result, setResult] = useState(null);
  const summaryRef = useRef(null);
  const formRef = useRef(null);

  const update = (event) => {
    const { name, type, checked, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setPhase('editing');
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    // Silently drop obvious bot submissions without telling them.
    if (values.website) return;

    setPhase('submitting');
    const payload = Object.fromEntries(
      fieldOrder.map((key) => [key, typeof values[key] === 'string' ? values[key].trim() : values[key]]),
    );
    const outcome = await submitApplication(payload);
    setResult(outcome);
    setPhase(outcome.status);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: 'start' }));
  };

  const errorKeys = fieldOrder.filter((key) => errors[key]);

  return (
    <>
      <PageHero
        index="Chapter 05"
        eyebrow="Apply now"
        title={
          <>
            Your place in the city <em>starts here</em>.
          </>
        }
        lede="The server has not launched yet. Applications are open ahead of launch so the first residents can be reviewed before the doors open."
        seed={57}
      >
        <StatusPill tone={applications.acceptingOnline ? 'positive' : 'pending'}>
          {applications.acceptingOnline ? 'Accepting applications' : 'Online submission opening soon'}
        </StatusPill>
      </PageHero>

      <section className="apply section theme-light" aria-label="Application">
        <div className="container apply__layout">
          <aside className="apply__process" aria-labelledby="process-title">
            <h2 id="process-title" className="caps apply__process-label">
              The process
            </h2>
            <ol role="list" className="apply__steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="display apply__step-num">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="apply__step-title">{step.title}</h3>
                    <p className="muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="caps muted apply__provisional">Process and questions are provisional.</p>
          </aside>

          <div className="apply__main" ref={formRef}>
            {phase === 'sent' ? (
              <div className="apply-result" role="status">
                <p className="caps apply-result__label">Application received</p>
                <h2 className="heading">
                  Thank you. <em>Your application is in.</em>
                </h2>
                <p className="lede">
                  Staff will review it and contact you through the Discord username you provided.
                  {result?.reference && ` Your reference is ${result.reference}.`}
                </p>
                <ButtonLink to="/rules" variant="ghost">
                  Read the rules while you wait
                </ButtonLink>
              </div>
            ) : (
              <>
                {!applications.acceptingOnline && (
                  <Notice title="Online submission is not connected yet">
                    You can fill in and check the form now, but the review system is still being built. Submitting will
                    not send or store anything until it is connected.
                  </Notice>
                )}

                {phase === 'not-configured' && (
                  <div className="apply-result apply-result--inline" role="status">
                    <p className="caps apply-result__label">Not sent</p>
                    <p>
                      Your answers passed every check, but <strong>nothing was sent or stored</strong> — online
                      submission is not connected yet. Keep a copy of your answers and submit once applications open.
                    </p>
                  </div>
                )}

                {phase === 'error' && (
                  <div className="apply-result apply-result--error" role="alert">
                    <p className="caps apply-result__label">Not submitted</p>
                    <p>{result?.message}</p>
                  </div>
                )}

                {errorKeys.length > 0 && (
                  <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
                    <p className="error-summary__title">Please check {errorKeys.length === 1 ? 'one answer' : `${errorKeys.length} answers`}</p>
                    <ul>
                      {errorKeys.map((key) => (
                        <li key={key}>
                          <a href={`#${key}`}>
                            {labels[key]}: {errors[key]}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <form className="apply-form" noValidate onSubmit={onSubmit}>
                  <fieldset>
                    <legend className="apply-form__legend">
                      <span className="caps">Part one</span>
                      <span className="display">About you</span>
                    </legend>
                    <div className="apply-form__row">
                      <Field name="discord" label={labels.discord} hint="So staff can contact you, e.g. resident_01." error={errors.discord}>
                        <input
                          id="discord"
                          name="discord"
                          autoComplete="username"
                          value={values.discord}
                          onChange={update}
                          aria-invalid={Boolean(errors.discord)}
                          aria-describedby={describedBy('discord', { hint: true, error: errors.discord })}
                          maxLength={32}
                        />
                      </Field>
                      <Field name="timezone" label={labels.timezone} hint="e.g. GMT+5:30 or Central European Time." error={errors.timezone}>
                        <input
                          id="timezone"
                          name="timezone"
                          value={values.timezone}
                          onChange={update}
                          aria-invalid={Boolean(errors.timezone)}
                          aria-describedby={describedBy('timezone', { hint: true, error: errors.timezone })}
                          maxLength={40}
                        />
                      </Field>
                    </div>
                    <Field name="experience" label={labels.experience} error={errors.experience}>
                      <select
                        id="experience"
                        name="experience"
                        value={values.experience}
                        onChange={update}
                        aria-invalid={Boolean(errors.experience)}
                        aria-describedby={describedBy('experience', { error: errors.experience })}
                      >
                        {experienceOptions.map((option) => (
                          <option key={option.value} value={option.value} disabled={!option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </fieldset>

                  <fieldset>
                    <legend className="apply-form__legend">
                      <span className="caps">Part two</span>
                      <span className="display">Your character</span>
                    </legend>
                    <Field name="characterName" label={labels.characterName} error={errors.characterName}>
                      <input
                        id="characterName"
                        name="characterName"
                        value={values.characterName}
                        onChange={update}
                        aria-invalid={Boolean(errors.characterName)}
                        aria-describedby={describedBy('characterName', { error: errors.characterName })}
                        maxLength={60}
                      />
                    </Field>
                    {['characterConcept', 'motivation'].map((key) => (
                      <Field
                        key={key}
                        name={key}
                        label={labels[key]}
                        hint={
                          key === 'characterConcept'
                            ? 'Who are they, where do they come from and what do they want from the city?'
                            : 'What are you looking for in a roleplay community?'
                        }
                        error={errors[key]}
                      >
                        <textarea
                          id={key}
                          name={key}
                          rows={key === 'characterConcept' ? 8 : 5}
                          value={values[key]}
                          onChange={update}
                          aria-invalid={Boolean(errors[key])}
                          aria-describedby={`${describedBy(key, { hint: true, error: errors[key] })} ${key}-count`}
                          maxLength={limits[key].max}
                        />
                        <p className="field__count" id={`${key}-count`}>
                          {values[key].trim().length} / {limits[key].min} minimum
                        </p>
                      </Field>
                    ))}
                  </fieldset>

                  <fieldset>
                    <legend className="apply-form__legend">
                      <span className="caps">Part three</span>
                      <span className="display">Confirmation</span>
                    </legend>
                    {[
                      ['ageConfirmed', 'I confirm that I meet the community’s age requirement.'],
                      [
                        'rulesAccepted',
                        <>
                          I have read and agree to follow the{' '}
                          <Link to="/rules" target="_blank" className="inline-link">
                            server rules
                          </Link>
                          .
                        </>,
                      ],
                    ].map(([key, text]) => (
                      <div key={key} className={`check${errors[key] ? ' has-error' : ''}`}>
                        <input
                          type="checkbox"
                          id={key}
                          name={key}
                          checked={values[key]}
                          onChange={update}
                          aria-invalid={Boolean(errors[key])}
                          aria-describedby={errors[key] ? `${key}-error` : undefined}
                        />
                        <label htmlFor={key}>{text}</label>
                        {errors[key] && (
                          <p className="field__error" id={`${key}-error`}>
                            {errors[key]}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="apply-form__trap" aria-hidden="true">
                      <label htmlFor="website">Leave this field empty</label>
                      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} />
                    </div>
                  </fieldset>

                  <div className="apply-form__submit">
                    <button type="submit" className="btn btn--gold btn--lg" disabled={phase === 'submitting'}>
                      <span>
                        {phase === 'submitting'
                          ? 'Submitting…'
                          : applications.acceptingOnline
                            ? 'Submit application'
                            : 'Check my application'}
                      </span>
                    </button>
                    <p className="muted apply-form__privacy">
                      {applications.acceptingOnline
                        ? 'Your answers are sent securely and are only visible to authorised staff.'
                        : 'Nothing you type here leaves your browser.'}
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
