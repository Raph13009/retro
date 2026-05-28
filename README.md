# paraboll.online

<p align="center">
  <b>Realtime retrospectives for modern product teams.</b><br/>
  Built with Next.js, TypeScript, Tailwind, Supabase, and Supabase Realtime.
</p>

<p align="center">
  <a href="https://paraboll.online"><img alt="Live Site" src="https://img.shields.io/badge/live-paraboll.online-8FE7E1?style=for-the-badge" /></a>
  <img alt="Stack" src="https://img.shields.io/badge/stack-next.js%20%7C%20supabase%20%7C%20typescript-B7F0D1?style=for-the-badge" />
  <img alt="Status" src="https://img.shields.io/badge/status-active%20development-FFD9C7?style=for-the-badge" />
</p>

---

## What this project is

`paraboll.online` is a realtime retro board focused on speed, clarity, and team flow.

It is designed for teams that want:
- zero-friction room creation,
- fast collaborative reflection,
- structured voting and discussion,
- clear action items before the meeting ends.

---

## Core capabilities

- **Instant rooms**: create and share a retro room link in seconds.
- **Realtime collaboration**: participants, cards, votes, reactions, comments, and action items sync live.
- **Facilitated flow**: reflection, grouping, voting, and discussion phases.
- **Private writing mode**: optional hidden reflection cards before reveal.
- **Timer control**: facilitator-managed pacing.
- **Summary/export**: markdown-ready retro output.

---

## Architecture snapshot

```txt
app/
  (tool)/
    retro/
    room/[roomId]/
  page.tsx
  layout.tsx
  robots.ts
  sitemap.ts

components/
  brand/
  marketing/
  retro/

lib/
  brand.ts
  marketing/
  retro/
  supabase/

supabase/
  schema.sql
```

---

## Local development

### 1) Install dependencies

```bash
npm install
```

### 2) Provision Supabase schema

Create a Supabase project, open SQL editor, and execute:

```sql
-- paste supabase/schema.sql
```

### 3) Configure environment

```bash
cp .env.example .env.local
```

Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4) Run the app

```bash
npm run dev
```

Then open `http://localhost:3000`.

---

## Product + SEO routes

- Home: `/`
- App entry: `/retro`
- Room: `/room/[roomId]`
- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`

---

## Collaboration

Contributions are welcome.

If you want to improve the codebase, feel free to:
- propose features,
- suggest UX or copy improvements,
- submit bug fixes,
- refactor internals for maintainability/performance.

Open an issue or PR here:

**https://github.com/Raph13009/retro**

---

## Security note

Current MVP behavior is intentionally no-login and link-accessible.
RLS is enabled, but policies are permissive by design for fast collaborative onboarding.
For production-hardening, add auth, membership checks, and stricter table-level policies.
