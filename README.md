# Bristol VIP — Events Website

A modern, mobile-first events promotion website built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Premium nightlife aesthetic (black + gold), a live-editable "Get Tickets" link, and a minimal password-protected admin dashboard.

> The "Get Tickets" button URL is **never hardcoded** — it's read from Supabase on every page load, so an admin can change where tickets point instantly with no redeploy.

---

## Features

- Full-screen hero, About, Upcoming Event spotlight, Gallery, and Contact sections
- Sticky navbar with a persistent "Get Tickets" CTA
- Subtle scroll-triggered fade-in animations
- `next/image` optimised imagery
- Contact form saved to a Supabase table
- Secret-path admin login (single password, bcrypt-hashed, no username)
- Signed, httpOnly session cookie (JWT via `jose`) + middleware-protected `/admin`
- Login rate limiting (5 attempts / 15 min per IP)
- One-field admin dashboard to edit the live ticket link

---

## Tech stack

| Layer     | Choice                                   |
| --------- | ---------------------------------------- |
| Framework | Next.js 14 (App Router)                  |
| Language  | TypeScript                               |
| Styling   | Tailwind CSS                             |
| Database  | Supabase (Postgres + RLS)                |
| Auth      | Custom: bcrypt password + `jose` JWT     |
| Icons     | lucide-react                             |
| Hosting   | Vercel                                   |

---

## 1. Prerequisites

- Node.js 18.17+ (tested on Node 22)
- A free [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account (for deployment)

---

## 2. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local      # (Windows PowerShell: Copy-Item .env.example .env.local)

# 3. Fill in .env.local — see sections 3 & 4 below

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000.

The site runs immediately with placeholder images and a fallback ticket link, even before Supabase is configured.

---

## 3. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates:
   - `site_settings` — the single row (`id = 1`) holding the ticket link, with **public read** RLS and no public write.
   - `contact_messages` — stores contact-form submissions (server-write only).
3. Go to **Project Settings → API** and copy these into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server only — keep secret**)

To seed your real ticket link now, either edit the row in the Supabase Table Editor or just set it later from the admin dashboard.

---

## 4. Admin password & session secret

Set the admin password (bcrypt-hashed — the plaintext is never stored):

```bash
npm run hash-password "your-super-secret-password"
```

Copy the printed `ADMIN_PASSWORD_HASH='...'` line into `.env.local`.

Then generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output into `SESSION_SECRET` in `.env.local`.

Your `.env.local` should now have all five variables from `.env.example`.

---

## 5. Admin access

- **Login page (secret path):** `/vip-manage-2026`
- **Dashboard (protected):** `/admin` — redirects to the login page if you're not signed in.

Log in with your password, edit the **Current Event Ticket Link**, and hit **Save**. The change is live across the whole site immediately.

### Changing the secret admin path

The path is defined once in [`lib/routes.ts`](lib/routes.ts) (`ADMIN_LOGIN_PATH`). To change it:

1. Update `ADMIN_LOGIN_PATH` in `lib/routes.ts`.
2. Rename the folder `app/vip-manage-2026/` to match your new slug (e.g. `app/my-secret-path/`).

Keep this path private — it's the front door to the admin area.

---

## 6. Rebranding (make it yours)

Everything brand-related lives in one file: [`site.config.ts`](site.config.ts).

- **Brand name, tagline, description, contact email**
- **Social links** (Instagram / WhatsApp / TikTok — delete any you don't use)
- **About copy**, **featured event** details
- **Image paths**

### Images & hero video

Your event photos are in `public/images/` and wired up in `site.config.ts`.

| Asset | File used |
| ----- | --------- |
| Hero video (background) | `public/videos/IMG_8136.MP4` |
| Hero poster / fallback | `IMG_8028.JPG.jpeg` (crowd under tent) |
| Event flyer | `IMG_8018.JPG.jpeg` (Rum Punch carnival stage) |
| About section | `IMG_8036.JPG.jpeg` (live performer) |
| Gallery | All 12 photos from `public/images/` |

**Hero video:** copy your WhatsApp file `IMG_8136.MP4` into `public/videos/IMG_8136.MP4`. Until it's there, the hero shows the crowd photo as a fallback. The video autoplays muted behind all hero text once the file is in place.

To swap any image, replace the file in `public/images/` or update the paths in `site.config.ts` under `assets`.

---

## 7. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, **Add New → Project** and import the repo.
3. Under **Environment Variables**, add all five from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD_HASH`
   - `SESSION_SECRET`
4. Click **Deploy**.

Cookies are marked `secure` in production, so admin login works over HTTPS on your Vercel domain automatically.

> **Note on rate limiting:** login attempt limiting is in-memory (per serverless instance) and resets on cold starts. It's enough to blunt brute-force attempts for a single-admin site. For stronger guarantees, back it with a shared store like Upstash Redis.

---

## Project structure

```
app/
  api/
    admin/login/route.ts      # verify password, issue session cookie
    admin/logout/route.ts     # clear session cookie
    admin/ticket-link/route.ts# read/update the ticket link (service role)
    contact/route.ts          # save contact-form messages
  admin/page.tsx              # protected dashboard
  vip-manage-2026/page.tsx    # secret-path login
  layout.tsx  page.tsx  globals.css  robots.ts
components/
  Navbar, Hero, About, EventSpotlight, Gallery, Footer,
  ContactForm, GetTicketsButton, Reveal, SocialIcons
  admin/LoginForm.tsx  admin/AdminDashboard.tsx
lib/
  supabase.ts   # public + service-role clients, getTicketLink()
  auth.ts       # bcrypt password verify + rate limiter (Node runtime)
  session.ts    # jose JWT sign/verify (Edge-safe, used by middleware)
  routes.ts     # admin path constants
middleware.ts   # protects /admin/*
site.config.ts  # all brand content
supabase/schema.sql
scripts/hash-password.mjs
```

---

## Security notes

- The **service-role key** is only ever used in server-side API routes — never shipped to the browser.
- The admin password is stored **only** as a bcrypt hash in an env var, never in the database or in code.
- The ticket link is fetched from Supabase server-side on every request (`dynamic = "force-dynamic"`), so updates are instant.
- `/admin` is protected by middleware that verifies the signed session cookie on every request.
