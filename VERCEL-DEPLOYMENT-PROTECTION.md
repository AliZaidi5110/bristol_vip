# FIX: Admin URL shows "Log in to Vercel" instead of Bristol VIP

## The real problem

URLs like these are **not your admin page**:

- `bristol-q2few67j6-…vercel.app`
- `bristol-hb1fjw0sf-…vercel.app`

They show **Vercel’s own login screen** because **Deployment Protection** is ON.
Your site is blocked **before** anyone can reach `/vip-manage-2026`.

This is **not** the Bristol VIP admin password issue.

---

## Fix in 2 minutes (Vercel dashboard)

1. Open **https://vercel.com/dashboard**
2. Log in with your Vercel account (Google/GitHub/email)
3. Click your **bristol-vip** project (from GitHub `bristol_vip`)
4. Go to **Settings** → **Deployment Protection**
5. Under **Production** (and **Preview** if you use preview links):
   - Turn **OFF** “Vercel Authentication” / set protection to **None**
6. Click **Save**
7. Go to **Deployments** → latest → **⋯** → **Redeploy**

---

## After that — correct URLs

**Admin login:**

`https://bristol-vip-ali-zaidis-projects-6760b54c.vercel.app/vip-manage-2026`

**Password:** `BristolVIP2026!`

You should see the **Bristol VIP** black/gold login card — **not** “Log in to Vercel”.

---

## URL guide

| URL | What it is |
|---|---|
| `bristol-q2few67j6-…` / `bristol-hb1fjw0sf-…` | Temporary preview deploy IDs — change every deploy |
| `bristol-vip-ali-zaidis-projects-…vercel.app` | Main production URL for the project |
| `bristol-vip.vercel.app` | Old separate React site — **not** this project |

---

## Optional: custom domain

In Vercel → Project → **Settings** → **Domains**, add `bristol-vip.vercel.app` or your own domain and point it to this GitHub project.
