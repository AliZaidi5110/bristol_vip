# Admin login — fix for Vercel

## Use the correct URL

`https://bristol-vip.vercel.app` is an **older React site** — it does **not** include `/vip-manage-2026`.

Your **new Next.js site** (from GitHub) is here:

**https://bristol-vip-ali-zaidis-projects-6760b54c.vercel.app/vip-manage-2026**

Admin dashboard (after login):

**https://bristol-vip-ali-zaidis-projects-6760b54c.vercel.app/admin**

---

## Login details

- **Password:** `BristolVIP2026!` (from `npm run setup` / `DEPLOY-ENV.txt`)

---

## If you see "Server is not configured"

Add these in **Vercel → bristol-vip project → Settings → Environment Variables**:

| Variable | Where to get the value |
|---|---|
| `SESSION_SECRET` | `DEPLOY-ENV.txt` on your PC |
| `ADMIN_PASSWORD_HASH` | `DEPLOY-ENV.txt` on your PC |
| `TICKET_LINK` | Your Eventbrite / ticket URL |

Then **Redeploy** the project.

File on your machine:

`C:\Users\LENOVO\OneDrive\Desktop\Bristol Vip\DEPLOY-ENV.txt`

---

## Use your own domain later

In Vercel → Project → Settings → Domains, point `bristol-vip.vercel.app` (or `www.bristolvip.co.uk`) to the **new** `bristol-vip` GitHub project — not the old React deployment.

---

## Enable saving ticket links in admin

Vercel → **Storage** → **Create KV** → **Connect** to `bristol-vip` → **Redeploy**

Without KV, ticket links can still be set via the `TICKET_LINK` environment variable.
