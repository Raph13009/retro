# Deployment — paraboll.online

This guide covers production hosting on **Vercel**, DNS via **Cloudflare**, and HTTPS. It does not change application code.

## Hosting

| Item | Value |
|------|--------|
| Platform | [Vercel](https://vercel.com) |
| Framework | Next.js (see `vercel.json`) |
| Repository | https://github.com/Raph13009/retro |
| Production URL | https://paraboll.online |

## Required environment variables (Vercel)

Set these in **Project → Settings → Environment Variables** (Production):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://paraboll.online
```

`NEXT_PUBLIC_SITE_URL` drives canonical URLs, sitemap, and Open Graph metadata (`lib/brand.ts`).

Redeploy after changing environment variables.

---

## Current DNS expectations

Vercel assigns a **project-specific** CNAME for `www`. Confirm yours in **Vercel → Project → Settings → Domains**.

Example (verify in dashboard):

| Host | Type | Value |
|------|------|--------|
| `www` | CNAME | `eac19711751eb66b.vercel-dns-017.com` |
| `@` (apex) | A | `76.76.21.21` |

Do **not** point the apex to registrar parking IPs (e.g. old `216.198.79.1`).

---

## Cloudflare setup

### 1. Add the site

1. Create a [Cloudflare](https://cloudflare.com) account (Free plan is fine).
2. **Add a site** → `paraboll.online`.
3. Import or review DNS records; remove parking / stale records.

### 2. DNS records

Use **DNS only** (grey cloud) for Vercel-hosted records. Vercel already provides SSL and CDN; orange-cloud proxy can cause double-proxy and certificate issues on first setup.

| Type | Name | Content | Proxy |
|------|------|---------|--------|
| A | `@` | `76.76.21.21` | DNS only |
| CNAME | `www` | *(your Vercel CNAME from dashboard)* | DNS only |

Remove:

- Old apex `A` to parking IPs
- Duplicate or conflicting `www` records

Optional (if Vercel shows a verification record):

| Type | Name | Content |
|------|------|---------|
| TXT | `_vercel` | *(value from Vercel)* |

### 3. SSL/TLS (Cloudflare)

While records are **DNS only**:

- **SSL/TLS encryption mode**: Full (default is fine).
- Let **Vercel** terminate HTTPS for visitors.

If you later enable **proxied** (orange cloud) records:

- Set encryption to **Full (strict)**.
- Read [Vercel + Cloudflare](https://vercel.com/guides/using-cloudflare-with-vercel) before enabling proxy.

Avoid enabling **Always Use HTTPS** on Cloudflare **and** conflicting redirects on Vercel—pick one layer for HTTP→HTTPS.

### 4. Nameservers

Cloudflare will provide two nameservers, e.g.:

```
ada.ns.cloudflare.com
bob.ns.cloudflare.com
```

At your **domain registrar** (where you bought `paraboll.online`), replace existing nameservers (e.g. `*.dns-parking.com`) with Cloudflare’s.

Propagation: often 15 minutes–48 hours.

---

## Vercel domain configuration

1. Open the project on Vercel → **Settings → Domains**.
2. Add:
   - `paraboll.online`
   - `www.paraboll.online`
3. Wait until both show **Valid**.
4. Choose a **primary** domain and redirect the other:
   - Recommended: primary `paraboll.online`, redirect `www` → apex (or the reverse—stay consistent everywhere).

---

## Verification checklist

After DNS propagates:

```bash
dig paraboll.online A +short
# Expected: 76.76.21.21

dig www.paraboll.online CNAME +short
# Expected: your-project.vercel-dns-017.com (or similar)

curl -sI https://paraboll.online | head -5
# Expected: HTTP/2 200 or 307/308 redirect, valid TLS
```

Online tools:

- https://dnschecker.org — global DNS propagation
- https://www.ssllabs.com/ssltest/ — certificate chain quality

---

## Corporate networks (Fortinet / “Newly Registered Domain”)

Symptoms: site works on mobile data but is blocked on company Wi‑Fi.

Common causes:

1. **Misconfigured DNS** (apex not pointing to Vercel) — fix with the records above.
2. **Newly Registered Domain (NRD)** filters — new domains may be categorized cautiously for days or weeks; a clean DNS + valid public HTTPS helps reputation over time.
3. **SSL inspection** on corporate networks — users may see a Fortinet-issued certificate; that is local policy, not a public misconfiguration.

Cloudflare does **not** bypass corporate security policies. For internal use, request a category review or allowlist from IT using evidence of a valid site and business purpose.

---

## App routes (reference)

| Path | Purpose |
|------|---------|
| `/` | Marketing home |
| `/retro` | Create a retrospective room |
| `/room/[roomId]` | Live board |
| `/ongoing` | Redirects to `/` (`next.config.ts`) |

---

## Regenerating brand assets (optional)

If logo files under `public/brand/` change:

```bash
npm run brand:assets
```

Requires Python 3 and Pillow (`pip3 install Pillow`).

---

## Quick troubleshooting

| Problem | Check |
|---------|--------|
| Apex does not load | Apex `A` → `76.76.21.21`, domain Valid in Vercel |
| `www` works, apex does not | Apex record missing or still on parking IP |
| Certificate warning | Domain not Valid in Vercel; wait for DNS propagation |
| Wrong OG/canonical URL | `NEXT_PUBLIC_SITE_URL` in Vercel Production env |
| Redirect loop | Cloudflare “Always HTTPS” + Vercel redirect both enabled |
