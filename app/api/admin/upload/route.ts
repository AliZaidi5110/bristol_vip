import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { uploadImageToGitHub } from "@/lib/github-upload";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB raw upload before compression

async function requireAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const entry = form.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed (JPG, PNG, WebP)." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Please use a file under 8 MB." },
      { status: 400 },
    );
  }

  const input = Buffer.from(await file.arrayBuffer());

  let compressed: Buffer;
  try {
    compressed = await sharp(input, { failOn: "none" })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Could not process that image. Try another file." },
      { status: 400 },
    );
  }

  const stamp = Date.now();
  const filename = `event-${stamp}.jpg`;
  const result = await uploadImageToGitHub(filename, compressed);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true, path: result.path });
}
