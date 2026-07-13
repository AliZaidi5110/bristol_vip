import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyAdminPassword,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/auth";

export const runtime = "nodejs";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    password = "";
  }

  let ok = false;
  try {
    ok = await verifyAdminPassword(password);
  } catch {
    return NextResponse.json(
      { error: "Server is not configured for login." },
      { status: 500 },
    );
  }

  if (!ok) {
    recordFailedAttempt(ip);
    // Generic error — no hint about what was wrong.
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  resetRateLimit(ip);

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
