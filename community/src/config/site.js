// Central, replaceable site configuration. Nothing here is an official fact
// until the community confirms it — keep unconfirmed values empty or flagged.
const env = import.meta.env;

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

const communityName = clean(env.VITE_COMMUNITY_NAME);

export const site = {
  // The official name has not been supplied. `nameConfirmed` drives honest fallbacks.
  name: communityName || 'Roleplay Community',
  nameConfirmed: Boolean(communityName),
  url: clean(env.VITE_SITE_URL),
  tagline: 'A serious roleplay community in preparation.',
};

export const launch = {
  // The game server is not live. Do not change this without a real launch.
  serverLive: false,
  // No launch date has been announced. Set an ISO date string once official.
  launchDate: null,
};

export const applications = {
  endpoint: clean(env.VITE_APPLICATION_ENDPOINT),
  get acceptingOnline() {
    return Boolean(this.endpoint);
  },
};

// Primary navigation — order is part of the brief.
export const navigation = [
  { label: 'Home', to: '/', end: true },
  { label: 'Admin', to: '/admin' },
  { label: 'Gangs', to: '/gangs' },
  { label: 'Rules', to: '/rules' },
];

export const applyLink = { label: 'Apply Now', to: '/apply' };

// Official community links. Empty values are hidden — never invent these.
export const communityLinks = [
  { label: 'Discord', href: clean(env.VITE_DISCORD_URL) },
  { label: 'YouTube', href: clean(env.VITE_YOUTUBE_URL) },
  { label: 'TikTok', href: clean(env.VITE_TIKTOK_URL) },
  { label: 'Instagram', href: clean(env.VITE_INSTAGRAM_URL) },
].filter((link) => link.href);

const previewFlag = clean(env.VITE_GANGS_PREVIEW);
export const showGangPreview = previewFlag ? previewFlag === 'true' : Boolean(env.DEV);
