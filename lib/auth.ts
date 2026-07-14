import bcrypt from "bcryptjs";
import { DEFAULT_ADMIN_PASSWORD } from "./admin-credentials";

// Re-export the edge-safe session helpers so server code has one import site.
export {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "./session";

function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

/**
 * Verify admin password. Supports ADMIN_PASSWORD (plain, easiest on Vercel) or
 * ADMIN_PASSWORD_HASH (bcrypt). Runs in Node runtime only — not middleware.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;

  const plain = cleanEnv(process.env.ADMIN_PASSWORD);
  if (plain) {
    return password === plain;
  }

  const hash = cleanEnv(process.env.ADMIN_PASSWORD_HASH);
  if (hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  return password === DEFAULT_ADMIN_PASSWORD;
}

/* -------------------------------------------------------------------------- */
/*  Simple in-memory rate limiter                                             */
/* -------------------------------------------------------------------------- */
/**
 * Limits login attempts per IP. This lives in module memory, so it resets on
 * serverless cold starts / redeploys and is per-instance — good enough to blunt
 * brute-force attempts for a single-admin site. For stronger guarantees back
 * this with a shared store (e.g. Upstash Redis).
 */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

type Bucket = { count: number; resetAt: number };
const attempts = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const bucket = attempts.get(ip);

  if (!bucket || now > bucket.resetAt) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - bucket.count - 1,
    retryAfterSeconds: 0,
  };
}

/** Record a failed attempt. Successful logins should call resetRateLimit. */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const bucket = attempts.get(ip);
  if (!bucket || now > bucket.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function resetRateLimit(ip: string): void {
  attempts.delete(ip);
}
