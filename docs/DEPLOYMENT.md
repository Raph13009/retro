# Deployment — Product Retro Tool

Standard deployment uses **Vercel** (free tier) connected to a **GitLab** repository.
No custom domain, DNS, or Cloudflare configuration is required.

---

## Platform

| Item | Value |
|---|---|
| Platform | [Vercel](https://vercel.com) |
| Framework | Next.js (auto-detected; see `vercel.json`) |
| Repository | Lemonway / Product Team / Product Retro Tool (GitLab) |
| Database | Supabase (see `supabase/schema.sql`) |

---

## Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

These are the only two required variables. The deployment URL is resolved automatically from Vercel's built-in `VERCEL_URL` — no additional configuration needed.

---

## Deployment steps

1. **Create a Vercel account** at [vercel.com](https://vercel.com) (free)
2. **Add New Project** → choose **Import Git Repository** → connect GitLab
3. Select the **Product Retro Tool** repository
4. Vercel detects Next.js automatically — leave framework settings unchanged
5. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**
7. Use the generated `*.vercel.app` URL — share it with the team

Redeploy after changing environment variables.

---

## Cron job (keep-alive)

`vercel.json` configures a lightweight cron that pings `/api/keep-alive` every five days.
This writes a row to the `keep_alive` table to prevent Supabase Free projects from being paused due to inactivity.

**This cron is optional.** If the Supabase project is paused, resume it manually from the [Supabase Dashboard](https://supabase.com/dashboard) — no data is lost.

---

## App routes reference

| Path | Purpose |
|---|---|
| `/` | Marketing home |
| `/retro` | Create a retrospective room |
| `/room/[roomId]` | Live board |
| `/ongoing` | Redirects to `/` |

---

<details>
<summary>Legacy: custom domain + Cloudflare (optional)</summary>

This section describes the original `paraboll.online` production setup. **Not required for standard deployment.**

### DNS records (Cloudflare, DNS-only mode)

| Type | Name | Content |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | *(your Vercel CNAME from Project → Settings → Domains)* |

Use **DNS only** (grey cloud). Vercel provides SSL — orange-cloud proxy can cause double-proxy issues.

### Vercel domain configuration

1. **Project → Settings → Domains** → add `yourdomain.com` and `www.yourdomain.com`
2. Wait until both show **Valid**
3. Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` in Vercel environment variables

### Troubleshooting

| Problem | Check |
|---|---|
| Apex does not load | Apex `A` → `76.76.21.21`, domain Valid in Vercel |
| Certificate warning | Domain not yet Valid in Vercel; wait for DNS propagation |
| Wrong OG / canonical URL | `NEXT_PUBLIC_SITE_URL` set correctly in Vercel env |
| Redirect loop | Cloudflare "Always HTTPS" + Vercel redirect both enabled — disable one |

</details>
