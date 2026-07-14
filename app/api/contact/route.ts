import { NextResponse, type NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/email";

export const runtime = "nodejs";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let name = "";
  let email = "";
  let message = "";

  try {
    const body = await request.json();
    name = typeof body?.name === "string" ? body.name.trim() : "";
    email = typeof body?.email === "string" ? body.email.trim() : "";
    message = typeof body?.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }
  if (!message || message.length > 2000) {
    return NextResponse.json(
      { error: "Please enter a message (max 2000 chars)." },
      { status: 400 },
    );
  }

  const result = await sendContactEmail({ name, email, message });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
