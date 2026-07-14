/** Returns true when admin login can work on this deployment. */
export function isAdminConfigured(): boolean {
  const secret = process.env.SESSION_SECRET;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  return Boolean(secret && secret.length >= 16 && hash && hash.startsWith("$2"));
}
