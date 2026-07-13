import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe session helpers (jose only — no Node-native deps), so they can be
 * imported from middleware which runs on the Edge runtime.
 */

export const SESSION_COOKIE = "bv_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET env var is missing or too short (min 16 chars).",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Create a signed session token marking the holder as the admin. */
export async function createSessionToken(): Promise<string> {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verify a session token. Returns true only for a valid, unexpired admin token. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
