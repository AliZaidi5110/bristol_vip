# Admin login & Vercel setup

## Two different URLs — use the right one

| URL | What it is |
|---|---|
| [bristol-vip.vercel.app](https://bristol-vip.vercel.app) | **Old React site** — no admin, no contact email |
| `bristol-q2few67j6-…vercel.app` | **New Next.js site** (preview deployment URL — changes per deploy) |
| `bristol-vip-ali-zaidis-projects-…vercel.app` | **New Next.js site** (project URL) |

If `bristol-q2few67j6-…` shows a **Vercel login page**, that is **deployment protection**, not your app admin. Disable it: Vercel → Project → Settings → Deployment Protection → Off → Redeploy.

---

## Admin login (new Next.js site)

**Login page:** `https://YOUR-NEXTJS-URL.vercel.app/vip-manage-2026`

**Dashboard:** `https://YOUR-NEXTJS-URL.vercel.app/admin`

**Password:** `BristolVIP2026!` (also in `DEPLOY-ENV.txt` on your PC)

From the dashboard you can update:

- Event title, date, location, description
- Ticket link (powers every “Get Tickets” button)

---

## Required Vercel environment variables

Copy from `C:\Users\LENOVO\OneDrive\Desktop\Bristol Vip\DEPLOY-ENV.txt`:

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | Admin session |
| `ADMIN_PASSWORD_HASH` | Admin password |
| `TICKET_LINK` | Fallback ticket URL |
| `RESEND_API_KEY` | **Contact form → email** to `bristolvip1@gmail.com` |

After adding vars → **Redeploy**.

---

## Contact form email (Resend)

1. Create a free account at [resend.com](https://resend.com)
2. Create an API key → add as `RESEND_API_KEY` in Vercel
3. Redeploy

Until `RESEND_API_KEY` is set, the contact form will show an error when submitted.

With the free tier, use the default sender `onboarding@resend.dev` (no extra env needed). To send from your own domain later, verify the domain in Resend and set `CONTACT_FROM_EMAIL`.

---

## Save event edits from admin (Vercel KV)

Vercel → **Storage** → **Create KV** → **Connect** to your project → **Redeploy**

Without KV, event fields fall back to `site.config.ts` / `TICKET_LINK` env var (admin save will fail).

---

## Point your main domain to the new site

Vercel → Project → Settings → **Domains** → add `bristol-vip.vercel.app` (or `www.bristolvip.co.uk`) to the **new** GitHub project — remove it from the old React project first.
