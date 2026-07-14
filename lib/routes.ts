/**
 * Non-obvious admin login path. Change this to your own secret slug and keep it
 * private — it's the "front door" to the admin area. The dashboard itself lives
 * at /admin and is protected by the session cookie via middleware.
 */
export const ADMIN_LOGIN_PATH = "/vip-manage-2026";
export const ADMIN_DASHBOARD_PATH = "/admin";

/** Bumped to verify Vercel picked up the latest admin login fix. */
export const ADMIN_BUILD_TAG = "admin-v3-defaults";
