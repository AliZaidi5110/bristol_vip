import { NextResponse, type NextRequest } from "next/server";
import { addSignup } from "@/lib/signups";

export const runtime = "nodejs";

const GENDERS = new Set([
  "Female",
  "Male",
  "Non-binary",
  "Prefer not to say",
  "Other",
]);

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let firstName = "";
  let surname = "";
  let email = "";
  let address = "";
  let phone = "";
  let gender = "";
  let honeypot = "";

  try {
    const body = await request.json();
    firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
    surname = typeof body?.surname === "string" ? body.surname.trim() : "";
    email = typeof body?.email === "string" ? body.email.trim() : "";
    address = typeof body?.address === "string" ? body.address.trim() : "";
    phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    gender = typeof body?.gender === "string" ? body.gender.trim() : "";
    honeypot = typeof body?.website === "string" ? body.website.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!firstName || firstName.length > 80) {
    return NextResponse.json({ error: "Please enter your first name." }, { status: 400 });
  }
  if (!surname || surname.length > 80) {
    return NextResponse.json({ error: "Please enter your surname." }, { status: 400 });
  }
  if (!isEmail(email) || email.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (!address || address.length > 300) {
    return NextResponse.json({ error: "Please enter your address." }, { status: 400 });
  }
  if (!phone || phone.length > 40) {
    return NextResponse.json({ error: "Please enter your phone number." }, { status: 400 });
  }
  if (!GENDERS.has(gender)) {
    return NextResponse.json({ error: "Please select a gender option." }, { status: 400 });
  }

  const result = await addSignup({
    firstName,
    surname,
    email,
    address,
    phone,
    gender,
  });

  if (!result.ok) {
    const status = result.error.includes("already") ? 409 : 503;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
