import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  getServiceSupabase,
  getTicketLink,
  SETTINGS_ROW_ID,
} from "@/lib/supabase";

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

/** Read the currently saved link (admin-only, avoids caching surprises). */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ticketLink = await getTicketLink();
  return NextResponse.json({ ticketLink });
}

/** Update the single settings row with a new ticket link. */
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

  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("site_settings")
      .update({ ticket_link: ticketLink, updated_at: new Date().toISOString() })
      .eq("id", SETTINGS_ROW_ID);

    if (error) {
      return NextResponse.json(
        { error: "Could not save. Check your Supabase configuration." },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Server is not configured for saving." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, ticketLink });
}
