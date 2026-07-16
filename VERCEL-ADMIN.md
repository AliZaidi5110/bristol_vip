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

## Contact form email — full Resend setup

The live form posts to `/api/contact`. Delivery uses **Resend first**, then **FormSubmit** as fallback.

### Option A — Resend (recommended)

1. Create a free account at [resend.com](https://resend.com) using **`bristolvip1@gmail.com`**  
   (sandbox mode can only deliver to the Resend account email)
2. Go to **API Keys → Create API Key** → copy `re_...`
3. In Vercel → Project → **Settings → Environment Variables**, add for Production + Preview:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | `re_...` from Resend |
| `CONTACT_TO_EMAIL` | `bristolvip1@gmail.com` |
| `CONTACT_FROM_EMAIL` | `Bristol VIP Website <onboarding@resend.dev>` |
| `NEXT_PUBLIC_SITE_URL` | `https://bristol-vip-pi.vercel.app` |

4. **Redeploy** the project (Deployments → … → Redeploy)
5. Test the contact form — email should arrive at `bristolvip1@gmail.com`
6. Check status anytime: `GET https://bristol-vip-pi.vercel.app/api/contact`

**Upgrade later (send to any address / custom from):**  
[resend.com/domains](https://resend.com/domains) → add `bristolvip.co.uk` → add DNS records → verify → set  
`CONTACT_FROM_EMAIL=Bristol VIP <hello@bristolvip.co.uk>`

### Option B — FormSubmit fallback (no Resend)

If Resend is missing or blocked, the API falls back to FormSubmit.

1. Submit the contact form once (or wait for the activation email)
2. Open **`bristolvip1@gmail.com`** (check Spam)
3. Click **Activate Form** in the FormSubmit email
4. Submit again — messages will arrive

### Common failures

| Symptom | Cause | Fix |
|---|---|---|
| Form shows "Email is not configured" | `RESEND_API_KEY` missing and FormSubmit not activated | Add Resend key **or** activate FormSubmit |
| Resend 403 / testing emails only | Resend account email ≠ `CONTACT_TO_EMAIL` | Sign up Resend with `bristolvip1@gmail.com`, or verify a domain |
| FormSubmit activation email | First-time inbox approval | Click Activate Form once |

---

## Save event edits from admin

**Option A — Vercel KV (recommended)**

Vercel → **Storage** → **Create KV** → **Connect** to your project → **Redeploy**

**Option B — GitHub token**

1. GitHub → **Settings** → **Developer settings** → **Fine-grained tokens**
2. Create token with **Contents: Read and write** on `bristol_vip` repo
3. Vercel → **Environment Variables** → add `GITHUB_TOKEN` = your token
4. **Redeploy**

Without either option, the admin dashboard is read-only.

---

## Point your main domain to the new site

Vercel → Project → Settings → **Domains** → add `bristol-vip.vercel.app` (or `www.bristolvip.co.uk`) to the **new** GitHub project — remove it from the old React project first.
