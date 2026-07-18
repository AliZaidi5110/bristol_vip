import { randomUUID } from "node:crypto";
import { kv } from "@vercel/kv";
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

export async function getSignups(): Promise<SignupEntry[]> {
  const fromKv = await getFromKv();
  if (fromKv) {
    return [...fromKv].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const fromGitHub = await getSignupsFromGitHub();
  return [...fromGitHub].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

  if (await setOnKv(next)) {
    return { ok: true, entry };
  }

  if (hasGitHubWrite()) {
    const saved = await setSignupsOnGitHub(next);
    if (saved) return { ok: true, entry };
  }

  return {
    ok: false,
    error:
      "Sign-ups are not configured yet. Add GITHUB_TOKEN in Vercel environment variables, then redeploy.",
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
