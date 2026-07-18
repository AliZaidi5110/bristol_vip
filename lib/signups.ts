import { randomUUID } from "node:crypto";
import { kv } from "@vercel/kv";
import { sendContactEmail } from "./email";
import {
  getSignupsFromGitHub,
  hasGitHubWrite,
  setSignupsOnGitHub,
} from "./github-signups-store";

export type SignupEntry = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  address: string;
  phone: string;
  gender: string;
  createdAt: string;
};

export type SignupPayload = {
  firstName: string;
  surname: string;
  email: string;
  address: string;
  phone: string;
  gender: string;
};

const KV_SIGNUPS_KEY = "site_signups";

function hasKv(): boolean {
  return Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  );
}

function normalizeList(raw: unknown): SignupEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is SignupEntry =>
      Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as SignupEntry).id === "string" &&
          typeof (item as SignupEntry).email === "string",
      ),
  );
}

async function getFromKv(): Promise<SignupEntry[] | null> {
  if (!hasKv()) return null;
  try {
    const stored = await kv.get<SignupEntry[]>(KV_SIGNUPS_KEY);
    // null = key missing → fall through to GitHub (do not treat as empty list)
    if (stored == null) return null;
    return normalizeList(stored);
  } catch {
    return null;
  }
}

async function setOnKv(signups: SignupEntry[]): Promise<boolean> {
  if (!hasKv()) return false;
  try {
    await kv.set(KV_SIGNUPS_KEY, signups);
    return true;
  } catch {
    return false;
  }
}

function mergeSignups(
  a: SignupEntry[],
  b: SignupEntry[],
): SignupEntry[] {
  const byEmail = new Map<string, SignupEntry>();
  for (const entry of [...a, ...b]) {
    const key = entry.email.toLowerCase();
    const prev = byEmail.get(key);
    if (!prev || entry.createdAt > prev.createdAt) {
      byEmail.set(key, entry);
    }
  }
  return [...byEmail.values()].sort((x, y) =>
    y.createdAt.localeCompare(x.createdAt),
  );
}

export async function getSignups(): Promise<SignupEntry[]> {
  const [fromKv, fromGitHub] = await Promise.all([
    getFromKv(),
    getSignupsFromGitHub(),
  ]);

  return mergeSignups(fromKv ?? [], fromGitHub);
}

async function notifyAdmin(entry: SignupEntry): Promise<boolean> {
  const result = await sendContactEmail({
    name: `${entry.firstName} ${entry.surname}`,
    email: entry.email,
    message: [
      "New mailing list sign-up from the website:",
      "",
      `First name: ${entry.firstName}`,
      `Surname: ${entry.surname}`,
      `Email: ${entry.email}`,
      `Phone: ${entry.phone}`,
      `Address: ${entry.address}`,
      `Gender: ${entry.gender}`,
      `Submitted: ${entry.createdAt}`,
    ].join("\n"),
  });
  return result.ok;
}

export async function addSignup(
  payload: SignupPayload,
): Promise<{ ok: true; entry: SignupEntry } | { ok: false; error: string }> {
  const entry: SignupEntry = {
    id: randomUUID(),
    firstName: payload.firstName,
    surname: payload.surname,
    email: payload.email.toLowerCase(),
    address: payload.address,
    phone: payload.phone,
    gender: payload.gender,
    createdAt: new Date().toISOString(),
  };

  const existing = await getSignups();
  if (existing.some((s) => s.email === entry.email)) {
    return {
      ok: false,
      error: "This email is already on the list.",
    };
  }

  const next = [entry, ...existing];

  let stored = false;

  // Prefer writing to every available backend so admin CSV stays in sync.
  if (hasKv()) {
    stored = (await setOnKv(next)) || stored;
  }
  if (hasGitHubWrite()) {
    stored = (await setSignupsOnGitHub(next)) || stored;
  }

  const emailed = await notifyAdmin(entry);

  if (stored || emailed) {
    return { ok: true, entry };
  }

  return {
    ok: false,
    error:
      "Sign-ups are not configured yet. Add GITHUB_TOKEN (and RESEND_API_KEY) in Vercel, then redeploy.",
  };
}

export function canStoreSignups(): boolean {
  return hasKv() || hasGitHubWrite();
}

export function signupsToCsv(signups: SignupEntry[]): string {
  const header = [
    "First Name",
    "Surname",
    "Email",
    "Address",
    "Phone",
    "Gender",
    "Submitted At",
  ];

  const escape = (value: string) => {
    const safe = value.replace(/\r?\n/g, " ").replace(/"/g, '""');
    return `"${safe}"`;
  };

  const rows = signups.map((s) =>
    [
      s.firstName,
      s.surname,
      s.email,
      s.address,
      s.phone,
      s.gender,
      s.createdAt,
    ]
      .map(escape)
      .join(","),
  );

  return [header.map(escape).join(","), ...rows].join("\r\n") + "\r\n";
}
