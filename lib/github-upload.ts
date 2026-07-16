import { hasGitHubWrite } from "./github-event-store";

const DEFAULT_REPO = "AliZaidi5110/bristol_vip";
const DEFAULT_BRANCH = "main";

function repo(): string {
  return process.env.GITHUB_REPO?.trim() || DEFAULT_REPO;
}

function branch(): string {
  return process.env.GITHUB_BRANCH?.trim() || DEFAULT_BRANCH;
}

function token(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

/**
 * Upload a binary file into public/images/uploads/ via the GitHub Contents API.
 * Returns the public site path, e.g. /images/uploads/event-123.jpg
 */
export async function uploadImageToGitHub(
  filename: string,
  bytes: Buffer,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  if (!hasGitHubWrite()) {
    return {
      ok: false,
      error:
        "Uploads need GITHUB_TOKEN in Vercel (same token used to save events).",
    };
  }

  const auth = token();
  if (!auth) {
    return { ok: false, error: "GITHUB_TOKEN is not configured." };
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const repoPath = `public/images/uploads/${safeName}`;
  const apiBase = `https://api.github.com/repos/${repo()}/contents/${repoPath}`;
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
    // ignore — treat as new file
  }

  try {
    const res = await fetch(apiBase, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Upload event photo ${safeName}`,
        content: bytes.toString("base64"),
        branch: branch(),
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[upload] GitHub failed:", res.status, errText);
      return {
        ok: false,
        error: "Could not upload image to GitHub. Check GITHUB_TOKEN permissions.",
      };
    }

    return { ok: true, path: `/images/uploads/${safeName}` };
  } catch (err) {
    console.error("[upload] exception:", err);
    return { ok: false, error: "Upload failed. Please try again." };
  }
}
