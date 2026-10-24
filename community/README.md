# Roleplay community website (pre-launch)

The public website for a FiveM roleplay community, built to go live **before the game server launches**. It covers
the community's identity, administration directory, gang archive, server rules and joining applications.

It lives in its own workspace. The Kerala travel platform in `client/` and `server/` is untouched.

```bash
npm install                 # from the repository root (npm workspaces)
npm run dev:community       # http://localhost:5174
npm run build:community     # → community/dist
npm run lint:community
```

## Stack

React 19 + Vite, React Router 7, custom CSS with design tokens, GSAP + ScrollTrigger, self-hosted variable fonts
(Cormorant Garamond for display, Manrope for text). No CSS framework, smooth-scroll library or 3D.

## Structure

```
src/
├── config/        site.js (name, launch state, nav, links, flags) · media.js (optional video slots)
├── styles/        tokens.css (colour, type, spacing, motion) · base.css (reset, primitives)
├── animation/     gsap.js (plugin registration) · useScene.js (scoped, reduced-motion aware, auto cleanup)
├── components/    layout/ (header, mobile menu, footer) · ui/ (buttons, status, hero) · art/ (generated city scenes)
├── data/          gangs.js · staff.js · rules.js. Content kept apart from presentation
├── services/      applications.js (submission client)
└── features/      home/ · gangs/ · admin/ · rules/ · apply/ · system/
```

## Content and honesty rules

| Area | Current state | How to make it real |
|---|---|---|
| Community name | Generic "Roleplay Community" | Set `VITE_COMMUNITY_NAME` |
| Logo | Neutral geometric mark | Replace `components/ui/Mark.jsx` |
| Imagery | Generated SVG city scenes (deterministic, no requests) | Add files to `public/media/` and set `image` on gang or staff entries, or set `media.introVideo` |
| Gangs | No official entries. Labelled placeholders in dev only, empty archive in production | Add entries to `data/gangs.js` (`VITE_GANGS_PREVIEW` overrides the preview) |
| Staff | Empty roster, live status "Not connected" | Add members to `data/staff.js`. Live status needs the backend integration |
| Rules | **Draft** based on common RP conventions, labelled as such | Replace `data/rules.js`, set `status: 'official'` and `lastUpdated` |
| Applications | Form validates. With no endpoint it says plainly that nothing was sent or stored | Set `VITE_APPLICATION_ENDPOINT` once the API exists |
| Social links | Hidden | Set `VITE_DISCORD_URL` and the other link variables |

The server status always reads "Not yet launched" (`launch.serverLive`) and no player counts are shown.

## Accessibility and motion

- Skip link, visible focus states, a keyboard-trapped mobile menu (Esc closes it), and an error summary on the form that links to each field.
- Content renders fully without JavaScript animation. GSAP only animates *from* hidden states, and uses opacity (never `visibility`), so content further down the page stays focusable.
- `prefers-reduced-motion` turns off every GSAP scene and CSS transition. The intro video never autoplays for reduced-motion users.
- Scroll effects are scrubbed parallax only. Nothing hijacks scrolling.

## Deployment note

The root `vercel.json` still deploys the travel platform. To deploy this site instead, point a separate Vercel project
at `community/` (framework: Vite, output: `dist`, SPA rewrite to `/index.html`).
