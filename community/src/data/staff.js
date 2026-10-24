// Administration directory. Add only real, approved staff members.
// Member shape: { id, name, role, portrait: '/media/staff/id.webp' | null }
//
// Online / on-duty status must come from a real integration (FiveM server or
// staff tooling) through the future backend — never from static values here.
export const staffDirectory = {
  members: [],
};

export const statusIntegration = {
  connected: false,
  // Set by the integration when connected: ISO timestamp of the last successful sync.
  lastUpdated: null,
};
