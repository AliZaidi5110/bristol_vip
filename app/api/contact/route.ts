import { NextResponse, type NextRequest } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
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

  const payload = { name, email, message, at: new Date().toISOString() };

  if (hasKv()) {
    try {
      await kv.lpush("contact_messages", JSON.stringify(payload));
      return NextResponse.json({ ok: true });
    } catch {
      // fall through
    }
  }

  if (hasSupabase()) {
    try {
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      const { error } = await supabase.from("contact_messages").insert({ name, email, message });
      if (!error) return NextResponse.json({ ok: true });
    } catch {
      // fall through
    }
  }

  // No storage configured — still acknowledge so the public form isn't broken.
  console.info("[contact]", payload);
  return NextResponse.json({ ok: true });
}
