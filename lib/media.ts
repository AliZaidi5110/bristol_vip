import fs from "fs";
import path from "path";
import { siteConfig } from "@/site.config";

const COMPRESSED = "/videos/hero-compressed.mp4";

/**
 * Prefer the compressed hero video when it exists (created by
 * `npm run compress-video`). Falls back to the full WhatsApp export.
 */
export function getHeroVideoSrc(): string {
  const compressedPath = path.join(process.cwd(), "public", COMPRESSED);
  if (fs.existsSync(compressedPath)) return COMPRESSED;
  return siteConfig.assets.heroVideo;
}
