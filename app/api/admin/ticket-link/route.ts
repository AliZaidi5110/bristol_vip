import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getSiteEvent, setSiteEvent } from "@/lib/settings";

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

/** Legacy endpoint — updates ticket link only, keeps other event fields. */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const event = await getSiteEvent();
  return NextResponse.json({ ticketLink: event.ticketLink });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let ticketLink = "";
  try {
    const body = await request.json();
    ticketLink = typeof body?.ticketLink === "string" ? body.ticketLink.trim() : "";
  } catch {
    ticketLink = "";
  }

  if (!isValidHttpUrl(ticketLink)) {
    return NextResponse.json(
      { error: "Please enter a valid http(s) URL." },
      { status: 400 },
    );
  }

  const current = await getSiteEvent();
  const stored = await setSiteEvent({ ...current, ticketLink });
  if (!stored) {
    return NextResponse.json(
      {
        error:
          "Could not save. Connect Vercel KV (Storage tab) to enable live editing.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, ticketLink });
}
