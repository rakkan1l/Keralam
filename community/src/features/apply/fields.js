// Provisional application questions — to be finalised by administration.
// The future backend must re-validate every field server-side; this is UX only.

export const experienceOptions = [
  { value: '', label: 'Select an option' },
  { value: 'none', label: 'New to roleplay' },
  { value: 'under-6-months', label: 'Less than 6 months' },
  { value: '6-24-months', label: '6 months – 2 years' },
  { value: 'over-2-years', label: 'More than 2 years' },
];

export const initialValues = {
  discord: '',
  timezone: '',
  experience: '',
  characterName: '',
  characterConcept: '',
  motivation: '',
  ageConfirmed: false,
  rulesAccepted: false,
  website: '', // honeypot — real users never see or fill this
};

export const limits = {
  characterConcept: { min: 150, max: 2000 },
  motivation: { min: 80, max: 1500 },
};

const DISCORD = /^(?!.*\.\.)[a-z0-9_.]{2,32}$/i;

export function validate(values) {
  const errors = {};
  const text = (key) => values[key].trim();

  if (!text('discord')) errors.discord = 'Enter your Discord username.';
  else if (!DISCORD.test(text('discord')))
    errors.discord = 'Use 2–32 letters, numbers, underscores or full stops (no @ or #).';

  if (!text('timezone')) errors.timezone = 'Enter your time zone so reviewers know when you play.';
  else if (text('timezone').length > 40) errors.timezone = 'Keep this under 40 characters.';

  if (!values.experience) errors.experience = 'Choose your roleplay experience.';

  if (!text('characterName')) errors.characterName = 'Enter your planned character’s name.';
  else if (text('characterName').length < 2 || text('characterName').length > 60)
    errors.characterName = 'Use between 2 and 60 characters.';

  for (const key of ['characterConcept', 'motivation']) {
    const { min, max } = limits[key];
    const length = text(key).length;
    if (length < min) errors[key] = `Write at least ${min} characters (currently ${length}).`;
    else if (length > max) errors[key] = `Keep this under ${max} characters.`;
  }

  if (!values.ageConfirmed) errors.ageConfirmed = 'Confirm that you meet the age requirement.';
  if (!values.rulesAccepted) errors.rulesAccepted = 'You need to accept the server rules to apply.';

  return errors;
}

export const fieldOrder = [
  'discord',
  'timezone',
  'experience',
  'characterName',
  'characterConcept',
  'motivation',
  'ageConfirmed',
  'rulesAccepted',
];
