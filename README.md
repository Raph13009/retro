# paraboll.online

<p align="center">
  <img src="./public/brand/newLogo2.png" alt="paraboll.online logo" width="132" />
</p>

<p align="center">
  <b>Realtime retrospectives for modern product teams.</b><br />
  Calm UX, fast facilitation loops, and instant collaboration.
</p>

<p align="center">
  <a href="https://paraboll.online"><img alt="Live Site" src="https://img.shields.io/badge/live-paraboll.online-8FE7E1?style=for-the-badge&logo=vercel&logoColor=1a1828" /></a>
  <img alt="Framework" src="https://img.shields.io/badge/framework-Next.js-111111?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="Language" src="https://img.shields.io/badge/language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Database" src="https://img.shields.io/badge/backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=0b1f14" />
  <img alt="Realtime" src="https://img.shields.io/badge/realtime-on-FFBFA8?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://github.com/Raph13009/retro">Contribute on GitHub</a>
</p>

---

## TL;DR

`paraboll.online` is a realtime retrospective board built for speed and clarity:

- create a room in seconds,
- run structured retro phases,
- vote and prioritize together,
- leave with actionable follow-ups.

No heavy setup. No account wall for MVP flow. Just a link and a team.

---

## Product Highlights

### Live collaborative board
- realtime participants, cards, votes, comments, reactions, and action items
- instant board updates via Supabase Realtime

### Facilitator-first flow
- phase-based retro lifecycle (reflect -> group -> vote -> discuss)
- creator-controlled timer and vote limits
- “private writing” mode to reduce anchoring bias

### Actionable output
- discussion + prioritization in one canvas
- exportable markdown summary at the end

---

## Screens / Brand

> Add screenshots in this section as the product evolves.

<p>
  <img src="./public/brand/newLogo2.png" alt="Brand mark" width="96" />
</p>

Brand and UI reference:
- `.claude/BRAND_AND_UI_GUIDE.md`

---

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Postgres + Realtime)
- **State / UX**: client-side state + realtime subscriptions
- **Deployment target**: Vercel-compatible

---

## Repository Structure

```txt
app/
  (tool)/
    layout.tsx
    retro/
      page.tsx
      layout.tsx
    room/[roomId]/
      page.tsx
  layout.tsx
  page.tsx
  robots.ts
  sitemap.ts
  globals.css

components/
  brand/
  marketing/
  retro/

lib/
  brand.ts
  marketing/
  retro/
  supabase/

public/
  brand/

supabase/
  schema.sql
```

---

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Provision database

Create a Supabase project and run:

```sql
-- paste supabase/schema.sql
```

### 3) Configure environment variables

```bash
cp .env.example .env.local
```

Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4) Start dev server

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Routes

- Home: `/`
- App entry: `/retro`
- Room: `/room/[roomId]`
- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`

---

## Realtime Model (High Level)

```txt
Browser Clients
   |
   | Supabase JS client
   v
Supabase Realtime Channels
   |
   v
Postgres (rooms, participants, cards, votes, comments, reactions, action_items)
```

All active clients subscribe to relevant room entities and render updates immediately.

---

## Contribution Guide

Community contributions are welcome and encouraged.

You can contribute by:
- proposing new templates,
- improving UX and accessibility,
- hardening Supabase policies,
- adding tests and quality tooling,
- improving docs or onboarding.

### Suggested PR scope

- Keep PRs focused and reviewable.
- Include intent + behavior changes in the PR description.
- Attach before/after screenshots for UI changes when possible.

Repository:
- https://github.com/Raph13009/retro

---

## Security / Production Notes

Current MVP behavior is intentionally link-accessible and no-login for speed.

RLS is enabled but permissive by design for anonymous collaboration.
Before production hardening, add:
- authenticated users,
- room membership checks,
- stricter per-table policies,
- audit/observability around writes.

---

## License

No explicit license file is currently included.
If you plan to accept wider external contributions, add a LICENSE (MIT/Apache-2.0/etc.) to clarify usage terms.
