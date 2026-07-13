/**
 * Generate a bcrypt hash for your admin password.
 *
 * Usage:
 *   npm run hash-password "your-super-secret-password"
 *
 * Copy the printed hash into your .env.local as ADMIN_PASSWORD_HASH.
 * The plaintext password is never stored anywhere.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('\nUsage: npm run hash-password "your-password"\n');
  process.exit(1);
}

const SALT_ROUNDS = 12;
const hash = bcrypt.hashSync(password, SALT_ROUNDS);

console.log("\nAdd this line to your .env.local (wrap in single quotes):\n");
console.log(`ADMIN_PASSWORD_HASH='${hash}'\n`);
