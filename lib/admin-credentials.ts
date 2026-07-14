function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

/** Used when SESSION_SECRET is not set on Vercel. Override via env for production. */
export const DEFAULT_SESSION_SECRET =
  "bristol-vip-events-2026-session-secret-key";

/** Used when ADMIN_PASSWORD is not set on Vercel. Override via env for production. */
export const DEFAULT_ADMIN_PASSWORD = "BristolVIP2026!";

export function getSessionSecret(): string {
  const env = cleanEnv(process.env.SESSION_SECRET);
  if (env.length >= 16) return env;
  return DEFAULT_SESSION_SECRET;
}

export function hasEnvSessionSecret(): boolean {
  return cleanEnv(process.env.SESSION_SECRET).length >= 16;
}

export function hasEnvAdminPassword(): boolean {
  const plain = cleanEnv(process.env.ADMIN_PASSWORD);
  const hash = cleanEnv(process.env.ADMIN_PASSWORD_HASH);
  return (
    plain.length >= 8 || (hash.startsWith("$2") && hash.length > 20)
  );
}

/** True when login relies on built-in defaults instead of Vercel env vars. */
export function isUsingBuiltInCredentials(): boolean {
  return !hasEnvSessionSecret() || !hasEnvAdminPassword();
}

/** Admin login always works — env vars override the built-in defaults. */
export function isAdminConfigured(): boolean {
  return true;
}

export function getConfiguredAdminPassword(): string {
  return cleanEnv(process.env.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
}
