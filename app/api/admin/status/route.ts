import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/admin-config";
import { isUsingBuiltInCredentials } from "@/lib/admin-credentials";

export const runtime = "nodejs";

/** Public health check — no secrets exposed. */
export async function GET() {
  return NextResponse.json({
    configured: isAdminConfigured(),
    usingDefaults: isUsingBuiltInCredentials(),
  });
}
