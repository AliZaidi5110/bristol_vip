import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getSiteEvent, setSiteEvent, type SiteEventSettings } from "@/lib/settings";

export const runtime = "nodejs";

async function requireAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseEventBody(body: unknown): SiteEventSettings | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const ticketLink =
    typeof raw.ticketLink === "string" ? raw.ticketLink.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  const date = typeof raw.date === "string" ? raw.date.trim() : "";
  const location = typeof raw.location === "string" ? raw.location.trim() : "";

  if (!isValidHttpUrl(ticketLink)) return null;
  if (!title || title.length > 200) return null;
  if (!description || description.length > 2000) return null;
  if (!date || date.length > 120) return null;
  if (!location || location.length > 200) return null;

  return { ticketLink, title, description, date, location };
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const event = await getSiteEvent();
  return NextResponse.json({ event });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: SiteEventSettings | null = null;
  try {
    const body = await request.json();
    event = parseEventBody(body);
  } catch {
    event = null;
  }

  if (!event) {
    return NextResponse.json(
      { error: "Please fill in all event fields with valid values." },
      { status: 400 },
    );
  }

  const stored = await setSiteEvent(event);
  if (!stored) {
    return NextResponse.json(
      {
        error:
          "Could not save. Connect Vercel KV (Storage tab) to enable live editing.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, event });
}
