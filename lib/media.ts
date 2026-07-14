import { siteConfig } from "@/site.config";

/** Hero background video served from /public/videos/hero-compressed.mp4 */
export function getHeroVideoSrc(): string {
  return siteConfig.assets.heroVideo;
}
