import type { SiteEventSettings } from "./settings";

const DEFAULT_REPO = "AliZaidi5110/bristol_vip";
const DEFAULT_BRANCH = "main";
const EVENT_PATH = "data/site-event.json";

function repo(): string {
  return process.env.GITHUB_REPO?.trim() || DEFAULT_REPO;
}

function branch(): string {
  return process.env.GITHUB_BRANCH?.trim() || DEFAULT_BRANCH;
}

function token(): string | null {
  const value = process.env.GITHUB_TOKEN?.trim();
  return value || null;
}

export function hasGitHubWrite(): boolean {
  return Boolean(token());
}

export function hasGitHubRead(): boolean {
  return true;
}

function rawUrl(): string {
  return `https://raw.githubusercontent.com/${repo()}/${branch()}/${EVENT_PATH}`;
}

export async function getEventFromGitHub(): Promise<SiteEventSettings | null> {
  try {
    const res = await fetch(rawUrl(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Partial<SiteEventSettings>;
    if (!json?.ticketLink) return null;
    return json as SiteEventSettings;
  } catch {
    return null;
  }
}

export async function setEventOnGitHub(
  settings: SiteEventSettings,
): Promise<boolean> {
  const auth = token();
  if (!auth) return false;

  const apiBase = `https://api.github.com/repos/${repo()}/contents/${EVENT_PATH}`;
  const headers = {
    Authorization: `Bearer ${auth}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  let sha: string | undefined;
  try {
    const existing = await fetch(`${apiBase}?ref=${branch()}`, { headers });
    if (existing.ok) {
      const meta = (await existing.json()) as { sha?: string };
      sha = meta.sha;
    }
  } catch {
    return false;
  }

  const body = JSON.stringify(
    {
      message: "Update event from Bristol VIP admin",
      content: Buffer.from(JSON.stringify(settings, null, 2) + "\n").toString(
        "base64",
      ),
      branch: branch(),
      ...(sha ? { sha } : {}),
    },
    null,
    0,
  );

  try {
    const res = await fetch(apiBase, { method: "PUT", headers, body });
    return res.ok;
  } catch {
    return false;
  }
}

export function getGitHubSetupHint(): string {
  return (
    "Add GITHUB_TOKEN in Vercel env vars (repo write access) or connect Vercel KV in Storage tab, then redeploy."
  );
}
