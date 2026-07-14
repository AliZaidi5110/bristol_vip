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
| `ADMIN_PASSWORD` | Admin password (`BristolVIP2026!`) — **use this, not the hash** |
| `TICKET_LINK` | Fallback ticket URL |
| `RESEND_API_KEY` | Optional — better email delivery for contact form |

After adding vars → **Redeploy**.

---

## Contact form email

The contact form works **without any setup** — it forwards submissions to `bristolvip1@gmail.com` automatically.

**First time only:** FormSubmit sends a one-time activation email to `bristolvip1@gmail.com`. Open it and click **Activate Form** (check spam). After that, every form submission arrives in your inbox.

**Optional (recommended later):** Add `RESEND_API_KEY` from [resend.com](https://resend.com) in Vercel for more reliable delivery from your own domain.

---

## Save event edits from admin (Vercel KV)

Vercel → **Storage** → **Create KV** → **Connect** to your project → **Redeploy**

Without KV, event fields fall back to `site.config.ts` / `TICKET_LINK` env var (admin save will fail).

---

## Point your main domain to the new site

Vercel → Project → Settings → **Domains** → add `bristol-vip.vercel.app` (or `www.bristolvip.co.uk`) to the **new** GitHub project — remove it from the old React project first.
