function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

/** Returns true when admin login can work on this deployment. */
export function isAdminConfigured(): boolean {
  const secret = cleanEnv(process.env.SESSION_SECRET);
  const hash = cleanEnv(process.env.ADMIN_PASSWORD_HASH);
  const plain = cleanEnv(process.env.ADMIN_PASSWORD);
  const hasSecret = secret.length >= 16;
  const hasPassword =
    (hash.startsWith("$2") && hash.length > 20) ||
    (plain.length >= 8);
  return hasSecret && hasPassword;
}
