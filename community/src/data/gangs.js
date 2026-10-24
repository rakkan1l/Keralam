// Gang directory data, kept separate from presentation.
//
// `gangs` holds OFFICIAL entries only — confirmed by administration. It is empty
// until real information is supplied. Shape of an entry:
// {
//   id: 'unique-slug',
//   name: 'Official name',
//   tagline: 'Short line shown in the directory',
//   description: 'Approved description',
//   emblem: '/media/gangs/slug-emblem.webp' | null,
//   image: '/media/gangs/slug.webp' | null,
//   facts: [{ label: 'Territory', value: '…' }],   // verified facts only
//   history: [{ date: 'YYYY-MM-DD', title: '…' }], // verified events only
//   art: { seed: 1, variant: 'night' | 'dusk' },    // fallback art when no image
// }
export const gangs = [];

const roman = ['I', 'II', 'III', 'IV', 'V'];
const variants = ['night', 'dusk', 'night', 'dusk', 'night'];

// Development-only placeholders so the layout can be reviewed. They are never
// presented as real gangs: every one is labelled as a preview in the interface.
export const previewGangs = roman.map((numeral, index) => ({
  id: `preview-${index + 1}`,
  name: `Untitled ${numeral}`,
  tagline: 'Placeholder entry',
  description:
    'Development preview. This space will hold the approved description of a recognised gang — its identity, its story and how it came to shape the city.',
  emblem: null,
  image: null,
  facts: [],
  history: [],
  art: { seed: 101 + index * 17, variant: variants[index] },
  isPreview: true,
}));

// Labels shown for facts that have not been recorded. Never fill these with guesses.
export const factLabels = ['Founded', 'Territory', 'Leadership', 'Colours'];
