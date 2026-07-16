/**
 * Compress gallery / event photos for fast web delivery.
 * Usage: node scripts/optimize-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imagesRoot = path.join(root, "public", "images");

const MAX_EDGE = 1600;
const JPEG_QUALITY = 72;
const WEBP_QUALITY = 70;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
      if (/^logo/i.test(entry.name)) continue;
      files.push(full);
    }
  }
  return files;
}

async function optimizeFile(file) {
  const stat = await fs.stat(file);
  const before = stat.size;
  // Skip already-tiny assets
  if (before < 180_000) return { file, skipped: true, before, after: before };

  const ext = path.extname(file).toLowerCase();
  const buf = await fs.readFile(file);
  const image = sharp(buf, { failOn: "none" }).rotate();
  const meta = await image.metadata();

  let pipeline = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  let outBuf;
  let outPath = file;

  if (ext === ".png") {
    // Prefer JPEG for photos (much smaller than PNG)
    outPath = file.replace(/\.png$/i, ".jpg");
    outBuf = await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
      .toBuffer();
  } else if (ext === ".webp") {
    outBuf = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
  } else {
    outBuf = await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
      .toBuffer();
  }

  // Only write if meaningfully smaller
  if (outBuf.length >= before * 0.95 && outPath === file) {
    return { file, skipped: true, before, after: before };
  }

  await fs.writeFile(outPath, outBuf);
  if (outPath !== file) {
    await fs.unlink(file).catch(() => {});
  }

  return {
    file: outPath,
    skipped: false,
    before,
    after: outBuf.length,
    converted: outPath !== file,
    dims: `${meta.width}x${meta.height}`,
  };
}

const files = await walk(imagesRoot);
console.log(`Optimizing ${files.length} images…`);

let saved = 0;
for (const file of files) {
  try {
    const result = await optimizeFile(file);
    if (result.skipped) {
      console.log(`  skip  ${(result.before / 1e6).toFixed(2)}MB  ${path.relative(root, file)}`);
      continue;
    }
    const delta = result.before - result.after;
    saved += delta;
    console.log(
      `  ok    ${(result.before / 1e6).toFixed(2)}MB → ${(result.after / 1e6).toFixed(2)}MB  ${path.relative(root, result.file)}`,
    );
  } catch (err) {
    console.error(`  FAIL  ${file}:`, err.message);
  }
}

console.log(`\nSaved ${(saved / 1e6).toFixed(2)} MB total.`);
