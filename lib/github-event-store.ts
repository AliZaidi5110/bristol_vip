import { readFile } from "node:fs/promises";
import path from "node:path";
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

function parseEvent(json: unknown): SiteEventSettings | null {
  if (!json || typeof json !== "object") return null;
  const raw = json as Partial<SiteEventSettings>;
  if (!raw.ticketLink || typeof raw.ticketLink !== "string") return null;
  return {
    ticketLink: raw.ticketLink.trim(),
    title: typeof raw.title === "string" ? raw.title : "",
    description: typeof raw.description === "string" ? raw.description : "",
    date: typeof raw.date === "string" ? raw.date : "",
    location: typeof raw.location === "string" ? raw.location : "",
  };
}

/** Read the file shipped with the deployment (updated after admin GitHub saves redeploy). */
async function getEventFromLocalFile(): Promise<SiteEventSettings | null> {
  try {
    const filePath = path.join(process.cwd(), EVENT_PATH);
    const raw = await readFile(filePath, "utf8");
    return parseEvent(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Authenticated Contents API — bypasses raw.githubusercontent.com CDN cache. */
async function getEventFromGitHubApi(): Promise<SiteEventSettings | null> {
  const auth = token();
  if (!auth) return null;

  try {
    const apiBase = `https://api.github.com/repos/${repo()}/contents/${EVENT_PATH}`;
    const res = await fetch(`${apiBase}?ref=${branch()}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${auth}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) return null;

    const meta = (await res.json()) as { content?: string; encoding?: string };
    if (!meta.content) return null;

    const decoded = Buffer.from(meta.content, "base64").toString("utf8");
    return parseEvent(JSON.parse(decoded));
  } catch {
    return null;
  }
}

async function getEventFromRawUrl(): Promise<SiteEventSettings | null> {
  try {
    const url = `https://raw.githubusercontent.com/${repo()}/${branch()}/${EVENT_PATH}?t=${Date.now()}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    return parseEvent(await res.json());
  } catch {
    return null;
  }
}

export async function getEventFromGitHub(): Promise<SiteEventSettings | null> {
  // 1) API with token — freshest admin save, no CDN lag
  const fromApi = await getEventFromGitHubApi();
  if (fromApi) return fromApi;

  // 2) File in the current deployment
  const fromLocal = await getEventFromLocalFile();
  if (fromLocal) return fromLocal;

  // 3) Public raw URL (cache-busted)
  return getEventFromRawUrl();
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

  const body = JSON.stringify({
    message: "Update event from Bristol VIP admin",
    content: Buffer.from(JSON.stringify(settings, null, 2) + "\n").toString(
      "base64",
    ),
    branch: branch(),
    ...(sha ? { sha } : {}),
  });

  try {
    const res = await fetch(apiBase, { method: "PUT", headers, body });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[admin] GitHub save failed:", res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[admin] GitHub save exception:", err);
    return false;
  }
}

export function getGitHubSetupHint(): string {
  return (
    "Add GITHUB_TOKEN in Vercel env vars (repo write access) or connect Vercel KV in Storage tab, then redeploy."
  );
}
