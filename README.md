# Retro

A realtime retrospective meeting MVP built with Next.js, TypeScript, Tailwind CSS, Supabase, and Supabase Realtime.

## Features

- Create shareable retrospective rooms.
- Join rooms with a locally stored name and avatar color.
- Realtime participants, columns, cards, votes, comments, reactions, and action items.
- Shared creator-controlled timer.
- Optional private writing mode with reveal.
- Voting phase with per-participant vote limits.
- Markdown export summary.

## Project Structure

```txt
app/
  page.tsx
  room/[roomId]/page.tsx
  layout.tsx
  globals.css
components/retro/
  ActionItemsPanel.tsx
  CommentDrawer.tsx
  ExportSummaryModal.tsx
  ParticipantsBar.tsx
  RetroApp.tsx
  RetroBoard.tsx
  RetroCard.tsx
  RetroColumn.tsx
  TimerControls.tsx
  VotingPanel.tsx
lib/
  retro/
    local-participant.ts
    timer.ts
    types.ts
  supabase/client.ts
  utils.ts
supabase/
  schema.sql
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

If `npm` is not installed on your Mac, use the bundled local helper instead:

```bash
./scripts/npm-local.sh install
```

2. Create a Supabase project, open the SQL editor, and run:

```sql
-- paste the contents of supabase/schema.sql
```

3. Copy the environment template:

```bash
cp .env.example .env.local
```

4. Add your project values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

5. Start the app:

```bash
npm run dev
```

If `npm` is not installed globally:

```bash
./scripts/dev-local.sh
```

Open `http://localhost:3000`.

## Notes

This MVP uses link-accessible rooms and local participant identity instead of user accounts. RLS is enabled on every table, but the included policies intentionally allow anon clients to read and write room data for a simple no-login MVP. For production, add authenticated users, membership checks, and stricter RLS policies.
