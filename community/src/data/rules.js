// Server rules. This is a DRAFT built from common FiveM roleplay conventions so the
// page can be designed and reviewed — it is not the community's official rulebook.
// Replace the content, set `status: 'official'` and a real `lastUpdated` date once approved.
// Later phases will move this into the CMS (Admin → Rules) without changing the page.

export const rulesDocument = {
  status: 'draft', // 'draft' | 'official'
  lastUpdated: null, // ISO date string once officially published
  categories: [
    {
      id: 'general',
      title: 'General conduct',
      summary: 'The baseline expected of everyone, in and out of character.',
      rules: [
        {
          title: 'Respect the community',
          body: 'Harassment, hate speech, discrimination and targeted abuse are not tolerated anywhere in the community — in game, in voice or in community channels.',
        },
        {
          title: 'Staff decisions',
          body: 'Follow staff instructions during a situation. If you disagree with a decision, raise it afterwards through the appeal process rather than in the moment.',
        },
        {
          title: 'Exploits and third-party software',
          body: 'Cheats, mod menus, exploits and bug abuse are prohibited. Report any exploit you discover to staff instead of using it.',
        },
      ],
    },
    {
      id: 'roleplay',
      title: 'Roleplay standards',
      summary: 'What makes a scene believable and fair for everyone involved.',
      rules: [
        {
          title: 'Stay in character',
          body: 'Remain in character while in the city. Out-of-character discussion belongs in designated channels, not in active scenes.',
        },
        {
          title: 'Metagaming',
          body: 'Information learned outside of roleplay — streams, Discord, word of mouth — must not be used by your character.',
        },
        {
          title: 'Powergaming',
          body: 'Do not force outcomes on other players or perform actions that would be unrealistic or impossible for your character.',
        },
        {
          title: 'Value of life',
          body: 'Your character should value their life and react realistically to threats, injuries and danger.',
        },
      ],
    },
    {
      id: 'combat',
      title: 'Combat and initiation',
      summary: 'Conflict needs a reason, and every party deserves a chance to respond.',
      rules: [
        {
          title: 'Random deathmatch (RDM)',
          body: 'Attacking or killing another player without a valid roleplay reason and clear initiation is prohibited.',
        },
        {
          title: 'Vehicle deathmatch (VDM)',
          body: 'Using a vehicle as a weapon without valid roleplay reason is prohibited.',
        },
        {
          title: 'Clear initiation',
          body: 'Hostile action must be preceded by clear, understandable initiation that gives the other party a fair chance to respond.',
        },
      ],
    },
    {
      id: 'gangs',
      title: 'Gangs and criminal activity',
      summary: 'Organised crime is part of the story — within agreed limits.',
      rules: [
        {
          title: 'Recognised gangs',
          body: 'Gangs operate under the structure and limits approved by administration. Unapproved groups may not claim territory.',
        },
        {
          title: 'Wars',
          body: 'Gang wars must be declared and conducted under the war rules published by administration, and are recorded in the war archive.',
        },
      ],
    },
    {
      id: 'zones',
      title: 'Safe zones and new life',
      summary: 'Places and moments where conflict is off the table.',
      rules: [
        {
          title: 'Safe zones',
          body: 'Criminal activity and hostile action are not permitted in designated safe zones.',
        },
        {
          title: 'New life rule',
          body: 'After your character is downed and respawns, they do not remember the events that led to it and must not return to the scene.',
        },
      ],
    },
    {
      id: 'reports',
      title: 'Reports and appeals',
      summary: 'How problems are raised and decisions reviewed.',
      rules: [
        {
          title: 'Reporting',
          body: 'Report rule breaks through the official reporting channel with as much evidence as possible, such as clips and timestamps.',
        },
        {
          title: 'Appeals',
          body: 'Sanctions can be appealed through the official appeal process. Appeals are reviewed by a staff member who was not involved in the original decision.',
        },
      ],
    },
  ],
};
