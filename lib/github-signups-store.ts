import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SignupEntry } from "./signups";
import { hasGitHubWrite } from "./github-event-store";

const DEFAULT_REPO = "AliZaidi5110/bristol_vip";
const DEFAULT_BRANCH = "main";
const SIGNUPS_PATH = "data/signups.json";

function repo(): string {
  return process.env.GITHUB_REPO?.trim() || DEFAULT_REPO;
}

function branch(): string {
  return process.env.GITHUB_BRANCH?.trim() || DEFAULT_BRANCH;
}

function token(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

function parseSignups(json: unknown): SignupEntry[] {
  if (!json || typeof json !== "object") return [];
  const list = (json as { signups?: unknown }).signups;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item): item is SignupEntry =>
      Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as SignupEntry).id === "string" &&
          typeof (item as SignupEntry).email === "string",
      ),
  );
}

async function getFromLocalFile(): Promise<SignupEntry[]> {
  try {
    const filePath = path.join(process.cwd(), SIGNUPS_PATH);
    const raw = await readFile(filePath, "utf8");
    return parseSignups(JSON.parse(raw));
  } catch {
    return [];
  }
}

async function getFromRawUrl(): Promise<SignupEntry[]> {
  try {
    const url = `https://raw.githubusercontent.com/${repo()}/${branch()}/${SIGNUPS_PATH}?t=${Date.now()}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    });
    if (!res.ok) return [];
    return parseSignups(await res.json());
  } catch {
    return [];
  }
}

async function getFromGitHubApi(): Promise<SignupEntry[] | null> {
  const auth = token();
  if (!auth) return null;

  try {
    const apiBase = `https://api.github.com/repos/${repo()}/contents/${SIGNUPS_PATH}`;
    const res = await fetch(`${apiBase}?ref=${branch()}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${auth}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (res.status === 404) return [];
    if (!res.ok) {
      console.error("[signups] GitHub API read failed:", res.status);
      return null;
    }

    const meta = (await res.json()) as { content?: string };
    if (!meta.content) return [];
    const decoded = Buffer.from(meta.content.replace(/\n/g, ""), "base64").toString(
      "utf8",
    );
    return parseSignups(JSON.parse(decoded));
  } catch (err) {
    console.error("[signups] GitHub API read exception:", err);
    return null;
  }
}

export async function getSignupsFromGitHub(): Promise<SignupEntry[]> {
  // 1) Authenticated API (freshest)
  const fromApi = await getFromGitHubApi();
  if (fromApi && fromApi.length > 0) return fromApi;

  // 2) Public raw URL (works even if API token read fails)
  const fromRaw = await getFromRawUrl();
  if (fromRaw.length > 0) return fromRaw;

  // 3) API returned empty list intentionally
  if (fromApi) return fromApi;

  // 4) File bundled in this deployment
  return getFromLocalFile();
}

export async function setSignupsOnGitHub(
  signups: SignupEntry[],
): Promise<boolean> {
  if (!hasGitHubWrite()) return false;
  const auth = token();
  if (!auth) return false;

  const apiBase = `https://api.github.com/repos/${repo()}/contents/${SIGNUPS_PATH}`;
  const headers = {
    Authorization: `Bearer ${auth}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  let sha: string | undefined;
  try {
    const existing = await fetch(`${apiBase}?ref=${branch()}`, {
      headers,
      cache: "no-store",
    });
    if (existing.ok) {
      const meta = (await existing.json()) as { sha?: string };
      sha = meta.sha;
    }
  } catch {
    return false;
  }

  const payload = {
    signups,
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(apiBase, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Add mailing list signup (${signups[0]?.email ?? "update"})`,
        content: Buffer.from(JSON.stringify(payload, null, 2) + "\n").toString(
          "base64",
        ),
        branch: branch(),
        ...(sha ? { sha } : {}),
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[signups] GitHub save failed:", res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[signups] GitHub save exception:", err);
    return false;
  }
}

export { hasGitHubWrite };
